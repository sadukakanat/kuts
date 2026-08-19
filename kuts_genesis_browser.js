// Global Client Ingestion Hook
let kutsNetworkWorker = null;

const ICE_SERVERS = [
    { urls: "stun:stun.l.google.com:19302" }, // Global baseline signaling STUN fallback
    { urls: "stun:global.kuts-mesh.net:3478" } 
];

function initializeGlobalKUTSEngine() {
    console.log("Initializing Layer 1 P2P Mesh Handshake Infrastructure...");

    // Instantiating Web Worker thread configuration
    kutsNetworkWorker = new Worker("kuts-mesh-worker.js");

    // Worker Event Routing Controller
    kutsNetworkWorker.onmessage = function(e) {
        const { type, timestamp, precisionTick, entry, status, packet } = e.data;

        switch(type) {
            case "CLOCK_TICK":
                document.getElementById('kuts-clock').innerText = timestamp;
                document.getElementById('micro-tick').innerText = precisionTick;
                break;

            case "STATUS_UPDATE":
                console.log(`[KUTS STATUS] Mesh Handshake Pipeline Status: ${status}`);
                break;

            case "LEDGER_ENTRY_MINT":
                // Pipe output directly into UI layout renderer function
                injectLedgerEntry(
                    entry.bracket, 
                    entry.domainName, 
                    getDomainColorClass(entry.bracket), 
                    getDomainBgClass(entry.bracket), 
                    entry.origin, 
                    entry.description, 
                    entry.kine, 
                    entry.flux
                );
                break;
                
            case "INCOMING_GOSSIP_PACKET":
                console.log("[P2P MESH GOSSIP] Structural sync packet received: ", packet);
                break;
        }
    };

    // Spin up spatial worker engine loop
    kutsNetworkWorker.postMessage({
        action: "INITIALIZE_NODE",
        payload: { iceServers: ICE_SERVERS }
    });

    // Wire main terminal form to use the background engine worker
    overrideTerminalFormSubmission();
}

function getDomainColorClass(bracket) {
    return bracket === "[$00$]" ? "text-emerald-400" : "text-orange-400";
}

function getDomainBgClass(bracket) {
    return bracket === "[$00$]" ? "bg-emerald-900/30" : "bg-orange-900/30";
}

function overrideTerminalFormSubmission() {
    const pulseForm = document.getElementById('daily-pulse-form');
    if(!pulseForm) return;

    pulseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const payload = {
            userId: document.getElementById('dp-id').value.toUpperCase(),
            category: document.getElementById('dp-type').value,
            rawValue: parseFloat(document.getElementById('dp-value').value)
        };

        // Dispatch raw action telemetry payload down to isolated worker thread
        kutsNetworkWorker.postMessage({
            action: "PROCESS_KINETIC_PULSE",
            payload: payload
        });

        // Clear layout element states cleanly
        document.getElementById('dp-value').value = '';
    });
}

// Fire initialization routine on system start
window.addEventListener('DOMContentLoaded', initializeGlobalKUTSEngine);