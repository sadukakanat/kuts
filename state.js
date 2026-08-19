/**
 * KUTS Core State Module
 *
 * State is derived from accepted ledger history.
 */

function deriveBalances(
    ledgerEntries
) {
    const balances = {};

    for (
        const entry of ledgerEntries
    ) {
        const transaction =
            entry.transaction;

        if (
            transaction.type !==
            "TRANSFER"
        ) {
            continue;
        }

        const amount =
            Number(transaction.amount);

        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            continue;
        }

        const sender =
            transaction.sender;

        const recipient =
            transaction.recipient;

        if (!balances[sender]) {
            balances[sender] = 0;
        }

        if (!balances[recipient]) {
            balances[recipient] = 0;
        }

        balances[sender] -= amount;
        balances[recipient] += amount;
    }

    return balances;
}

/**
 * Derive complete state from ledger entries.
 */
function deriveState(
    ledgerEntries
) {
    return {
        balances:
            deriveBalances(
                ledgerEntries
            ),
        transactionCount:
            ledgerEntries.length
    };
}

module.exports = {
    deriveBalances,
    deriveState
};