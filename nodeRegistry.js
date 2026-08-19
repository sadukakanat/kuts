/**
 * AAROHAN CHRONOS // V2 VERIFIED NODE REGISTRY
 * Manages the lifecycle states of nodes and evaluates transition eligibility.
 */

const VALID_NODE_STATES = Object.freeze([
  "DISCOVERED",
  "REGISTERED",
  "ATTESTED",
  "ACTIVE",
  "DEGRADED",
  "SUSPENDED",
  "REVOKED"
]);

export class NodeRegistry {
  constructor({ requiredGlobalNodes = 34, requiredPrimaryNodes = 144 } = {}) {
    this.requiredGlobalNodes = requiredGlobalNodes;
    this.requiredPrimaryNodes = requiredPrimaryNodes;
    this.nodes = new Map(); // Map<nodeId, NodeRecord>
  }

  registerNode(nodeId, { type = "PRIMARY", region = "UNKNOWN", publicKey = null } = {}) {
    if (!nodeId) {
      throw new Error("nodeId is required for registration.");
    }

    const nodeRecord = {
      nodeId,
      type,
      region,
      publicKey,
      status: "REGISTERED",
      registeredAt: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    };

    this.nodes.set(nodeId, nodeRecord);
    return { registered: true, node: { ...nodeRecord } };
  }

  updateNodeStatus(nodeId, newStatus) {
    if (!VALID_NODE_STATES.includes(newStatus)) {
      throw new TypeError(`Invalid node state: ${newStatus}`);
    }

    const node = this.nodes.get(nodeId);
    if (!node) {
      return { success: false, reason: "NODE_NOT_FOUND" };
    }

    node.status = newStatus;
    node.lastSeen = new Date().toISOString();
    this.nodes.set(nodeId, node);

    return { success: true, node: { ...node } };
  }

  /**
   * Evaluates board transition eligibility dynamically from the verified registry.
   */
  auditTransitionEligibility() {
    let activeGlobalCount = 0;
    let activePrimaryCount = 0;

    for (const node of this.nodes.values()) {
      if (node.status === "ACTIVE" || node.status === "ATTESTED") {
        if (node.type === "GLOBAL") {
          activeGlobalCount += 1;
        } else if (node.type === "PRIMARY") {
          activePrimaryCount += 1;
        }
      }
    }

    const globalRealized = activeGlobalCount >= this.requiredGlobalNodes;
    const primaryRealized = activePrimaryCount >= this.requiredPrimaryNodes;
    const fullyRealized = globalRealized && primaryRealized;

    return {
      status: fullyRealized ? "FULLY_REALIZED" : (globalRealized || primaryRealized ? "PARTIALLY_REALIZED" : "PENDING"),
      fullyRealized,
      activeGlobalCount,
      activePrimaryCount,
      requiredGlobalNodes: this.requiredGlobalNodes,
      requiredPrimaryNodes: this.requiredPrimaryNodes,
      globalProgress: Math.min(1, activeGlobalCount / this.requiredGlobalNodes),
      primaryProgress: Math.min(1, activePrimaryCount / this.requiredPrimaryNodes)
    };
  }
}