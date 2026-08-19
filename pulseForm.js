/**
 * AAROHAN CHRONOS // PULSE FORM
 *
 * Browser-side form controller for the deterministic MintingEngine.
 *
 * The authoritative client calculation is:
 *   engine.processPulse(metricType, value)
 *
 * This UI layer validates input and presents the result. It does not claim
 * that the supplied metric came from a trusted physical or external source.
 */

const DEFAULT_FORM_ID = "pulse-form";
const DEFAULT_STATUS_ID = "pulse-status";

const DEFAULT_FIELD_NAMES = Object.freeze({
  metricType: "metricType",
  value: "value",
});

export class PulseForm {
  constructor(
    engine,
    onMint = null,
    {
      formId = DEFAULT_FORM_ID,
      statusId = DEFAULT_STATUS_ID,
      fieldNames = {},
    } = {}
  ) {
    if (
      !engine ||
      typeof engine.processPulse !== "function"
    ) {
      throw new TypeError(
        "A compatible MintingEngine with processPulse(metricType, value) is required."
      );
    }

    if (
      onMint !== null &&
      typeof onMint !== "function"
    ) {
      throw new TypeError(
        "onMint must be a function or null."
      );
    }

    if (
      !formId ||
      typeof formId !== "string"
    ) {
      throw new TypeError(
        "formId must be a non-empty string."
      );
    }

    if (
      !statusId ||
      typeof statusId !== "string"
    ) {
      throw new TypeError(
        "statusId must be a non-empty string."
      );
    }

    this.engine = engine;
    this.onMint = onMint;

    this.formId = formId;
    this.statusId = statusId;

    this.fieldNames = {
      ...DEFAULT_FIELD_NAMES,
      ...fieldNames,
    };

    this.form =
      document.getElementById(formId);

    this.statusElement =
      document.getElementById(statusId);

    if (!this.form) {
      throw new Error(
        `Pulse form "#${formId}" was not found.`
      );
    }

    this.submitHandler =
      this.handleSubmit.bind(this);

    this.bound = false;
    this.submitting = false;

    this.bind();
  }

  bind() {
    if (this.bound) {
      return;
    }

    this.form.addEventListener(
      "submit",
      this.submitHandler
    );

    this.bound = true;
  }

  destroy() {
    if (!this.bound) {
      return;
    }

    this.form.removeEventListener(
      "submit",
      this.submitHandler
    );

    this.bound = false;
  }

  async handleSubmit(event) {
    event.preventDefault();

    if (this.submitting) {
      return;
    }

    this.clearStatus();

    const input = this.readForm();

    const validation =
      this.validateInput(input);

    if (!validation.valid) {
      this.setStatus(
        validation.message,
        "error"
      );

      return;
    }

    this.setSubmitting(true);

    try {
      const result =
        this.engine.processPulse(
          validation.value.metricType,
          validation.value.value
        );

      this.setStatus(
        this.getSuccessMessage(result),
        "success"
      );

      if (this.onMint) {
        try {
          await this.onMint(
            validation.value.metricType,
            validation.value.value,
            result
          );
        } catch (callbackError) {
          console.error(
            "[PULSE] Mint callback failed.",
            callbackError
          );
        }
      }

      this.resetForm();

      return result;
    } catch (error) {
      this.setStatus(
        this.getErrorMessage(error),
        "error"
      );

      return null;
    } finally {
      this.setSubmitting(false);
    }
  }

  readForm() {
    const data =
      new FormData(this.form);

    return {
      metricType:
        this.getStringValue(
          data.get(
            this.fieldNames.metricType
          )
        ),

      value:
        this.getStringValue(
          data.get(
            this.fieldNames.value
          )
        ),
    };
  }

  validateInput(input) {
    if (!input.metricType) {
      return {
        valid: false,
        message:
          "Please select a metric type.",
      };
    }

    const supportedRules =
      typeof this.engine.getMetricRules ===
      "function"
        ? this.engine.getMetricRules()
        : null;

    if (
      supportedRules &&
      !Object.hasOwn(
        supportedRules,
        input.metricType
      )
    ) {
      return {
        valid: false,
        message:
          `Unsupported metric type: ${input.metricType}`,
      };
    }

    if (!input.value) {
      return {
        valid: false,
        message:
          "Please enter a metric value.",
      };
    }

    const value =
      Number(input.value);

    if (!Number.isFinite(value)) {
      return {
        valid: false,
        message:
          "Metric value must be a valid number.",
      };
    }

    if (value <= 0) {
      return {
        valid: false,
        message:
          "Metric value must be greater than zero.",
      };
    }

    return {
      valid: true,

      value: {
        metricType: input.metricType,
        value,
      },
    };
  }

  getSuccessMessage(result) {
    if (
      result &&
      Number.isFinite(
        result.sessionKines
      ) &&
      Number.isFinite(
        result.totalDynes
      )
    ) {
      return (
        `Minted ${result.sessionKines.toFixed(2)} Kines. ` +
        `Total Dyne balance: ${result.totalDynes.toFixed(4)}.`
      );
    }

    return "Pulse recorded successfully.";
  }

  getErrorMessage(error) {
    if (
      error &&
      typeof error.message === "string" &&
      error.message.trim()
    ) {
      return error.message;
    }

    return "Unable to process the pulse.";
  }

  setSubmitting(submitting) {
    this.submitting = submitting;

    const controls =
      this.form.querySelectorAll(
        "button, input, select, textarea"
      );

    controls.forEach((control) => {
      control.disabled = submitting;
    });

    const submitButton =
      this.form.querySelector(
        '[type="submit"]'
      );

    if (submitButton) {
      submitButton.setAttribute(
        "aria-busy",
        String(submitting)
      );
    }
  }

  setStatus(
    message,
    type = "info"
  ) {
    if (!this.statusElement) {
      return;
    }

    this.statusElement.textContent =
      message;

    this.statusElement.dataset.status =
      type;

    this.statusElement.hidden = false;
  }

  clearStatus() {
    if (!this.statusElement) {
      return;
    }

    this.statusElement.textContent =
      "";

    this.statusElement.dataset.status =
      "";

    this.statusElement.hidden = true;
  }

  resetForm() {
    this.form.reset();
  }

  getStringValue(value) {
    return typeof value === "string"
      ? value.trim()
      : "";
  }

  getStatus() {
    return {
      formId: this.formId,
      bound: this.bound,
      submitting: this.submitting,
    };
  }
}

export {
  DEFAULT_FORM_ID,
  DEFAULT_STATUS_ID,
  DEFAULT_FIELD_NAMES,
};
```
