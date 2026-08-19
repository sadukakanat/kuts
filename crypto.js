/**
 * KUTS Core Cryptographic Utilities
 *
 * Development module.
 *
 * Responsibilities:
 * - Hash data
 * - Create deterministic data representations
 * - Generate transaction hashes
 *
 * Identity key generation, signing, and signature verification
 * currently remain in identity.js.
 */

const crypto = require("crypto");

/**
 * Convert data into a deterministic string.
 *
 * Note:
 * This is an initial implementation.
 * Canonical serialization rules should eventually be formally
 * defined in the KUTS protocol specification.
 */
function canonicalize(data) {
    if (typeof data === "string") {
        return data;
    }

    return JSON.stringify(data);
}

/**
 * Create a SHA-256 hash.
 */
function hashData(data) {
    return crypto
        .createHash("sha256")
        .update(canonicalize(data))
        .digest("hex");
}

/**
 * Create a hash with a KUTS prefix.
 */
function createKutsHash(data) {
    return `kuts:hash:${hashData(data)}`;
}

/**
 * Compare two pieces of data by hash.
 */
function hashesMatch(dataA, dataB) {
    return hashData(dataA) === hashData(dataB);
}

module.exports = {
    canonicalize,
    hashData,
    createKutsHash,
    hashesMatch
};