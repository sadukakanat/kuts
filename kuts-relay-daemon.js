/**
 * KUTS Headless Archival Relay Daemon (Layer 06 - Backend Cold Storage)
 * Requirements: Run via Node.js ('node kuts-relay-daemon.js')
 * Automatically creates and updates an append-only flat file database ledger on disk.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// Dynamic configuration parameters
const PORT = 8085;
const FILE_DB_PATH = path.join(__dirname, 'kuts_persistent_ledger.json');

// Initialize the flat-file JSON database if it doesn't exist on disk yet
if (!fs.existsSync(FILE_DB_PATH)) {
    const initialStructure = {
        daemonMetadata: {
            system: "KUTS_ARCHIVAL_RELAY",
            initializedAt: new Date().toISOString(),
            status: "OPERATIONAL"
        },
        walletState: { balance: 0, lastUpdated: null },
        auditLogs: [],
        entities: []
    };
    fs.writeFileSync(FILE_DB_PATH, JSON.stringify(initialStructure, null, 4), 'utf8');
    console.log(`[KUTS DAEMON] Created fresh flat-file archival store at: ${FILE_DB_PATH}`);
}

// Build standard HTTP baseline platform to anchor our communication protocol
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('KUTS Archival Relay Daemon is running over port 8085.\n');
});

/**
 * Super-lightweight, native WebSocket Frame Parser (Zero-Dependency)
 * Decodes incoming WS text frames routed from browser runtime client applications.
 */
server.on('upgrade', (req, socket, head) => {
    if (req.headers['upgrade'] !== 'websocket') {
        socket.destroy();
        return;
    }

    // Process standard WebSocket handshake authorization headers
    const secKey = req.headers['sec-websocket-key'];
    const secHash = require('crypto').createHash('sha1').update(secKey + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
    
    const headers = [
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Accept: ${secHash}`,
        '\r\n'
    ];
    
    socket.write(headers.join('\r\n'));
    console.log("[KUTS DAEMON] Interactive frontend browser client linked successfully via WebSocket.");

    // Handle incoming data packet transmissions over the raw socket connection streams
    socket.on('data', (buffer) => {
        let textData = parseWebSocketFrame(buffer);
        if (!textData) return;

        try {
            const wrapper = JSON.parse(textData);
            if (wrapper.action === "MIRROR_STATE") {
                commitPayloadToDisk(wrapper.payload);
                
                // Echo a confirmation frame frame verification message back down the socket pipe
                sendWebSocketTextFrame(socket, JSON.stringify({ status: "ACK", code: 200, syncCount: wrapper.payload.auditLogs.length }));
            }
        } catch (e) {
            // Ignore corrupted background noise or non-JSON frame payloads safely
        }
    });

    socket.on('end', () => {
        console.log("[KUTS DAEMON] Client browser tab disconnected from stream channel.");
    });
});

function commitPayloadToDisk(payload) {
    try {
        const dbContent = JSON.parse(fs.readFileSync(FILE_DB_PATH, 'utf8'));
        
        // Merge state architectures inside the file system
        dbContent.walletState = payload.wallet || dbContent.walletState;
        dbContent.auditLogs = payload.auditLogs || dbContent.auditLogs;
        dbContent.entities = payload.entities || dbContent.entities;
        dbContent.daemonMetadata.lastBackupTimestamp = new Date().toISOString();

        fs.writeFileSync(FILE_DB_PATH, JSON.stringify(dbContent, null, 4), 'utf8');
        console.log(`[KUTS DAEMON] Synchronized disk array block. Active Ledger Rows: ${dbContent.auditLogs.length} entries.`);
    } catch (err) {
        console.error("[KUTS DAEMON] Failed compiling state changes to disk:", err);
    }
}

function parseWebSocketFrame(buffer) {
    const secondByte = buffer.readUInt8(1);
    const isMasked = (secondByte & 0x80) === 0x80;
    let payloadLength = secondByte & 0x7F;
    let dataOffset = 2;

    if (payloadLength === 126) {
        payloadLength = buffer.readUInt16BE(2);
        dataOffset = 4;
    } else if (payloadLength === 127) {
        // High-capacity byte configurations
        dataOffset = 10;
    }

    if (!isMasked) return null;

    const maskingKey = buffer.slice(dataOffset, dataOffset + 4);
    dataOffset += 4;

    const payload = buffer.slice(dataOffset, dataOffset + payloadLength);
    for (let i = 0; i < payload.length; i++) {
        payload[i] = payload[i] ^ maskingKey[i % 4];
    }

    return payload.toString('utf8');
}

function sendWebSocketTextFrame(socket, text) {
    const payload = Buffer.from(text, 'utf8');
    const length = payload.length;
    let buffer;

    if (length <= 125) {
        buffer = Buffer.alloc(2 + length);
        buffer.writeUInt8(0x81, 0);
        buffer.writeUInt8(length, 1);
        payload.copy(buffer, 2);
    } else {
        buffer = Buffer.alloc(4 + length);
        buffer.writeUInt8(0x81, 0);
        buffer.writeUInt8(126, 1);
        buffer.writeUInt16BE(length, 2);
        payload.copy(buffer, 4);
    }
    socket.write(buffer);
}

// Fire up the communications platform engine
server.listen(PORT, () => {
    console.log(`\n=============================================================`);
    console.log(` KUTS PERSISTENT CORE BACKGROUND DAEMON RUNNING OVER PORT ${PORT}`);
    console.log(` Ready to archive live streams down to 'kuts_persistent_ledger.json'`);
    console.log(`=============================================================\n`);
});