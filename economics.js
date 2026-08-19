/**
 * KUTS Core Economics Module
 *
 * Development module.
 *
 * All calculations must be deterministic.
 *
 * This is an initial model and is not yet the final KUTS
 * economic protocol.
 */

const ECONOMIC_RULE_VERSION = "0.1.0";

/**
 * Convert a numeric amount into a fixed decimal value.
 *
 * The initial implementation uses two decimal places.
 */
function normalizeAmount(amount) {
    const value = Number(amount);

    if (!Number.isFinite(value)) {
        throw new Error("Invalid economic amount");
    }

    if (value < 0) {
        throw new Error("Economic amount cannot be negative");
    }

    return Number(value.toFixed(2));
}

/**
 * Calculate a percentage amount.
 */
function calculatePercentage(
    amount,
    percentage
) {
    const normalizedAmount =
        normalizeAmount(amount);

    const normalizedPercentage =
        Number(percentage);

    if (
        !Number.isFinite(
            normalizedPercentage
        )
    ) {
        throw new Error(
            "Invalid percentage"
        );
    }

    return Number(
        (
            normalizedAmount *
            normalizedPercentage /
            100
        ).toFixed(2)
    );
}

/**
 * Calculate a KUTS economic distribution.
 *
 * Example:
 *
 * Gross Amount: 100.00
 * TDS:           1.00%
 * RSP:           1.00%
 *
 * Net Recipient:
 * 98.00
 */
function calculateDistribution({
    grossAmount,
    tdsPercentage = 0,
    rspPercentage = 0
}) {
    const gross =
        normalizeAmount(
            grossAmount
        );

    const tds =
        calculatePercentage(
            gross,
            tdsPercentage
        );

    const rsp =
        calculatePercentage(
            gross,
            rspPercentage
        );

    const net =
        Number(
            (
                gross -
                tds -
                rsp
            ).toFixed(2)
        );

    if (net < 0) {
        throw new Error(
            "Economic distribution exceeds gross amount"
        );
    }

    return {
        ruleVersion:
            ECONOMIC_RULE_VERSION,

        grossAmount: gross,

        tdsAmount: tds,

        rspAmount: rsp,

        netAmount: net,

        reconciles:
            Number(
                (
                    tds +
                    rsp +
                    net
                ).toFixed(2)
            ) === gross
    };
}

/**
 * Validate an economic result.
 */
function validateDistribution(
    distribution
) {
    if (!distribution) {
        return {
            valid: false,
            code: "MISSING_DISTRIBUTION"
        };
    }

    if (
        distribution.reconciles !== true
    ) {
        return {
            valid: false,
            code: "DISTRIBUTION_DOES_NOT_RECONCILE"
        };
    }

    if (
        distribution.grossAmount < 0 ||
        distribution.tdsAmount < 0 ||
        distribution.rspAmount < 0 ||
        distribution.netAmount < 0
    ) {
        return {
            valid: false,
            code: "NEGATIVE_ECONOMIC_VALUE"
        };
    }

    return {
        valid: true,
        code: "ECONOMIC_DISTRIBUTION_VALID"
    };
}

module.exports = {
    ECONOMIC_RULE_VERSION,
    normalizeAmount,
    calculatePercentage,
    calculateDistribution,
    validateDistribution
};