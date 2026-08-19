/**
 * AAROHAN CHRONOS // KINE MINTING ENGINE
 *
 * Deterministic conversion layer for resource metrics -> Kines.
 *
 * Important:
 * - This client-side engine calculates quantities; it does not verify that
 *   the supplied metric came from a trusted physical or external source.
 * - Persistent balances, authorization, anti-replay protection, and
 *   cryptographic transaction verification belong in a trusted ledger layer.
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

export class MintingEngine {
  constructor() {
    this.totalKines = 0;
    this.totalDynes = 0;
    this.totalPulses = 0;
    this.lastMint = null;
  }

  processPulse(metricType, value) {
    this.validateMetric(metricType, value);

    const numericValue = Number(value);
    const rule = METRIC_RULES[metricType];

    const sessionKines = numericValue * rule.kinesPerUnit;

    this.totalKines += sessionKines;
    this.totalDynes = this.totalKines / KINES_PER_DYNE;
    this.totalPulses += 1;

    const result = {
      metricType,
      metricDescription: rule.description,
      inputValue: numericValue,
      inputUnit: rule.unit,
      conversionRate: rule.kinesPerUnit,
      sessionKines,
      totalKines: this.totalKines,
      totalDynes: this.totalDynes,
      pulseNumber: this.totalPulses,
      verified: false,
      verificationStatus: "CLIENT_INPUT_UNVERIFIED",
      timestamp: new Date().toISOString(),
    };

    this.lastMint = Object.freeze({ ...result });

    return result;
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

  getBalance() {
    return {
      totalKines: this.totalKines,
      totalDynes: this.totalDynes,
      totalPulses: this.totalPulses,
    };
  }

  getLastMint() {
    return this.lastMint ? { ...this.lastMint } : null;
  }

  resetSession() {
    this.totalKines = 0;
    this.totalDynes = 0;
    this.totalPulses = 0;
    this.lastMint = null;
  }
}

export { KINES_PER_DYNE, METRIC_RULES };