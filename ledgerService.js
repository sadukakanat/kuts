/**
 * AAROHAN CHRONOS // V2 PERSISTENT LEDGER SERVICE
 * Maintains the event log, state projections, and audit trail.
 */

import { KINES_PER_DYNE } from "../minting/mintingEngine.js";

export class PersistentLedgerService {
  constructor() {
    this.events = []; // Immutable event store
    this.nodes = new Map(); // Node registry projection
    this.ledgerState = {
      stateVersion: "2.0",
      totalKines: 0,
      totalDynes: 0,
      totalPulses: 0,
      transitionState: "PENDING",
      lastEventId: null,
      lastEventHash: "0".repeat(64)
    };
    this.auditLog = [];
  }

  /**
   * Commits a verified event to the ledger and updates projections.
   */
  commitEvent(event, verificationResult) {
    if (!verificationResult.accepted) {
      this.logAudit("REJECTED", event, verificationResult.message);
      return { committed: false, reason: verificationResult.reason };
    }

    // Append to immutable event store
    this.events.push(event);

    // Update ledger pointers
    this.ledgerState.lastEventId = event.id;
    this.ledgerState.lastEventHash = event.previousHash; // In a full build, compute new hash

    // Project state based on event type
    this.projectState(event);

    this.logAudit("COMMITTED", event, "Event successfully committed to authoritative ledger.");
    return { committed: true, ledgerState: { ...this.ledgerState } };
  }

  /**
   * Projects events onto state handlers (Event Sourcing Pattern).
   */
  projectState(event) {
    switch (event.type) {
      case "MINT_COMMITTED":
      case "PULSE_VERIFIED": {
        const payload = event.payload || {};
        const kines = Number(payload.proposedKines || payload.sessionKines || 0);
        this.ledgerState.totalKines += kines;
        this.ledgerState.totalDynes = this.ledgerState.totalKines / KINES_PER_DYNE;
        this.ledgerState.totalPulses += 1;
        break;
      }
      case "NODE_REGISTERED": {
        const payload = event.payload || {};
        this.nodes.set(event.nodeId, {
          nodeId: event.nodeId,
          status: "REGISTERED",
          region: payload.region || "UNKNOWN",
          registeredAt: event.timestamp
        });
        break;
      }
      default:
        // Other event types processed as needed
        break;
    }
  }

  logAudit(status, event, message) {
    this.auditLog.push({
      timestamp: new Date().toISOString(),
      status,
      eventId: event.id,
      eventType: event.type,
      nodeId: event.nodeId,
      message
    });
  }

  getDashboardState() {
    return {
      ledgerState: { ...this.ledgerState },
      totalEvents: this.events.length,
      registeredNodesCount: this.nodes.size,
      auditLogSummary: this.auditLog.slice(-5) // Last 5 audit items
    };
  }
}