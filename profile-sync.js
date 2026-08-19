/**
 * AAROHAN CHRONOS // V2 PROFILE & CREDENTIAL SYNC MANAGER
 * Manages local offline persistence queues and synchronizes user profiles,
 * academy progress, and referral metadata back to the network core.
 */

export class ProfileSyncManager {
  constructor({ 
    storageKey = "kuts_offline_sync_queue",
    endpoint = "/api/v2/mesh/sync" 
  } = {}) {
    this.storageKey = storageKey;
    this.endpoint = endpoint;
    this.isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    
    // Bind event listeners for network status changes
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => this.handleNetworkStatusChange(true));
      window.addEventListener("offline", () => this.handleNetworkStatusChange(false));
    }
  }

  /**
   * Enqueues an offline action (e.g., Academy enrollment, progress, or referral attribution)
   */
  enqueueSyncItem(actionType, payload) {
    const queue = this.getQueue();
    const syncItem = {
      id: "sync_" + Math.random().toString(36).substr(2, 9),
      actionType,
      payload,
      queuedAt: new Date().toISOString(),
      syncStatus: "PENDING"
    };

    queue.push(syncItem);
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(queue));
    } catch (e) {
      console.error("[SYNC] Storage quota exceeded while queuing profile sync item.", e);
      return { success: false, reason: "QUOTA_EXCEEDED" };
    }

    // Attempt immediate flush if online
    if (this.isOnline) {
      this.flushQueue();
    }

    return { success: true, itemId: syncItem.id, queueLength: queue.length };
  }

  /**
   * Retrieves all pending sync records from local storage
   */
  getQueue() {
    if (typeof localStorage === "undefined") {
      return [];
    }
    const data = localStorage.getItem(this.storageKey);
    try {
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Flushes the pending queue to the server mesh/ledger
   */
  async flushQueue() {
    const queue = this.getQueue();
    if (queue.length === 0 || !this.isOnline) return;

    const remainingQueue = [];

    for (const item of queue) {
      try {
        // Simulated network synchronization transmission
        const success = await this.transmitToServer(item);
        if (!success) {
          remainingQueue.push(item);
        }
      } catch (err) {
        console.warn(`[SYNC] Failed to synchronize item ${item.id}:`, err);
        remainingQueue.push(item);
      }
    }

    localStorage.setItem(this.storageKey, JSON.stringify(remainingQueue));
  }

  async transmitToServer(item) {
    // In a fully decentralized deployment, this bridges to the local node relay or IPFS anchor.
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true); // Simulated successful sync broadcast
      }, 500);
    });
  }

  handleNetworkStatusChange(online) {
    this.isOnline = online;
    if (online) {
      console.info("[SYNC] Network connection restored. Flushing offline profile sync queue...");
      this.flushQueue();
    } else {
      console.info("[SYNC] Network connection lost. Operating in offline queue-retention mode.");
    }
  }

  clearQueue() {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(this.storageKey);
    }
  }
}