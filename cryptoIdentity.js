/**
 * AAROHAN CHRONOS // V2 CRYPTO & IDENTITY MODULE
 * Handles key pair generation, event signing, and signature verification.
 */

export class CryptoIdentityManager {
  constructor() {
    this.keyPair = null;
    this.publicKeyPem = null;
  }

  /**
   * Generates a new ECDSA key pair (P-256) for signing events.
   */
  async generateIdentity() {
    this.keyPair = await window.crypto.subtle.generateKey(
      {
        name: "ECDSA",
        namedCurve: "P-256",
      },
      true,
      ["sign", "verify"]
    );

    // Export public key for identification purposes
    const exportedPublicKey = await window.crypto.subtle.exportKey(
      "spki",
      this.keyPair.publicKey
    );
    
    this.publicKeyPem = btoa(String.fromCharCode(...new Uint8Array(exportedPublicKey)));
    return this.publicKeyPem;
  }

  /**
   * Signs an event object using the private key.
   * Excludes the signature field itself from the signed payload.
   */
  async signEvent(event) {
    if (!this.keyPair || !this.keyPair.privateKey) {
      throw new Error("Private key missing. Generate identity first.");
    }

    const eventCopy = { ...event, signature: null };
    const encodedData = new TextEncoder().encode(JSON.stringify(eventCopy));

    const signature = await window.crypto.subtle.sign(
      {
        name: "ECDSA",
        hash: { name: "SHA-256" },
      },
      this.keyPair.privateKey,
      encodedData
    );

    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }

  /**
   * Verifies an event signature against a given public key.
   */
  static async verifySignature(event, signatureBase64, publicKeyCryptoKey) {
    const eventCopy = { ...event, signature: null };
    const encodedData = new TextEncoder().encode(JSON.stringify(eventCopy));
    
    const signatureBytes = Uint8Array.from(atob(signatureBase64), c => c.charCodeAt(0));

    return await window.crypto.subtle.verify(
      {
        name: "ECDSA",
        hash: { name: "SHA-256" },
      },
      publicKeyCryptoKey,
      signatureBytes,
      encodedData
    );
  }
}