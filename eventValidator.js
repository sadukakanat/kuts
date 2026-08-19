/**
 * AAROHAN CHRONOS // V2 EVENT VALIDATOR
 * Validates the structural integrity and schema compliance of incoming events.
 */

import { VALID_EVENT_TYPES } from "./eventSchema.js";

export class EventValidator {
  static validate(event) {
    if (!event || typeof event !== "object") {
      return { valid: false, reason: "INVALID_FORMAT", message: "Event must be a non-null object." };
    }

    const requiredFields = [
      "id",
      "type",
      "version",
      "nodeId",
      "actorId",
      "timestamp",
      "sequence",
      "nonce",
      "payload",
      "previousHash"
    ];

    for (const field of requiredFields) {
      if (event[field] === undefined || event[field] === null) {
        return { valid: false, reason: "SCHEMA_INVALID", message: `Missing required field: ${field}` };
      }
    }

    if (!VALID_EVENT_TYPES.includes(event.type)) {
      return { valid: false, reason: "INVALID_EVENT_TYPE", message: `Unsupported event type: ${event.type}` };
    }

    if (!Number.isInteger(event.sequence) || event.sequence < 1) {
      return { valid: false, reason: "INVALID_SEQUENCE", message: "Sequence must be a positive integer." };
    }

    if (typeof event.previousHash !== "string" || event.previousHash.length === 0) {
      return { valid: false, reason: "HASH_MISMATCH", message: "Previous hash must be a valid string." };
    }

    return { valid: true };
  }
}