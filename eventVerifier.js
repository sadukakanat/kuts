/**
 * AAROHAN CHRONOS // V2 VERIFICATION & ANTI-REPLAY GATE
 * Evaluates incoming events against structural schemas, signatures, nonces, and sequence rules.
 */

import { EventValidator } from "../events/eventValidator.js";
import { CryptoIdentityManager } from "../crypto/cryptoIdentity.js";

export class EventVerificationGate {
  constructor() {
    // Tracks used nonces per node to prevent replay attacks: Map<nodeId, Set<nonce>>
    this.usedNonces = new Map();
    // Tracks expected sequence numbers per node: Map<nodeId, number>
    this.nodeSequences = new Map();
    // Tracks the last hash per node for chain integrity: Map<nodeId, string>
    this.nodeLastHashes = new Map();
  }

  /**
   * Evaluates an event through the complete verification pipeline.
   */
  async verifyEvent(event, publicKeyCryptoKey) {
    // 1. Structural Schema Validation
    const structuralCheck = EventValidator.validate(event);
    if (!structuralCheck.valid) {
      return { accepted: false, reason: structuralCheck.reason, message: structuralCheck.message };
    }

    const { nodeId, nonce, sequence, previousHash, signature } = event;

    // 2. Signature Presence Check
    if (!signature) {
      return { accepted: false, reason: "INVALID_SIGNATURE", message: "Event is missing a cryptographic signature." };
    }

    // 3. Cryptographic Signature Verification
    try {
      const isSignatureValid = await CryptoIdentityManager.verifySignature(event, signature, publicKeyCryptoKey);
      if (!isSignatureValid) {
        return { accepted: false, reason: "INVALID_SIGNATURE", message: "Cryptographic signature verification failed." };
      }
    } catch (err) {
      return { accepted: false, reason: "INVALID_SIGNATURE", message: `Signature check error: ${err.message}` };
    }

    // 4. Anti-Replay Nonce Check
    if (!this.usedNonces.has(nodeId)) {
      this.usedNonces.set(nodeId, new Set());
    }
    const nodeNonces = this.usedNonces.get(nodeId);
    if (nodeNonces.has(nonce)) {
      return { accepted: false, reason: "NONCE_REUSED", message: `Nonce ${nonce} has already been consumed for node ${nodeId}.` };
    }

    // 5. Sequence Validation Check
    const expectedSequence = (this.nodeSequences.get(nodeId) || 0) + 1;
    if (sequence !== expectedSequence) {
      return { 
        accepted: false, 
        reason: "INVALID_SEQUENCE", 
        message: `Invalid sequence. Expected ${expectedSequence}, got ${sequence}.` 
      };
    }

    // 6. Hash Chain Linkage Check
    const expectedPreviousHash = this.nodeLastHashes.get(nodeId) || "0".repeat(64);
    if (previousHash !== expectedPreviousHash) {
      return { accepted: false, reason: "HASH_MISMATCH", message: "Previous hash does not match the chain state." };
    }

    // 7. Timestamp Acceptability Check (e.g., within 5 minutes of drift)
    const eventTime = new Date(event.timestamp).getTime();
    const now = Date.now();
    const driftToleranceMs = 5 * 60 * 1000; 
    if (isNaN(eventTime) || Math.abs(now - eventTime) > driftToleranceMs) {
      return { accepted: false, reason: "STALE_TIMESTAMP", message: "Event timestamp is outside acceptable clock skew tolerance." };
    }

    // If all gates pass, consume the nonce and update node tracking state
    nodeNonces.add(nonce);
    this.nodeSequences.set(nodeId, sequence);
    // Note: The actual event hash would be computed and stored here as the new lastHash

    return { accepted: true, message: "Event successfully verified and accepted." };
  }
}