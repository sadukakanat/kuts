/**
 * KUTS Schema Validator Engine (Layer 04 - Integrity Core)
 * Handles structural evaluation, numeric consistency verification, and ruleset compliance.
 */

const KUTS_VALIDATOR = {
    // Regular expression matching the 22-digit KUTS execution timestamp signature precisely
    TIMESTAMP_REGEX: /^\(\+[0-9]{2}\):[0-9]{4}\.[0-9]{2}\.[0-9]{2}\.[0-9]{2}\.[0-9]{2}\.[0-9]{2}\.[0-9]{2}\.[0-9]{2}\.[0-9]{2}\.[0-9]{2}\.[0-9]{2}$/,

    /**
     * Evaluates a transaction block against the strict structural contract.
     * @param {Object} logEntry - The target transaction block to analyze.
     * @returns {Object} { isValid: boolean, error: string|null }
     */
    validateTransactionFormat(logEntry) {
        // 1. Verify basic key presence constraints
        const requiredKeys = ['id', 'timestamp', 'source', 'target', 'gross', 'tds', 'net', 'desc'];
        for (const key of requiredKeys) {
            if (!(key in logEntry)) {
                return { isValid: false, error: `Structural Violation: Missing required field parameter [${key}].` };
            }
        }

        // 2. Enforce strict character format mapping constraints on identifiers
        if (!logEntry.id.startsWith("AUD-")) {
            return { isValid: false, error: "Signature Defect: Field identifier must match the standard AUD- prefix format." };
        }

        if (!this.TIMESTAMP_REGEX.test(logEntry.timestamp)) {
            return { isValid: false, error: "Temporal Alignment Defect: Timestamp does not match the invariant 22-digit KUTS spatial string signature." };
        }

        // 3. Mathematical Consistency & Fraud Protection Checks
        const gross = parseFloat(logEntry.gross);
        const tds = parseFloat(logEntry.tds);
        const royalty = parseFloat(logEntry.royalty || 0);
        const net = parseFloat(logEntry.net);

        if (isNaN(gross) || gross < 0 || isNaN(tds) || isNaN(net)) {
            return { isValid: false, error: "Data Quality Defect: Numeric values are corrupt or express negative values." };
        }

        // Check for calculated structural manipulation in the 1% statutory sweep metrics
        const expectedTds = Math.round((gross * 0.01) * 10000) / 10000;
        const actualTds = Math.round(tds * 10000) / 10000;
        if (Math.abs(expectedTds - actualTds) > 0.01) {
            return { isValid: false, error: `Compliance Rejection: 1% TDS extraction deviates from invariant structural baseline metrics.` };
        }

        // Verify total balance reconciliation calculation matches perfectly
        const expectedNet = Math.round((gross - tds - royalty) * 10000) / 10000;
        const actualNet = Math.round(net * 10000) / 10000;
        if (Math.abs(expectedNet - actualNet) > 0.01) {
            return { isValid: false, error: "Accounting Rejection: Gross asset value fails to reconcile cleanly against deductions." };
        }

        return { isValid: true, error: null };
    },

    /**
     * Validates an entire array of transaction logs (e.g., during file import routines).
     * @param {Array} logArray - The complete array of ledger blocks to screen.
     * @returns {boolean} True if every log block matches structural rules perfectly.
     */
    validateLedgerStream(logArray) {
        if (!Array.isArray(logArray)) return false;
        for (let i = 0; i < logArray.length; i++) {
            const auditResult = this.validateTransactionFormat(logArray[i]);
            if (!auditResult.isValid) {
                console.warn(`Ledger Contamination at index [${i}]: ${auditResult.error}`);
                return false;
            }
        }
        return true;
    }
};