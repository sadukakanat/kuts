/**
 * KUTS Core Identity Module
 *
 * Development implementation.
 *
 * Current purpose:
 * - Create a local identity
 * - Generate a cryptographic key pair
 * - Sign data
 * - Verify signatures
 *
 * This module is not yet the final KUTS identity protocol.
 */

const crypto = require("crypto");

const IDENTITY_ALGORITHM = "Ed25519";

/**
 * Create a new KUTS identity.
 */
function createIdentity() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync(
        "ed25519"
    );

    const publicKeyPem = publicKey.export({
        type: "spki",
        format: "pem"
    });

    const privateKeyPem = privateKey.export({
        type: "pkcs8",
        format: "pem"
    });

    const identityId = createIdentityId(publicKeyPem);

    return {
        id: identityId,
        algorithm: IDENTITY_ALGORITHM,
        publicKey: publicKeyPem,
        privateKey: privateKeyPem
    };
}

/**
 * Create a deterministic identity identifier.
 */
function createIdentityId(publicKey) {
    const hash = crypto
        .createHash("sha256")
        .update(publicKey)
        .digest("hex");

    return `kuts:${hash}`;
}

/**
 * Sign arbitrary data with a private key.
 */
function signData(data, privateKeyPem) {
    const privateKey = crypto.createPrivateKey(privateKeyPem);

    const dataBuffer = Buffer.from(
        typeof data === "string"
            ? data
            : JSON.stringify(data)
    );

    const signature = crypto.sign(
        null,
        dataBuffer,
        privateKey
    );

    return signature.toString("base64");
}

/**
 * Verify a signature with a public key.
 */
function verifySignature(
    data,
    signatureBase64,
    publicKeyPem
) {
    const publicKey = crypto.createPublicKey(publicKeyPem);

    const dataBuffer = Buffer.from(
        typeof data === "string"
            ? data
            : JSON.stringify(data)
    );

    return crypto.verify(
        null,
        dataBuffer,
        publicKey,
        Buffer.from(signatureBase64, "base64")
    );
}

module.exports = {
    IDENTITY_ALGORITHM,
    createIdentity,
    createIdentityId,
    signData,
    verifySignature
};