/**
 * AAROHAN CHRONOS // V2 UNIT & INTEGRATION TEST SUITE
 * Validates core engines, cryptographic signing, and verification gates.
 */

import { EventFactory } from "../../events/eventSchema.js";
import { EventValidator } from "../../events/eventValidator.js";
import { MintingCalculationEngine } from "../../minting/mintingEngine.js";
import { NodeRegistry } from "../../registry/nodeRegistry.js";
import { PersistentLedgerService } from "../../ledger/ledgerService.js";

export class ChronosTestSuite {
  static async runAllTests() {
    const results = [];

    // Test 1: Event Schema Generation & Validation
    try {
      const factory = new EventFactory({ nodeId: "THRINC000", actorId: "Pinaleaf" });
      const event = factory.createEvent("PULSE_SUBMITTED", { metric: "ENERGY", value: 100 });
      const validation = EventValidator.validate(event);
      
      results.push({ test: "Event Schema Validation", passed: validation.valid, details: validation });
    } catch (err) {
      results.push({ test: "Event Schema Validation", passed: false, details: err.message });
    }

    // Test 2: Deterministic Minting Calculation
    try {
      const engine = new MintingCalculationEngine();
      const proposal = engine.createMintProposal("energy", 100);
      const passed = proposal.proposedKines === 10; // 100 kWh * (1/10) = 10 Kines
      
      results.push({ test: "Minting Calculation", passed, details: proposal });
    } catch (err) {
      results.push({ test: "Minting Calculation", passed: false, details: err.message });
    }

    // Test 3: Node Registry Transition Eligibility
    try {
      const registry = new NodeRegistry({ requiredGlobalNodes: 1, requiredPrimaryNodes: 1 });
      registry.registerNode("NODE_01", { type: "GLOBAL" });
      registry.updateNodeStatus("NODE_01", "ACTIVE");
      const audit = registry.auditTransitionEligibility();
      
      results.push({ test: "Node Registry Transition Audit", passed: audit.fullyRealized, details: audit });
    } catch (err) {
      results.push({ test: "Node Registry Transition Audit", passed: false, details: err.message });
    }

    // Test 4: Persistent Ledger State Projection
    try {
      const ledger = new PersistentLedgerService();
      const factory = new EventFactory({ nodeId: "THRINC000", actorId: "Pinaleaf" });
      const event = factory.createEvent("PULSE_VERIFIED", { proposedKines: 50 });
      const commitResult = ledger.commitEvent(event, { accepted: true });
      
      const passed = commitResult.committed && ledger.ledgerState.totalKines === 50;
      results.push({ test: "Persistent Ledger Projection", passed, details: commitResult });
    } catch (err) {
      results.push({ test: "Persistent Ledger Projection", passed: false, details: err.message });
    }

    const passedCount = results.filter(r => r.passed).length;
    return {
      totalTests: results.length,
      passedCount,
      failedCount: results.length - passedCount,
      results
    };
  }
}