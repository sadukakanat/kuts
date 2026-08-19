/**
 * AAROHAN CHRONOS // V2 NETWORK TRANSPORT ABSTRACTION
 * Defines the unified transport interface and simulation transport adapter.
 */

export class TransportInterface {
  async connect() { throw new Error("Not implemented"); }
  async disconnect() { throw new Error("Not implemented"); }
  async publish(event) { throw new Error("Not implemented"); }
  subscribe(handler) { throw new Error("Not implemented"); }
  getStatus() { throw new Error("Not implemented"); }
}

export class SimulationTransport extends TransportInterface {
  constructor({ latencyMs = 500 } = {}) {
    super();
    this.latencyMs = latencyMs;
    this.connected = false;
    this.subscribers = [];
  }

  async connect() {
    this.connected = true;
    return { connected: true, mode: "SIMULATION" };
  }

  async disconnect() {
    this.connected = false;
    return { connected: false };
  }

  async publish(event) {
    if (!this.connected) {
      throw new Error("Transport is not connected.");
    }

    // Simulate network transmission delay
    await new Promise((resolve) => setTimeout(resolve, this.latencyMs));

    // Broadcast back to local subscribers for simulation feedback
    this.subscribers.forEach((handler) => {
      handler({ type: "REMOTE_ECHO", event });
    });

    return { published: true, transport: "SIMULATION", timestamp: new Date().toISOString() };
  }

  subscribe(handler) {
    if (typeof handler !== "function") {
      throw new TypeError("Subscriber handler must be a function.");
    }
    this.subscribers.push(handler);
    return () => {
      this.subscribers = this.subscribers.filter((h) => h !== handler);
    };
  }

  getStatus() {
    return {
      connected: this.connected,
      transportType: "SimulationTransport",
      latencyMs: this.latencyMs,
      subscribersCount: this.subscribers.length
    };
  }
}