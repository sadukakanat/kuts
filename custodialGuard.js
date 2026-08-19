/**
 * AAROHAN CHRONOS // CUSTODIAL GUARD
 *
 * Describes and evaluates the application's initial custodial policy.
 *
 * IMPORTANT:
 * This class is a client-side policy helper. It is NOT a security boundary.
 * A browser user can modify JavaScript at runtime, so production
 * authorization must be enforced by a trusted backend, signed policy,
 * cryptographic capability, or other trusted control plane.
 */

const DEFAULT_CUSTODIAN_ENTITY = "Pinaleaf Advancements LLP";
const DEFAULT_GROUND_ZERO_NODE = "THRIND000 (Kanimangalam, Thrissur)";
const DEFAULT_ESTABLISHMENT_YEAR = 2026;
const DEFAULT_MANDATE_YEARS = 5;

export class CustodialGuard {
  constructor({
    custodianEntity = DEFAULT_CUSTODIAN_ENTITY,
    groundZeroNode = DEFAULT_GROUND_ZERO_NODE,
    establishmentYear = DEFAULT_ESTABLISHMENT_YEAR,
    mandateYears = DEFAULT_MANDATE_YEARS,
    now = () => new Date(),
  } = {}) {
    if (!custodianEntity || typeof custodianEntity !== "string") {
      throw new TypeError("custodianEntity must be a non-empty string.");
    }

    if (!groundZeroNode || typeof groundZeroNode !== "string") {
      throw new TypeError("groundZeroNode must be a non-empty string.");
    }

    if (!Number.isInteger(establishmentYear) || establishmentYear < 1) {
      throw new TypeError("establishmentYear must be a positive integer.");
    }

    if (!Number.isInteger(mandateYears) || mandateYears <= 0) {
      throw new TypeError("mandateYears must be a positive integer.");
    }

    if (typeof now !== "function") {
      throw new TypeError("now must be a function.");
    }

    this.custodianEntity = custodianEntity;
    this.groundZeroNode = groundZeroNode;
    this.initialMandateYears = mandateYears;
    this.establishmentYear = establishmentYear;
    this.now = now;
  }

  getMandateEndYear() {
    return this.establishmentYear + this.initialMandateYears;
  }

  isWithinInitialCustodialWindow(date = this.now()) {
    const currentDate = this.normalizeDate(date);
    const currentYear = currentDate.getUTCFullYear();

    return (
      currentYear >= this.establishmentYear &&
      currentYear < this.getMandateEndYear()
    );
  }

  verifyCustodialPrivilege(entity, date = this.now()) {
    const entityMatches = entity === this.custodianEntity;
    const windowActive = this.isWithinInitialCustodialWindow(date);

    if (entityMatches && windowActive) {
      return {
        authorized: true,
        entity: this.custodianEntity,
        windowActive: true,
        mandateEndYear: this.getMandateEndYear(),
        securityLevel: "CLIENT_POLICY_ONLY",
        message:
          "Custodial policy permits the designated entity during the initial custodial window.",
      };
    }

    if (!entityMatches) {
      return {
        authorized: false,
        entity: entity ?? null,
        windowActive,
        mandateEndYear: this.getMandateEndYear(),
        securityLevel: "CLIENT_POLICY_ONLY",
        message:
          "Access denied: the supplied entity does not match the designated custodian.",
      };
    }

    return {
      authorized: false,
      entity: this.custodianEntity,
      windowActive: false,
      mandateEndYear: this.getMandateEndYear(),
      securityLevel: "CLIENT_POLICY_ONLY",
      message:
        "Access denied: the initial custodial window has expired.",
    };
  }

  getCustodyDetails(date = this.now()) {
    const currentDate = this.normalizeDate(date);

    return {
      entity: this.custodianEntity,
      node: this.groundZeroNode,
      establishmentYear: this.establishmentYear,
      mandateYears: this.initialMandateYears,
      mandateEndYear: this.getMandateEndYear(),
      windowActive: this.isWithinInitialCustodialWindow(currentDate),
      activeWindow: `Years 1 through ${this.initialMandateYears} (Initiated: ${this.establishmentYear})`,
      securityLevel: "CLIENT_POLICY_ONLY",
    };
  }

  normalizeDate(date) {
    const normalizedDate =
      date instanceof Date ? new Date(date) : new Date(date);

    if (Number.isNaN(normalizedDate.getTime())) {
      throw new TypeError("Invalid date supplied to CustodialGuard.");
    }

    return normalizedDate;
  }
}

export {
  DEFAULT_CUSTODIAN_ENTITY,
  DEFAULT_GROUND_ZERO_NODE,
  DEFAULT_ESTABLISHMENT_YEAR,
  DEFAULT_MANDATE_YEARS,
};