/**
 * AAROHAN CHRONOS // GLOBE CANVAS
 *
 * Lightweight canvas visualization for the prototype UI.
 *
 * IMPORTANT:
 * This is a visual simulation only. It does not display verified geographic
 * positions, real network peers, or real-time node telemetry.
 */

const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 360;
const DEFAULT_DPR_LIMIT = 2;

export class GlobeCanvas {
  constructor(
    containerId = "globe-container",
    {
      width = DEFAULT_WIDTH,
      height = DEFAULT_HEIGHT,
      devicePixelRatioLimit = DEFAULT_DPR_LIMIT,
      autoStart = true,
    } = {}
  ) {
    if (!containerId || typeof containerId !== "string") {
      throw new TypeError("containerId must be a non-empty string.");
    }

    if (!Number.isFinite(width) || width <= 0) {
      throw new RangeError("width must be greater than zero.");
    }

    if (!Number.isFinite(height) || height <= 0) {
      throw new RangeError("height must be greater than zero.");
    }

    if (
      !Number.isFinite(devicePixelRatioLimit) ||
      devicePixelRatioLimit <= 0
    ) {
      throw new RangeError(
        "devicePixelRatioLimit must be greater than zero."
      );
    }

    this.containerId = containerId;
    this.defaultWidth = width;
    this.defaultHeight = height;
    this.devicePixelRatioLimit = devicePixelRatioLimit;

    this.container = document.getElementById(containerId);

    if (!this.container) {
      throw new Error(
        `Globe container "#${containerId}" was not found.`
      );
    }

    this.canvas = document.createElement("canvas");

    this.canvas.setAttribute(
      "aria-label",
      "Simulated network globe"
    );

    this.canvas.setAttribute("role", "img");

    this.context = this.canvas.getContext("2d");

    if (!this.context) {
      throw new Error("Canvas 2D context is unavailable.");
    }

    this.container.replaceChildren(this.canvas);

    this.width = 0;
    this.height = 0;
    this.dpr = 1;

    this.rotation = 0;
    this.lastFrameTime = 0;
    this.animationFrame = null;
    this.running = false;

    this.resizeObserver = null;

    this.handleWindowResize =
      this.handleWindowResize.bind(this);

    this.renderFrame = this.renderFrame.bind(this);

    this.resize();

    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => {
        this.resize();
      });

      this.resizeObserver.observe(this.container);
    } else {
      window.addEventListener(
        "resize",
        this.handleWindowResize
      );
    }

    if (autoStart) {
      this.start();
    }
  }

  start() {
    if (this.running) {
      return;
    }

    this.running = true;
    this.lastFrameTime = performance.now();

    this.animationFrame = requestAnimationFrame(
      this.renderFrame
    );
  }

  stop() {
    this.running = false;

    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    this.lastFrameTime = 0;
  }

  destroy() {
    this.stop();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    } else {
      window.removeEventListener(
        "resize",
        this.handleWindowResize
      );
    }

    if (this.canvas.parentNode === this.container) {
      this.container.removeChild(this.canvas);
    }
  }

  handleWindowResize() {
    this.resize();
  }

  resize() {
    const rect = this.container.getBoundingClientRect();

    const cssWidth = Math.max(
      1,
      Math.round(rect.width || this.defaultWidth)
    );

    const cssHeight = Math.max(
      1,
      Math.round(rect.height || this.defaultHeight)
    );

    const devicePixelRatio = Math.min(
      window.devicePixelRatio || 1,
      this.devicePixelRatioLimit
    );

    this.width = cssWidth;
    this.height = cssHeight;
    this.dpr = devicePixelRatio;

    this.canvas.width = Math.round(
      cssWidth * devicePixelRatio
    );

    this.canvas.height = Math.round(
      cssHeight * devicePixelRatio
    );

    this.canvas.style.width = `${cssWidth}px`;
    this.canvas.style.height = `${cssHeight}px`;

    this.context.setTransform(
      devicePixelRatio,
      0,
      0,
      devicePixelRatio,
      0,
      0
    );

    this.draw();
  }

  renderFrame(timestamp) {
    if (!this.running) {
      return;
    }

    const elapsed = Math.min(
      100,
      Math.max(0, timestamp - this.lastFrameTime)
    );

    this.lastFrameTime = timestamp;

    this.rotation += elapsed * 0.00025;

    this.draw();

    this.animationFrame =
      requestAnimationFrame(this.renderFrame);
  }

  draw() {
    const ctx = this.context;

    ctx.clearRect(
      0,
      0,
      this.width,
      this.height
    );

    const centerX = this.width / 2;
    const centerY = this.height / 2;

    const radius = Math.max(
      20,
      Math.min(this.width, this.height) * 0.32
    );

    this.drawGlow(
      ctx,
      centerX,
      centerY,
      radius
    );

    this.drawGrid(
      ctx,
      centerX,
      centerY,
      radius
    );

    this.drawNodes(
      ctx,
      centerX,
      centerY,
      radius
    );

    this.drawAnchor(
      ctx,
      centerX,
      centerY,
      radius
    );
  }

  drawGlow(ctx, centerX, centerY, radius) {
    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      radius * 0.25,
      centerX,
      centerY,
      radius * 1.4
    );

    gradient.addColorStop(
      0,
      "rgba(16, 185, 129, 0.14)"
    );

    gradient.addColorStop(
      1,
      "rgba(16, 185, 129, 0)"
    );

    ctx.fillStyle = gradient;

    ctx.beginPath();

    ctx.arc(
      centerX,
      centerY,
      radius * 1.4,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  drawGrid(ctx, centerX, centerY, radius) {
    ctx.save();

    ctx.strokeStyle =
      "rgba(148, 163, 184, 0.28)";

    ctx.lineWidth = 1;

    ctx.beginPath();

    ctx.arc(
      centerX,
      centerY,
      radius,
      0,
      Math.PI * 2
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.ellipse(
      centerX,
      centerY,
      radius,
      radius * 0.38,
      0,
      0,
      Math.PI * 2
    );

    ctx.stroke();

    const tilt =
      Math.sin(this.rotation) *
      radius *
      0.08;

    ctx.beginPath();

    ctx.ellipse(
      centerX + tilt,
      centerY,
      radius * 0.42,
      radius,
      0,
      0,
      Math.PI * 2
    );

    ctx.stroke();

    ctx.restore();
  }

  drawNodes(ctx, centerX, centerY, radius) {
    const nodeCount = 12;

    ctx.save();

    for (
      let index = 0;
      index < nodeCount;
      index += 1
    ) {
      const angle =
        (index / nodeCount) *
          Math.PI *
          2 +
        this.rotation;

      const latitudeFactor =
        Math.sin(index * 1.7) * 0.62;

      const longitudeRadius =
        Math.sqrt(
          Math.max(
            0,
            1 - latitudeFactor ** 2
          )
        ) * radius;

      const x =
        centerX +
        Math.cos(angle) *
          longitudeRadius;

      const y =
        centerY +
        latitudeFactor *
          radius *
          0.72;

      const visibility =
        Math.cos(angle) * 0.5 + 0.5;

      ctx.globalAlpha =
        0.3 + visibility * 0.7;

      ctx.fillStyle =
        "rgba(45, 212, 191, 0.9)";

      ctx.beginPath();

      ctx.arc(
        x,
        y,
        2.5,
        0,
        Math.PI * 2
      );

      ctx.fill();
    }

    ctx.restore();
  }

  drawAnchor(ctx, centerX, centerY, radius) {
    const pulse =
      1 +
      Math.sin(
        performance.now() * 0.004
      ) *
        0.08;

    ctx.save();

    ctx.strokeStyle =
      "rgba(16, 185, 129, 0.8)";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.arc(
      centerX,
      centerY,
      radius * 0.16 * pulse,
      0,
      Math.PI * 2
    );

    ctx.stroke();

    ctx.fillStyle =
      "rgba(16, 185, 129, 0.9)";

    ctx.beginPath();

    ctx.arc(
      centerX,
      centerY,
      4,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
  }
}

export {
  DEFAULT_WIDTH,
  DEFAULT_HEIGHT,
  DEFAULT_DPR_LIMIT,
};