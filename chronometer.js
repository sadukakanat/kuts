/**
 * AAROHAN CHRONOS // LOCAL HIGH-RESOLUTION CHRONOMETER ENGINE
 *
 * Generates a fixed-width 22-digit local temporal serial.
 *
 * Important:
 * - Date.now() provides millisecond wall-clock time.
 * - performance.now() provides a higher-resolution monotonic clock where
 *   supported by the browser, but it does NOT guarantee nanosecond accuracy.
 * - The generated serial is a local application identifier, not a
 *   cryptographically secure or globally synchronized timestamp.
 */

const SERIAL_LENGTH = 22;
const TICK_INTERVAL_MS = 33;
const TIMESTAMP_DIGITS = 13;
const SUB_MILLISECOND_DIGITS = 6;
const SEQUENCE_DIGITS = 3;

export class ChronometerEngine {
  constructor(onTick = null) {
    this.onTick = typeof onTick === "function" ? onTick : null;
    this.timer = null;
    this.sequence = 0;
    this.lastTimestamp = "";
  }

  start() {
    if (this.timer !== null) {
      return;
    }

    this.tick();

    this.timer = setInterval(() => {
      this.tick();
    }, TICK_INTERVAL_MS);
  }

  stop() {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  tick() {
    const serialString = this.generate22DigitString();

    if (this.onTick) {
      this.onTick(serialString);
    }

    return serialString;
  }

  generate22DigitString() {
    const performanceNow =
      typeof performance !== "undefined" ? performance.now() : 0;

    const timeOrigin =
      typeof performance !== "undefined" &&
      Number.isFinite(performance.timeOrigin)
        ? performance.timeOrigin
        : Date.now();

    const preciseNow = timeOrigin + performanceNow;
    const timestampMs = Math.floor(preciseNow);

    // The browser may expose less than microsecond precision. These six
    // digits represent the available sub-millisecond clock value; they
    // should not be interpreted as guaranteed nanoseconds.
    const fractionalMilliseconds = preciseNow - timestampMs;

    const subMillisecond = Math.min(
      999999,
      Math.max(0, Math.floor(fractionalMilliseconds * 1_000_000))
    );

    const timestampPart = String(timestampMs).padStart(
      TIMESTAMP_DIGITS,
      "0"
    );

    const subMillisecondPart = String(subMillisecond).padStart(
      SUB_MILLISECOND_DIGITS,
      "0"
    );

    const baseSequence = `${timestampPart}${subMillisecondPart}`;

    if (baseSequence === this.lastTimestamp) {
      this.sequence = (this.sequence + 1) % 1000;
    } else {
      this.sequence = 0;
      this.lastTimestamp = baseSequence;
    }

    const sequencePart = String(this.sequence).padStart(
      SEQUENCE_DIGITS,
      "0"
    );

    const serial = `${baseSequence}${sequencePart}`;

    if (serial.length !== SERIAL_LENGTH) {
      throw new Error(
        `Chronometer serial must contain exactly ${SERIAL_LENGTH} digits.`
      );
    }

    return serial;
  }
}