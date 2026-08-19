/**
 * KUTS Core Transaction Module
 *
 * A transaction is a signed request to change system state.
 */

const crypto = require("crypto");

const {
    signData
} = require("./identity");

/**
 * Create a canonical transaction.
 */
function createTransaction({
    type,
    sender,
    recipient = null,
    amount = null,
    currency = null,
    nonce,
    metadata = {}
}) {
    return {
        version: 1,
        type,
        sender,
        recipient,
        amount,
        currency,
        nonce,
        timestamp: new Date().toISOString(),
        metadata
    };
}

/**
 * Create deterministic transaction data.
 */
function serializeTransaction(transaction) {
    return JSON.stringify({
        version: transaction.version,
        type: transaction.type,
        sender: transaction.sender,
        recipient: transaction.recipient,
        amount: transaction.amount,
        currency: transaction.currency,
        nonce: transaction.nonce,
        timestamp: transaction.timestamp,
        metadata: transaction.metadata
    });
}

/**
 * Sign a transaction.
 */
function signTransaction(transaction, privateKeyPem) {
    const serialized = serializeTransaction(transaction);

    const signature = signData(
        serialized,
        privateKeyPem
    );

    return {
        ...transaction,
        signature
    };
}

/**
 * Create a deterministic transaction ID.
 */
function getTransactionId(transaction) {
    const serialized = serializeTransaction(transaction);

    return crypto
        .createHash("sha256")
        .update(serialized)
        .digest("hex");
}

module.exports = {
    createTransaction,
    serializeTransaction,
    signTransaction,
    getTransactionId
};