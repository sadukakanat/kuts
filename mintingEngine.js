/**
 * AAROHAN CHRONOS // V2 MINTING CALCULATION ENGINE
 * Deterministic conversion layer for resource metrics -> mint proposals.
 * 
 * Note: This module performs calculations only. It does not mutate
 * authoritative ledger state directly.
 */

const METRIC_RULES = Object.freeze({
  energy: Object.freeze({
    unit: "kWh",
    kinesPerUnit: 1 / 10,
    description: "Industrial Energy",
  }),
  logistics: Object.freeze({
    unit: "km",
    kinesPerUnit: 10 / 100,
    description: "Logistics Distance",
  }),
  labor: Object.freeze({
    unit: "hours",
    kinesPerUnit: 10 / 8,
    description: "Labor Duration",
  }),
});

const KINES_PER_DYNE = 100;
const POLICY_VERSION = "v2.0";

export class MintingCalculationEngine {
  constructor() {
    this.policyVersion = POLICY_VERSION;
  }

  createMintProposal(metricType, value) {
    this.validateMetric(metricType, value);

    const numericValue = Number(value);
    const rule = METRIC_RULES[metricType];
    const proposedKines = numericValue * rule.kinesPerUnit;
    const proposedDynes = proposedKines / KINES_PER_DYNE;

    return {
      metric: metricType.toUpperCase(),
      metricDescription: rule.description,
      input: numericValue,
      unit: rule.unit,
      conversionRate: rule.kinesPerUnit,
      proposedKines,
      proposedDynes,
      policyVersion: this.policyVersion,
      status: "PROPOSED",
      timestamp: new Date().toISOString()
    };
  }

  validateMetric(metricType, value) {
    if (!Object.hasOwn(METRIC_RULES, metricType)) {
      throw new TypeError(`Unsupported metric type: ${metricType}`);
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      throw new TypeError("Metric value must be a finite number.");
    }

    if (numericValue <= 0) {
      throw new RangeError("Metric value must be greater than zero.");
    }

    return true;
  }

  getMetricRules() {
    return Object.fromEntries(
      Object.entries(METRIC_RULES).map(([key, rule]) => [
        key,
        { ...rule },
      ])
    );
  }
}

export { KINES_PER_DYNE, METRIC_RULES, POLICY_VERSION };