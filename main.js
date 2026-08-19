/**
 * AAROHAN CHRONOS // MAIN APPLICATION ENTRY POINT
 *
 * Application bootstrap for the Vite client.
 * Initializes the UI, core engines, administrative state, and simulated
 * network layer in a predictable order.
 */

import "./input.css";

import { ChronometerEngine } from "./engine/chronometer.js";
import { MintingEngine } from "./engine/mintingEngine.js";
import { HUDRenderer } from "./ui/hudRenderer.js";
import { PulseForm } from "./ui/pulseForm.js";
import { GlobeCanvas } from "./ui/globeCanvas.js";
import { P2PSimulator } from "./network/p2pSimulator.js";
import { CustodialGuard } from "./admin/custodialGuard.js";
import { BoardTransitionController } from "./admin/boardTransition.js";

const CUSTODIAN_ENTITY = "Pinaleaf Advancements LLP";

/*
 * This device is the designated master-origin node.
 * Keep this application identity as THRINC000.
 */
const ANCHOR_NODE = "THRINC000";

function initializeApplication() {
  console.info(
    "[SYSTEM] Initializing Aarohan Chronos / MD16000 subsystem..."
  );

  const temporalStringElement =
    document.getElementById("temporal-string");

  if (!temporalStringElement) {
    throw new Error(
      "Required element #temporal-string was not found."
    );
  }

  // ---------------------------------------------------------------------------
  // Core engines
  // ---------------------------------------------------------------------------

  const mintingEngine = new MintingEngine();

  const chronometer = new ChronometerEngine(
    (serialString) => {
      temporalStringElement.textContent = serialString;
    }
  );

  // ---------------------------------------------------------------------------
  // Administrative state
  // ---------------------------------------------------------------------------

  const custodialGuard = new CustodialGuard();

  const boardTransition =
    new BoardTransitionController();

  const custodyVerification =
    custodialGuard.verifyCustodialPrivilege(
      CUSTODIAN_ENTITY
    );

  console.info(
    `[ADMIN] ${custodyVerification.message}`
  );

  const auditResult =
    boardTransition.auditNodeRealization();

  console.info(
    `[ADMIN] Node realization audit status -> ${auditResult.status}`
  );

  // ---------------------------------------------------------------------------
  // HUD
  // ---------------------------------------------------------------------------

  const hudRenderer = new HUDRenderer();

  const custodyState = {
    ...custodyVerification,
    ...custodialGuard.getCustodyDetails(),
  };

  if (!custodyVerification.authorized) {
    custodyState.status =
      "CUSTODIAL VERIFICATION FAILED";
  }

  hudRenderer.render({
    network: {
      status: "INITIALIZING",
      running: false,
      currentGlobalNodes:
        auditResult.currentGlobalNodes,
      currentPrimaryNodes:
        auditResult.currentPrimaryNodes,
      globalProgress:
        auditResult.globalProgress,
      primaryProgress:
        auditResult.primaryProgress,
    },

    transition: auditResult,

    custody: custodyState,

    minting:
      mintingEngine.getBalance(),
  });

  // ---------------------------------------------------------------------------
  // Globe visualization
  // ---------------------------------------------------------------------------

  const globeCanvas =
    new GlobeCanvas("globe-container");

  // ---------------------------------------------------------------------------
  // Simulated P2P layer
  // ---------------------------------------------------------------------------
  //
  // This is intentionally a simulator. It must not be represented as a real
  // external P2P/IPFS connection.
  // ---------------------------------------------------------------------------

  const p2pSimulator =
    new P2PSimulator("gossip-feed");

  p2pSimulator.start();

  p2pSimulator.pushEvent(
    "P2P mesh simulation initialized. No external network connection established.",
    "SYS"
  );

  // ---------------------------------------------------------------------------
  // Pulse / minting UI
  // ---------------------------------------------------------------------------

  const pulseForm = new PulseForm(
    mintingEngine,
    (metricType, value, result) => {
      p2pSimulator.pushEvent(
        `Minted ${result.sessionKines.toFixed(
          2
        )} Kines from ${metricType} metric (${value.toLocaleString()} units). Total Dyne balance: ${result.totalDynes.toFixed(
          4
        )}.`,
        "MINT"
      );

      // Refresh the HUD with the latest minting balance.
      hudRenderer.render({
        network: {
          status: "SIMULATION ACTIVE",
          running: true,
          currentGlobalNodes:
            auditResult.currentGlobalNodes,
          currentPrimaryNodes:
            auditResult.currentPrimaryNodes,
          globalProgress:
            auditResult.globalProgress,
          primaryProgress:
            auditResult.primaryProgress,
        },

        transition:
          boardTransition.auditNodeRealization(),

        custody:
          custodialGuard.getCustodyDetails(),

        minting:
          mintingEngine.getBalance(),
      });
    }
  );

  // ---------------------------------------------------------------------------
  // Development diagnostics
  // ---------------------------------------------------------------------------

  if (process.env.NODE_ENV !== 'production') {
    window.aarohanChronos = {
      nodeId: ANCHOR_NODE,
      custodianEntity: CUSTODIAN_ENTITY,

      mintingEngine,
      chronometer,
      hudRenderer,
      globeCanvas,
      p2pSimulator,
      pulseForm,
      custodialGuard,
      boardTransition,

      custodyVerification,
      auditResult,
    };
  }

  return {
    nodeId: ANCHOR_NODE,
    custodianEntity: CUSTODIAN_ENTITY,

    mintingEngine,
    chronometer,
    hudRenderer,
    globeCanvas,
    p2pSimulator,
    pulseForm,
    custodialGuard,
    boardTransition,

    custodyVerification,
    auditResult,
  };
}

function bootstrap() {
  try {
    initializeApplication();
  } catch (error) {
    console.error(
      "[SYSTEM] Aarohan Chronos initialization failed.",
      error
    );

    const feedElement =
      document.getElementById("gossip-feed");

    if (feedElement) {
      const entry =
        document.createElement("div");

      entry.className = "text-red-400";

      entry.textContent =
        "[ERROR] Application initialization failed. Check the browser console.";

      feedElement.prepend(entry);
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    bootstrap,
    {
      once: true,
    }
  );
} else {
  bootstrap();
}
```
