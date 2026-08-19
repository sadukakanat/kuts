/**
 * KUTS Core Ledger Module
 *
 * The ledger stores accepted transactions.
 *
 * Important:
 * Transaction = request
 * Ledger entry = accepted history
 */

const {
    getTransactionId
} = require("./transaction");

class Ledger {
    constructor() {
        this.entries = [];
        this.transactionIds = new Set();
    }

    /**
     * Add a validated transaction to the ledger.
     */
    commit(transaction) {
        const transactionId =
            getTransactionId(transaction);

        if (
            this.transactionIds.has(
                transactionId
            )
        ) {
            throw new Error(
                "Transaction already exists"
            );
        }

        const entry = {
            entryId: this.entries.length + 1,
            transactionId,
            transaction,
            committedAt:
                new Date().toISOString()
        };

        this.entries.push(entry);

        this.transactionIds.add(
            transactionId
        );

        return entry;
    }

    /**
     * Return all ledger entries.
     */
    getEntries() {
        return [...this.entries];
    }

    /**
     * Find an entry by transaction ID.
     */
    findTransaction(transactionId) {
        return this.entries.find(
            entry =>
                entry.transactionId ===
                transactionId
        );
    }

    /**
     * Return ledger size.
     */
    size() {
        return this.entries.length;
    }
}

module.exports = {
    Ledger
};