/**
 * KUTS Core Validator Module
 *
 * Validates transaction structure and cryptographic signatures.
 */

const {
    verifySignature
} = require("./identity");

const {
    serializeTransaction
} = require("./transaction");

/**
 * Validate a transaction.
 */
function validateTransaction(
    transaction,
    publicKeyPem
) {
    const structuralResult =
        validateStructure(transaction);

    if (!structuralResult.valid) {
        return structuralResult;
    }

    const signatureResult =
        validateSignature(
            transaction,
            publicKeyPem
        );

    if (!signatureResult.valid) {
        return signatureResult;
    }

    return {
        valid: true,
        code: "VALID_TRANSACTION"
    };
}

/**
 * Validate basic transaction structure.
 */
function validateStructure(transaction) {
    if (!transaction) {
        return {
            valid: false,
            code: "MISSING_TRANSACTION"
        };
    }

    if (!transaction.version) {
        return {
            valid: false,
            code: "MISSING_VERSION"
        };
    }

    if (!transaction.type) {
        return {
            valid: false,
            code: "MISSING_TYPE"
        };
    }

    if (!transaction.sender) {
        return {
            valid: false,
            code: "MISSING_SENDER"
        };
    }

    if (transaction.nonce === undefined) {
        return {
            valid: false,
            code: "MISSING_NONCE"
        };
    }

    if (!transaction.timestamp) {
        return {
            valid: false,
            code: "MISSING_TIMESTAMP"
        };
    }

    if (!transaction.signature) {
        return {
            valid: false,
            code: "MISSING_SIGNATURE"
        };
    }

    return {
        valid: true,
        code: "STRUCTURE_VALID"
    };
}

/**
 * Validate transaction signature.
 */
function validateSignature(
    transaction,
    publicKeyPem
) {
    const { signature, ...unsignedTransaction } = transaction;

    const serialized =
        serializeTransaction(
            unsignedTransaction
        );

    const verified = verifySignature(
        serialized,
        signature,
        publicKeyPem
    );

    if (!verified) {
        return {
            valid: false,
            code: "INVALID_SIGNATURE"
        };
    }

    return {
        valid: true,
        code: "SIGNATURE_VALID"
    };
}

module.exports = {
    validateTransaction,
    validateStructure,
    validateSignature
};