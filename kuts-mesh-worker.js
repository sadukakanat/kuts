/**
 * KUTS GLOBAL NETWORK HANDSHAKE ENGINE - WEB WORKER CORE
 * PROJECT: MDI6000 // MISSION: AAROHAN 2050 // LAYER 1 DEPLOYMENT
 */

const CONFIG = {
    MASTER_ORIGIN: "THRINC000",
    GEODESIC_NODES: 34,
    CALIBRATION_INTERVAL: 33, // 33ms Temporal Loop
    NET_BAL_MULTIPLIER: 0.99,
    TDS_MULTIPLIER: 0.01
};

let p2pChannel = null;
let networkClock = null;

function generateGlobalKUTSTimestamp(bracket = "(+00)") {
    const now = new Date();
    const GE = "0130"; const EE = "05"; const PE = "26"; const TE = "04"; 
    
    const Day = now.getDate().toString().padStart(2, '0');
    const GigaE = now.getHours().toString().padStart(2, '0');
    const MegaE = now.getMinutes().toString().padStart(2, '0');
    const KiloE = now.getSeconds().toString().padStart(2, '0');
    
    const ms = now.getMilliseconds();
    const BaseE = Math.floor(ms / 10).toString().padStart(2, '0');
    const MilliE = Math.floor(Math.random() * 99).toString().padStart(2, '0'); 
    const MicroE = Math.floor(Math.random() * 99).toString().padStart(2, '0');

    return {
        serializedString: `${bracket}:${GE}.${EE}.${PE}.${TE}.${Day}.${GigaE}.${MegaE}.${KiloE}.${BaseE}.${MilliE}.${MicroE}`,
        tickOnly: `${BaseE}.${MilliE}.${MicroE}`
    };
}

self.onmessage = function(e) {
    const { action, payload } = e.data;
    
    switch(action) {
        case "INITIALIZE_NODE":
            initTemporalLoop();
            initWebRTCConnection(payload.iceServers);
            break;
        case "PROCESS_KINETIC_PULSE":
            executeLeastActionProtocol(payload);
            break;
    }
};

function initTemporalLoop() {
    if (networkClock) clearInterval(networkClock);
    
    networkClock = setInterval(() => {
        const timeData = generateGlobalKUTSTimestamp("(+00)");
        self.postMessage({
            type: "CLOCK_TICK",
            timestamp: timeData.serializedString,
            precisionTick: timeData.tickOnly
        });
    }, CONFIG.CALIBRATION_INTERVAL);
}

function initWebRTCConnection(iceServers) {
    try {
        // Fallback structural mock to allow running without a live signaling server environment
        self.postMessage({ type: "STATUS_UPDATE", status: "MESH_ACTIVE" });
        
        // Background network gossip simulation noise
        setInterval(() => {
            const simCategories = [
                { bracket: "(*00*)", name: "Neural" },
                { bracket: "[@00@]", name: "Virtual" }
            ];
            const origins = ["BOMINP001", "DELINP003", "TUPINS014", "BLRINP002"];
            const cat = simCategories[Math.floor(Math.random() * simCategories.length)];
            const origin = origins[Math.floor(Math.random() * origins.length)];
            let actionText = cat.name === "Virtual" ? `AI Sync: ${Math.floor(Math.random() * 500)}k tokens` : `State verification ping`;
            
            const timeData = generateGlobalKUTSTimestamp(cat.bracket);
            self.postMessage({
                type: "INCOMING_GOSSIP_PACKET",
                entry: {
                    timestamp: timeData.serializedString,
                    bracket: cat.bracket,
                    domainName: cat.name,
                    origin: origin,
                    description: actionText,
                    kine: "0.0000",
                    flux: 0
                }
            });
        }, 4000);
    } catch (error) {
        self.postMessage({ type: "ERROR", message: "WebRTC Handshake Error: " + error.message });
    }
}

function executeLeastActionProtocol(payload) {
    const { userId, category, rawValue } = payload;
    let totalKine = 0;
    let logString = "";

    switch(category) {
        case "energy":
            totalKine = rawValue / 10;
            logString = `Log: ${rawValue.toFixed(2)} kWh Industrial Output`;
            break;
        case "distance":
            totalKine = rawValue / 100;
            logString = `Log: ${rawValue.toFixed(2)} km Freight Distance`;
            break;
        case "time":
            totalKine = rawValue / 8;
            logString = `Log: ${rawValue.toFixed(2)} Hours Labor Input`;
            break;
    }

    const netKine = totalKine * CONFIG.NET_BAL_MULTIPLIER;
    const tdsTax = totalKine * CONFIG.TDS_MULTIPLIER; 
    
    const kineticTime = generateGlobalKUTSTimestamp("[<<00>>]");
    const kineticPacket = {
        timestamp: kineticTime.serializedString,
        bracket: "[<<00>>]",
        domainName: "Kinetic",
        origin: userId,
        description: logString,
        kine: netKine.toFixed(4),
        flux: Math.floor(netKine * 100)
    };
    
    self.postMessage({ type: "LEDGER_ENTRY_MINT", entry: kineticPacket });

    setTimeout(() => {
        const fiscalTime = generateGlobalKUTSTimestamp("[$00$]");
        const fiscalPacket = {
            timestamp: fiscalTime.serializedString,
            bracket: "[$00$]",
            domainName: "Fiscal",
            origin: "THRIND000", 
            description: "Least Action Auth: 1% TDS Extracted",
            kine: tdsTax.toFixed(4),
            flux: Math.floor(tdsTax * 100)
        };
        self.postMessage({ type: "LEDGER_ENTRY_MINT", entry: fiscalPacket });
    }, 300);
}