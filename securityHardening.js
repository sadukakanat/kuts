/**
 * AAROHAN CHRONOS // V2 SECURITY HARDENING & SANITIZATION
 * Enforces sanitization, input guardrails, and secure execution policies.
 */

export class SecurityHardening {
  /**
   * Sanitizes generic string inputs to prevent injection or malformed data injection.
   */
  static sanitizeString(input, maxLength = 256) {
    if (typeof input !== "string") {
      return "";
    }
    return input
      .trim()
      .slice(0, maxLength)
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "");
  }

  /**
   * Enforces strict numeric bounds checking for resource metrics.
   */
  static validateNumericBound(value, min = 0, max = Number.MAX_SAFE_INTEGER) {
    const num = Number(value);
    if (!Number.isFinite(num)) {
      throw new TypeError("Value must be a finite number.");
    }
    if (num < min || num > max) {
      throw new RangeError(`Value ${num} is out of allowable bounds [${min}, ${max}].`);
    }
    return num;
  }

  /**
   * Generates recommended security headers configuration for the host gateway.
   */
  static getSecureHeaders() {
    return {
      "Content-Security-Policy": "default-src 'self'; script-src 'self'; object-src 'none';",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
      "X-XSS-Protection": "1; mode=block"
    };
  }
}