/**
 * AAROHAN CHRONOS // V2 OFFLINE-FIRST CLIENT QUEUE
 * Manages local event persistence and synchronization queues.
 */

export class OfflineClientQueue {
  constructor(storageKey = "chronos_offline_queue") {
    this.storageKey = storageKey;
  }

  /**
   * Saves an unverified event locally while offline.
   */
  enqueueEvent(event) {
    const queue = this.getQueue();
    queue.push({
      ...event,
      queuedAt: new Date().toISOString(),
      syncStatus: "PENDING"
    });
    localStorage.setItem(this.storageKey, JSON.stringify(queue));
    return { queued: true, queueLength: queue.length };
  }

  /**
   * Retrieves all pending offline events.
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
   * Removes an event from the offline queue after successful ledger synchronization.
   */
  removeEvent(eventId) {
    let queue = this.getQueue();
    queue = queue.filter(evt => evt.id !== eventId);
    localStorage.setItem(this.storageKey, JSON.stringify(queue));
    return { remainingLength: queue.length };
  }

  clearQueue() {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(this.storageKey);
    }
  }
}