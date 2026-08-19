/**
 * AAROHAN CHRONOS // IPFS EXPORT PREPARATION
 *
 * Prepares application state for decentralized storage.
 *
 * IMPORTANT:
 * This module does NOT upload data to IPFS and does NOT generate a real
 * IPFS CID by itself. It creates a validated, serializable payload that can
 * later be handed to a real IPFS client or gateway.
 */

const EXPORT_VERSION = "1.0.0";
const EXPORT_FORMAT = "aarohan-chronos-state";

export class IPFSExport {
  constructor({
    application = "Aarohan Chronos",
    version = EXPORT_VERSION,
    now = () => new Date(),
  } = {}) {
    if (typeof application !== "string" || application.trim() === "") {
      throw new TypeError("application must be a non-empty string.");
    }

    if (typeof version !== "string" || version.trim() === "") {
      throw new TypeError("version must be a non-empty string.");
    }

    if (typeof now !== "function") {
      throw new TypeError("now must be a function.");
    }

    this.application = application;
    this.version = version;
    this.now = now;
  }

  createPayload(state = {}) {
    if (!state || typeof state !== "object" || Array.isArray(state)) {
      throw new TypeError("state must be a plain object.");
    }

    const timestamp = this.normalizeDate(this.now()).toISOString();

    return {
      format: EXPORT_FORMAT,
      formatVersion: this.version,
      application: this.application,
      exportedAt: timestamp,
      storage: {
        target: "IPFS",
        uploaded: false,
        cid: null,
        gatewayUrl: null,
      },
      state: this.cloneSerializableState(state),
    };
  }

  serialize(state = {}) {
    const payload = this.createPayload(state);

    return JSON.stringify(payload, null, 2);
  }

  download(
    state = {},
    filename = "aarohan-chronos-export.json"
  ) {
    const json = this.serialize(state);

    if (
      typeof document === "undefined" ||
      typeof URL === "undefined"
    ) {
      return {
        downloaded: false,
        filename,
        json,
        reason: "BROWSER_DOWNLOAD_API_UNAVAILABLE",
      };
    }

    const blob = new Blob([json], {
      type: "application/json;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = this.sanitizeFilename(filename);
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    return {
      downloaded: true,
      filename: link.download,
      bytes: new TextEncoder().encode(json).length,
    };
  }

  prepareForIPFS(state = {}) {
    const payload = this.createPayload(state);
    const json = JSON.stringify(payload);

    return {
      payload,
      content: json,
      contentType: "application/json",
      uploaded: false,
      cid: null,
      gatewayUrl: null,
      message:
        "Payload prepared locally. No IPFS upload has been performed.",
    };
  }

  markUploaded(cid, gatewayUrl = null) {
    if (typeof cid !== "string" || cid.trim() === "") {
      throw new TypeError("cid must be a non-empty string.");
    }

    if (
      gatewayUrl !== null &&
      (typeof gatewayUrl !== "string" ||
        gatewayUrl.trim() === "")
    ) {
      throw new TypeError(
        "gatewayUrl must be null or a non-empty string."
      );
    }

    return {
      uploaded: true,
      cid: cid.trim(),
      gatewayUrl: gatewayUrl ? gatewayUrl.trim() : null,
    };
  }

  cloneSerializableState(state) {
    try {
      return JSON.parse(JSON.stringify(state));
    } catch (error) {
      throw new TypeError(
        `State contains values that cannot be serialized: ${error.message}`
      );
    }
  }

  sanitizeFilename(filename) {
    if (
      typeof filename !== "string" ||
      filename.trim() === ""
    ) {
      return "aarohan-chronos-export.json";
    }

    const sanitized = filename
      .trim()
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
      .replace(/\s+/g, "-");

    return sanitized.toLowerCase().endsWith(".json")
      ? sanitized
      : `${sanitized}.json`;
  }

  normalizeDate(date) {
    const normalizedDate =
      date instanceof Date ? new Date(date) : new Date(date);

    if (Number.isNaN(normalizedDate.getTime())) {
      throw new TypeError("Invalid export timestamp.");
    }

    return normalizedDate;
  }
}

export { EXPORT_VERSION, EXPORT_FORMAT };