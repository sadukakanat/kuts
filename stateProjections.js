/**
 * AAROHAN CHRONOS // V2 EVENT-SOURCED STATE PROJECTIONS
 * Computes clean read models for the HUD and application interfaces from the event log.
 */

export class StateProjections {
  /**
   * Compiles a comprehensive dashboard read model from ledger and registry states.
   */
  static getDashboardProjection(ledgerService, nodeRegistry) {
    const ledgerState = ledgerService.ledgerState;
    const transitionAudit = nodeRegistry.auditTransitionEligibility();

    return {
      network: {
        status: "SYNCHRONIZED",
        running: true,
        currentGlobalNodes: transitionAudit.activeGlobalCount,
        currentPrimaryNodes: transitionAudit.activePrimaryCount,
        globalProgress: transitionAudit.globalProgress,
        primaryProgress: transitionAudit.primaryProgress,
      },
      transition: transitionAudit,
      minting: {
        totalMinted: ledgerState.totalKines,
        totalDynes: ledgerState.totalDynes,
        totalPulses: ledgerState.totalPulses,
        lastEvent: ledgerService.auditLog[ledgerService.auditLog.length - 1] || null
      },
      auditSummary: {
        totalEvents: ledgerService.events.length,
        lastEventHash: ledgerState.lastEventHash,
        recentLogs: ledgerService.auditLog.slice(-5)
      }
    };
  }
}