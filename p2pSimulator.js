/**
 * AAROHAN CHRONOS // P2P NETWORK SIMULATOR
 *
 * Browser-side simulation of ledger gossip and node activity.
 *
 * IMPORTANT:
 * This class does NOT create a real P2P connection, IPFS node, socket,
 * transport, consensus network, or cryptographic verification layer.
 * It exists only to provide deterministic UI/network activity for the
 * prototype until a real transport layer is implemented.
 */

const DEFAULT_INTERVAL_MS = 2500;
const DEFAULT_MAX_FEED_ENTRIES = 100;

const SIMULATION_EVENTS = Object.freeze([
  {
    type: "NODE",
    message: "Simulated mesh node heartbeat received.",
  },
  {
    type: "SYNC",
    message: "Simulated ledger state synchronization completed.",
  },
  {
    type: "GOSSIP",
    message: "Simulated ledger gossip propagated to peer set.",
  },
  {
    type: "VERIFY",
    message: "Simulated peer packet passed local format validation.",
  },
  {
    type: "MESH",
    message: "Simulated mesh topology remains within configured bounds.",
  },
]);

export class P2PSimulator {
  constructor(
    feedElementId = "gossip-feed",
    {
      intervalMs = DEFAULT_INTERVAL_MS,
      maxFeedEntries = DEFAULT_MAX_FEED_ENTRIES,
      random = Math.random,
      now = () => new Date(),
    } = {}
  ) {
    if (!feedElementId || typeof feedElementId !== "string") {
      throw new TypeError("feedElementId must be a non-empty string.");
    }

    if (!Number.isFinite(intervalMs) || intervalMs <= 0) {
      throw new RangeError("intervalMs must be greater than zero.");
    }

    if (!Number.isInteger(maxFeedEntries) || maxFeedEntries <= 0) {
      throw new RangeError("maxFeedEntries must be a positive integer.");
    }

    if (typeof random !== "function") {
      throw new TypeError("random must be a function.");
    }

    if (typeof now !== "function") {
      throw new TypeError("now must be a function.");
    }

    this.feedElementId = feedElementId;
    this.intervalMs = intervalMs;
    this.maxFeedEntries = maxFeedEntries;
    this.random = random;
    this.now = now;

    this.timer = null;
    this.running = false;
    this.eventCount = 0;
  }

  get feedElement() {
    if (typeof document === "undefined") {
      return null;
    }

    return document.getElementById(this.feedElementId);
  }

  start() {
    if (this.running) {
      return;
    }

    this.running = true;

    this.timer = window.setInterval(() => {
      this.emitSimulatedEvent();
    }, this.intervalMs);
  }

  stop() {
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }

    this.running = false;
  }

  destroy() {
    this.stop();

    const feed = this.feedElement;

    if (feed) {
      feed.replaceChildren();
    }

    this.eventCount = 0;
  }

  emitSimulatedEvent() {
    const index = Math.floor(
      this.random() * SIMULATION_EVENTS.length
    );

    const event = SIMULATION_EVENTS[index];

    this.pushEvent(event.message, event.type);
  }

  pushEvent(message, type = "SYS") {
    if (typeof message !== "string" || message.trim() === "") {
      throw new TypeError("message must be a non-empty string.");
    }

    const normalizedType =
      typeof type === "string" && type.trim() !== ""
        ? type.trim().toUpperCase()
        : "SYS";

    const timestamp = this.formatTimestamp(this.now());

    this.eventCount += 1;

    const entry = `[${timestamp}] [${normalizedType}] ${message}`;

    this.appendFeedEntry(entry, normalizedType);

    return {
      id: this.eventCount,
      timestamp,
      type: normalizedType,
      message,
      simulated: true,
    };
  }

  appendFeedEntry(text, type) {
    const feed = this.feedElement;

    if (!feed) {
      return;
    }

    const entry = document.createElement("div");

    entry.textContent = text;
    entry.dataset.eventType = type;
    entry.className = "text-slate-400";

    feed.prepend(entry);

    while (feed.children.length > this.maxFeedEntries) {
      feed.removeChild(feed.lastElementChild);
    }
  }

  formatTimestamp(date) {
    const normalizedDate =
      date instanceof Date ? date : new Date(date);

    if (Number.isNaN(normalizedDate.getTime())) {
      throw new TypeError("Invalid simulation timestamp.");
    }

    return normalizedDate.toISOString().slice(11, 23);
  }

  getStatus() {
    return {
      running: this.running,
      simulated: true,
      intervalMs: this.intervalMs,
      eventCount: this.eventCount,
      feedElementId: this.feedElementId,
    };
  }
}

export {
  DEFAULT_INTERVAL_MS,
  DEFAULT_MAX_FEED_ENTRIES,
  SIMULATION_EVENTS,
};