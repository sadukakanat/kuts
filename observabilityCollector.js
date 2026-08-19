/**
 * AAROHAN CHRONOS // V2 OBSERVABILITY & METRICS COLLECTOR
 * Tracks system health, performance metrics, and structured event logging.
 */

export class ObservabilityCollector {
  constructor() {
    this.metrics = {
      eventsSubmitted: 0,
      eventsVerified: 0,
      eventsRejected: 0,
      mintTotal: 0,
      mintRejected: 0,
      syncLatencyMs: 0,
      activeNodes: 0,
      offlineQueueSize: 0,
      snapshotCount: 0,
      verificationFailures: 0
    };
    this.healthStatus = "ONLINE";
  }

  incrementMetric(metricKey, amount = 1) {
    if (Object.hasOwn(this.metrics, metricKey)) {
      this.metrics[metricKey] += amount;
    }
  }

  setMetric(metricKey, value) {
    if (Object.hasOwn(this.metrics, metricKey)) {
      this.metrics[metricKey] = value;
    }
  }

  recordVerificationResult(verified, reason = null) {
    this.incrementMetric("eventsSubmitted", 1);
    if (verified) {
      this.incrementMetric("eventsVerified", 1);
    } else {
      this.incrementMetric("eventsRejected", 1);
      this.incrementMetric("verificationFailures", 1);
    }
  }

  getHealthEndpoint() {
    return {
      status: this.healthStatus,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime ? process.uptime() : performance.now() / 1000)
    };
  }

  getReadyEndpoint(ledgerReady, transportConnected) {
    const ready = ledgerReady && transportConnected;
    return {
      ready,
      ledgerSynchronized: ledgerReady,
      transportActive: transportConnected,
      timestamp: new Date().toISOString()
    };
  }

  getMetricsPayload() {
    return {
      ...this.metrics,
      timestamp: new Date().toISOString()
    };
  }
}