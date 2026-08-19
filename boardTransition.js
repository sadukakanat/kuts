/**
 * AAROHAN CHRONOS // BOARD TRANSITION CONTROLLER
 *
 * Tracks the application's node-realization threshold and evaluates
 * transition requests.
 *
 * IMPORTANT:
 * This is a client-side state/policy controller. It does not discover,
 * authenticate, or cryptographically verify physical network nodes.
 * Production transition authority must be enforced by a trusted control
 * plane or consensus mechanism.
 */

const DEFAULT_REQUIRED_GLOBAL_NODES = 34;
const DEFAULT_REQUIRED_PRIMARY_NODES = 144;
const DEFAULT_AUTHORIZED_ENTITY = "Pinaleaf Advancements LLP";

export class BoardTransitionController {
  constructor({
    requiredGlobalNodes = DEFAULT_REQUIRED_GLOBAL_NODES,
    requiredPrimaryNodes = DEFAULT_REQUIRED_PRIMARY_NODES,
    authorizedEntity = DEFAULT_AUTHORIZED_ENTITY,
    initialGlobalNodes = 0,
    initialPrimaryNodes = 0,
  } = {}) {
    this.validateConfiguration({
      requiredGlobalNodes,
      requiredPrimaryNodes,
      initialGlobalNodes,
      initialPrimaryNodes,
    });

    this.requiredGlobalNodes = requiredGlobalNodes;
    this.requiredPrimaryNodes = requiredPrimaryNodes;
    this.authorizedEntity = authorizedEntity;

    // Start at zero unless an externally verified realization record is
    // supplied by a trusted layer.
    this.currentRealizedGlobalNodes = initialGlobalNodes;
    this.currentRealizedPrimaryNodes = initialPrimaryNodes;

    this.transitionFinalized = false;
    this.lastTransition = null;
  }

  validateConfiguration({
    requiredGlobalNodes,
    requiredPrimaryNodes,
    initialGlobalNodes,
    initialPrimaryNodes,
  }) {
    const values = [
      ["requiredGlobalNodes", requiredGlobalNodes],
      ["requiredPrimaryNodes", requiredPrimaryNodes],
      ["initialGlobalNodes", initialGlobalNodes],
      ["initialPrimaryNodes", initialPrimaryNodes],
    ];

    for (const [name, value] of values) {
      if (!Number.isInteger(value) || value < 0) {
        throw new TypeError(`${name} must be a non-negative integer.`);
      }
    }

    if (requiredGlobalNodes === 0 || requiredPrimaryNodes === 0) {
      throw new RangeError(
        "Required node thresholds must be greater than zero."
      );
    }

    if (initialGlobalNodes > requiredGlobalNodes) {
      throw new RangeError(
        "initialGlobalNodes cannot exceed requiredGlobalNodes."
      );
    }

    if (initialPrimaryNodes > requiredPrimaryNodes) {
      throw new RangeError(
        "initialPrimaryNodes cannot exceed requiredPrimaryNodes."
      );
    }
  }

  auditNodeRealization() {
    const globalRealized =
      this.currentRealizedGlobalNodes >= this.requiredGlobalNodes;

    const primaryRealized =
      this.currentRealizedPrimaryNodes >= this.requiredPrimaryNodes;

    const fullyRealized = globalRealized && primaryRealized;

    let status = "PENDING";

    if (fullyRealized) {
      status = "FULLY_REALIZED";
    } else if (globalRealized || primaryRealized) {
      status = "PARTIALLY_REALIZED";
    }

    return {
      status,
      fullyRealized,
      globalRealized,
      primaryRealized,
      currentGlobalNodes: this.currentRealizedGlobalNodes,
      currentPrimaryNodes: this.currentRealizedPrimaryNodes,
      requiredGlobalNodes: this.requiredGlobalNodes,
      requiredPrimaryNodes: this.requiredPrimaryNodes,
      globalProgress: Math.min(
        1,
        this.currentRealizedGlobalNodes / this.requiredGlobalNodes
      ),
      primaryProgress: Math.min(
        1,
        this.currentRealizedPrimaryNodes / this.requiredPrimaryNodes
      ),
      transitionFinalized: this.transitionFinalized,
    };
  }

  recordVerifiedNodeRealization({
    globalNodes = this.currentRealizedGlobalNodes,
    primaryNodes = this.currentRealizedPrimaryNodes,
  } = {}) {
    if (!Number.isInteger(globalNodes) || globalNodes < 0) {
      throw new TypeError("globalNodes must be a non-negative integer.");
    }

    if (!Number.isInteger(primaryNodes) || primaryNodes < 0) {
      throw new TypeError("primaryNodes must be a non-negative integer.");
    }

    this.currentRealizedGlobalNodes = Math.min(
      globalNodes,
      this.requiredGlobalNodes
    );

    this.currentRealizedPrimaryNodes = Math.min(
      primaryNodes,
      this.requiredPrimaryNodes
    );

    return this.auditNodeRealization();
  }

  requestTransition(entity) {
    const audit = this.auditNodeRealization();

    if (entity !== this.authorizedEntity) {
      return {
        approved: false,
        finalized: false,
        reason: "UNAUTHORIZED_ENTITY",
        message:
          "Transition denied: the requesting entity is not the designated authority.",
        audit,
      };
    }

    if (!audit.fullyRealized) {
      return {
        approved: false,
        finalized: false,
        reason: "NODE_THRESHOLD_NOT_REALIZED",
        message:
          "Transition denied: required node-realization thresholds have not been met.",
        audit,
      };
    }

    this.transitionFinalized = true;

    this.lastTransition = {
      entity,
      status: "FINALIZED",
      timestamp: new Date().toISOString(),
    };

    return {
      approved: true,
      finalized: true,
      reason: "THRESHOLD_REALIZED",
      message:
        "Transition approved by the local policy controller. External authorization is still required for production use.",
      audit: this.auditNodeRealization(),
      transition: { ...this.lastTransition },
    };
  }

  getTransitionStatus() {
    return {
      authorizedEntity: this.authorizedEntity,
      transitionFinalized: this.transitionFinalized,
      lastTransition: this.lastTransition
        ? { ...this.lastTransition }
        : null,
      audit: this.auditNodeRealization(),
    };
  }

  resetTransition() {
    this.transitionFinalized = false;
    this.lastTransition = null;
  }
}

export {
  DEFAULT_REQUIRED_GLOBAL_NODES,
  DEFAULT_REQUIRED_PRIMARY_NODES,
  DEFAULT_AUTHORIZED_ENTITY,
};