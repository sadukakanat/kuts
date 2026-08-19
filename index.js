/**
 * AAROHAN CHRONOS // V2 MASTER INDEX & BOOTSTRAP
 * Exports and unifies all core modules into a single production-ready runtime.
 */

// 1. Events & Validation
export { EventFactory } from "./events/eventSchema.js";
export { EventValidator } from "./events/eventValidator.js";

// 2. Minting Engine
export { MintingCalculationEngine, KINES_PER_DYNE } from "./minting/mintingEngine.js";

// 3. Crypto & Identity
export { CryptoIdentityManager } from "./crypto/cryptoIdentity.js";

// 4. Verification Gate
export { EventVerificationGate } from "./verification/eventVerifier.js";

// 5. Persistent Ledger
export { PersistentLedgerService } from "./ledger/ledgerService.js";

// 6. Node Registry
export { NodeRegistry } from "./registry/nodeRegistry.js";

// 7. Offline-First Queue
export { OfflineClientQueue } from "./storage/offlineQueue.js";

// 8. Transport Abstraction
export { TransportInterface, SimulationTransport } from "./transport/simulationTransport.js";

// 9. Projections
export { StateProjections } from "./projections/stateProjections.js";

// 10. IPFS Snapshots
export { SnapshotAnchor } from "./ipfs/snapshotAnchor.js";

// 11. Security Hardening
export { SecurityHardening } from "./security/securityHardening.js";

// 12. Observability
export { ObservabilityCollector } from "./observability/observabilityCollector.js";

// 13. Test Suite
export { ChronosTestSuite } from "./tests/unit/chronosTestSuite.js";

// 14. UI HUD Renderer
export { HUDRendererV2 } from "../web/ui/hudV2Renderer.js";


/**
 * ChronosRuntimeFacade
 * Optional unified orchestrator that instantiates and connects all subsystems.
 */
import { EventFactory } from "./events/eventSchema.js";
import { CryptoIdentityManager } from "./crypto/cryptoIdentity.js";
import { EventVerificationGate } from "./verification/eventVerifier.js";
import { PersistentLedgerService } from "./ledger/ledgerService.js";
import { NodeRegistry } from "./registry/nodeRegistry.js";
import { ObservabilityCollector } from "./observability/observabilityCollector.js";
import { StateProjections } from "./projections/stateProjections.js";

export class ChronosRuntime {
  constructor({ nodeId = "THRINC000", actorId = "Pinaleaf" } = {}) {
    this.nodeId = nodeId;
    this.actorId = actorId;
    this.identityManager = new CryptoIdentityManager();
    this.verifierGate = new EventVerificationGate();
    this.ledger = new PersistentLedgerService();
    this.registry = new NodeRegistry();
    this.observability = new ObservabilityCollector();
    this.eventFactory = new EventFactory({ nodeId, actorId });
  }

  async initialize() {
    // Generate runtime cryptographic identity
    await this.identityManager.generateIdentity();
    this.registry.registerNode(this.nodeId, { type: "GLOBAL", region: "THRISSUR" });
    this.registry.updateNodeStatus(this.nodeId, "ACTIVE");
    this.observability.setMetric("activeNodes", 1);
    return { initialized: true, nodeId: this.nodeId };
  }

  getDashboardState() {
    return StateProjections.getDashboardProjection(this.ledger, this.registry);
  }
}
```[cite: 1]