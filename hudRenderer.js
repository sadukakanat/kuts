/**
 * AAROHAN CHRONOS // HUD RENDERER
 *
 * Responsible only for presenting application state in the browser HUD.
 * It does not calculate consensus, minting rules, network health, or
 * authorization decisions.
 *
 * IMPORTANT:
 * Values displayed by this renderer are informational unless they come from
 * a trusted backend or verification layer.
 */

const DEFAULT_SELECTORS = Object.freeze({
  globalNodes: "[data-hud='global-nodes']",
  primaryNodes: "[data-hud='primary-nodes']",
  globalProgress: "[data-hud='global-progress']",
  primaryProgress: "[data-hud='primary-progress']",
  networkStatus: "[data-hud='network-status']",
  transitionStatus: "[data-hud='transition-status']",
  custodialStatus: "[data-hud='custodial-status']",
  mintedAmount: "[data-hud='minted-amount']",
  lastEvent: "[data-hud='last-event']",
});

export class HUDRenderer {
  constructor({
    root = document,
    selectors = {},
  } = {}) {
    if (
      !root ||
      typeof root.querySelector !== "function"
    ) {
      throw new TypeError(
        "root must support querySelector()."
      );
    }

    this.root = root;

    this.selectors = {
      ...DEFAULT_SELECTORS,
      ...selectors,
    };

    this.elements = this.resolveElements();
  }

  resolveElements() {
    const elements = {};

    for (
      const [key, selector]
      of Object.entries(this.selectors)
    ) {
      elements[key] =
        this.root.querySelector(selector);
    }

    return elements;
  }

  refresh() {
    this.elements = this.resolveElements();

    return this.elements;
  }

  render({
    network = {},
    transition = {},
    custody = {},
    minting = {},
  } = {}) {
    this.refresh();

    this.setText(
      this.elements.globalNodes,
      this.formatCount(
        network.currentGlobalNodes ??
          network.globalNodes ??
          transition.currentGlobalNodes
      )
    );

    this.setText(
      this.elements.primaryNodes,
      this.formatCount(
        network.currentPrimaryNodes ??
          network.primaryNodes ??
          transition.currentPrimaryNodes
      )
    );

    this.setProgress(
      this.elements.globalProgress,
      network.globalProgress ??
        transition.globalProgress
    );

    this.setProgress(
      this.elements.primaryProgress,
      network.primaryProgress ??
        transition.primaryProgress
    );

    this.renderNetworkStatus(network);
    this.renderTransitionStatus(transition);
    this.renderCustodialStatus(custody);

    this.setText(
      this.elements.mintedAmount,
      this.formatNumber(
        minting.totalMinted ??
          minting.mintedAmount ??
          minting.total
      )
    );

    if (minting.lastEvent) {
      this.setText(
        this.elements.lastEvent,
        this.formatEvent(
          minting.lastEvent
        )
      );
    }

    return this.getSnapshot();
  }

  renderNetworkStatus(network = {}) {
    const status =
      network.status ??
      (
        network.running
          ? "SIMULATION ACTIVE"
          : "IDLE"
      );

    this.setStatus(
      this.elements.networkStatus,
      status,
      network.running
        ? "active"
        : "idle"
    );
  }

  renderTransitionStatus(
    transition = {}
  ) {
    let status =
      transition.status;

    if (!status) {
      status =
        transition.transitionFinalized
          ? "FINALIZED"
          : transition.fullyRealized
            ? "READY"
            : "PENDING";
    }

    this.setStatus(
      this.elements.transitionStatus,
      status,
      transition.transitionFinalized
        ? "active"
        : transition.fullyRealized
          ? "ready"
          : "pending"
    );
  }

  renderCustodialStatus(
    custody = {}
  ) {
    const active =
      custody.windowActive ??
      custody.authorized ??
      false;

    const status =
      custody.status ??
      (
        active
          ? "CUSTODIAL WINDOW ACTIVE"
          : "CUSTODIAL WINDOW INACTIVE"
      );

    this.setStatus(
      this.elements.custodialStatus,
      status,
      active
        ? "active"
        : "inactive"
    );
  }

  setText(element, value) {
    if (!element) {
      return;
    }

    element.textContent =
      value === undefined ||
      value === null ||
      value === ""
        ? "—"
        : String(value);
  }

  setProgress(element, value) {
    if (!element) {
      return;
    }

    const normalized =
      this.normalizeProgress(value);

    element.textContent =
      normalized === null
        ? "—"
        : `${Math.round(
            normalized * 100
          )}%`;

    if ("value" in element) {
      element.value =
        normalized === null
          ? 0
          : normalized * 100;
    }

    element.setAttribute(
      "aria-valuenow",
      normalized === null
        ? "0"
        : String(
            Math.round(
              normalized * 100
            )
          )
    );
  }

  setStatus(
    element,
    text,
    state = "idle"
  ) {
    if (!element) {
      return;
    }

    this.setText(element, text);

    element.dataset.status = state;
  }

  formatCount(value) {
    if (
      value === undefined ||
      value === null
    ) {
      return "—";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "—";
    }

    return Math.max(
      0,
      Math.floor(number)
    ).toLocaleString();
  }

  formatNumber(value) {
    if (
      value === undefined ||
      value === null
    ) {
      return "—";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "—";
    }

    return number.toLocaleString(
      undefined,
      {
        maximumFractionDigits: 8,
      }
    );
  }

  formatEvent(event) {
    if (typeof event === "string") {
      return event;
    }

    if (
      !event ||
      typeof event !== "object"
    ) {
      return "—";
    }

    if (event.message) {
      return String(event.message);
    }

    if (
      event.type &&
      event.timestamp
    ) {
      return `[${event.timestamp}] ${event.type}`;
    }

    return "—";
  }

  normalizeProgress(value) {
    if (
      value === undefined ||
      value === null
    ) {
      return null;
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
      return null;
    }

    // Accept either a 0–1 ratio or a 0–100 percentage.
    return number > 1
      ? Math.min(100, number) / 100
      : Math.max(
          0,
          Math.min(1, number)
        );
  }

  getSnapshot() {
    const snapshot = {};

    for (
      const [key, element]
      of Object.entries(this.elements)
    ) {
      snapshot[key] = element
        ? {
            text: element.textContent,
            status:
              element.dataset.status ??
              null,
          }
        : null;
    }

    return snapshot;
  }

  destroy() {
    this.elements = {};
  }
}

export {
  DEFAULT_SELECTORS,
};