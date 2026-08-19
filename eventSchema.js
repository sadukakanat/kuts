// Updated EventFactory snippet in events/eventSchema.js
export class EventFactory {
  constructor({ nodeId, actorId, version = "2.0" }) {
    if (!nodeId || !actorId) {
      throw new Error("EventFactory requires a valid nodeId and actorId.");
    }
    this.nodeId = nodeId;
    this.actorId = actorId;
    this.version = version;
    this.sequence = 0;
    this.lastHash = "0".repeat(64);
  }

  async createEvent(type, payload, nonce) {
    if (!VALID_EVENT_TYPES.includes(type)) {
      throw new TypeError(`Invalid event type: ${type}`);
    }

    this.sequence += 1;
    const timestamp = new Date().toISOString();

    const eventTemplate = {
      id: crypto.randomUUID ? crypto.randomUUID() : `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      version: this.version,
      nodeId: this.nodeId,
      actorId: this.actorId,
      timestamp,
      sequence: this.sequence,
      nonce: nonce || Math.floor(Math.random() * 1_000_000_000),
      payload: payload || {},
      previousHash: this.lastHash, // Automatically links the previous hash
      signature: null
    };

    // Compute and update hash chain pointer for the next event
    this.lastHash = await this.computeEventHash(eventTemplate);
    return eventTemplate;
  }

  async computeEventHash(event) {
    const canonicalString = JSON.stringify({ ...event, signature: null });
    const encoder = new TextEncoder();
    const data = encoder.encode(canonicalString);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
```[cite: 1]

---

### 2. Preventing Nonce Memory Leaks (`EventVerificationGate`)
* **The Problem:** The `usedNonces` `Map` grows indefinitely without cleanup, leading to a memory leak[cite: 1].
* **The Solution:** Implement a sliding window eviction policy or a maximum capacity cap per node (e.g., keeping only the last 10,000 nonces) or utilize a time-to-live cache structure.

```javascript
// Addition to EventVerificationGate in verification/eventVerifier.js
const MAX_NONCES_PER_NODE = 10000;

// Inside verifyEvent method, after validating the nonce:
if (!this.usedNonces.has(nodeId)) {
  this.usedNonces.set(nodeId, new Set());
}
const nodeNonces = this.usedNonces.get(nodeId);

if (nodeNonces.has(nonce)) {
  return { accepted: false, reason: "NONCE_REUSED", message: `Nonce has already been consumed.` };
}

// Enforce size cap to prevent memory leaks
if (nodeNonces.size >= MAX_NONCES_PER_NODE) {
  const oldestNonce = nodeNonces.values().next().value;
  nodeNonces.delete(oldestNonce);
}
nodeNonces.add(nonce);
```[cite: 1]

---

### 3. Mitigating LocalStorage Quota Failures (`OfflineClientQueue`)
* **The Problem:** Writing unverified events directly to `localStorage` can throw an unhandled `QuotaExceededError` when storage fills up[cite: 1].
* **The Solution:** Wrap `localStorage` writes in a `try...catch` block and implement an automatic FIFO (First-In, First-Out) trimming mechanism that drops or logs the oldest queued events when storage limits are approached.

```javascript
// Updated enqueueEvent method in client/offlineQueue.js
enqueueEvent(event) {
  const queue = this.getQueue();
  queue.push({
    ...event,
    queuedAt: new Date().toISOString(),
    syncStatus: "PENDING"
  });

  try {
    localStorage.setItem(this.storageKey, JSON.stringify(queue));
  } catch (e) {
    if (e.name === "QuotaExceededError" || e.code === 22) {
      // FIFO eviction: drop oldest 20% of queue to free space
      queue.splice(0, Math.ceil(queue.length * 0.2));
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(queue));
      } catch (retryError) {
        console.error("[STORAGE] Critical: LocalStorage quota permanently exhausted.", retryError);
        return { queued: false, reason: "QUOTA_EXCEEDED" };
      }
    } else {
      throw e;
    }
  }
  return { queued: true, queueLength: queue.length };
}
```[cite: 1]

---

### 4. Securing Client-Side Trust Boundaries
* **The Problem:** Relying on client-side JavaScript for board transitions and custodial privileges is vulnerable to local runtime tampering[cite: 1].
* **The Solution:** 
  * Treat `CustodialGuard` and `BoardTransitionController` purely as **UI view helpers** rather than security enforcers[cite: 1].
  * Require all state-changing actions (such as finalizing board transitions or minting large amounts) to be signed by an authorized private key and validated by an authoritative backend validator or multi-signature consensus network before ledger commitment.