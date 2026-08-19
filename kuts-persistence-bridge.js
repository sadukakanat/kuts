/**
 * KUTS Persistence Bridge (Layer 06 - State Mirroring Client)
 * Connects frontend browser interactions to the local Node.js Archival Relay Daemon.
 */

const KUTS_PERSISTENCE = {
    socket: null,
    daemonUrl: "ws://localhost:8085",
    isDaemonActive: false,
    reconnectInterval: 5000,
    retryTimer: null,

    /**
     * Initializes the WebSocket pipeline to the local background Node.js server
     */
    connectToRelayDaemon() {
        try {
            this.socket = new WebSocket(this.daemonUrl);

            this.socket.onopen = () => {
                console.log("[KUTS BRIDGE] Successfully linked to local Archival Relay Daemon.");
                this.isDaemonActive = true;
                this.dispatchDaemonStatus(true);
                
                // Instantly push the current local memory state upon successful connection
                this.mirrorStateToDaemon();
                
                if (this.retryTimer) {
                    clearInterval(this.retryTimer);
                    this.retryTimer = null;
                }
            };

            this.socket.onmessage = (event) => {
                try {
                    const response = JSON.parse(event.data);
                    if (response.status === "ACK") {
                        console.log(`[KUTS BRIDGE] Daemon acknowledged ledger sync. Total active blocks secured: ${response.syncCount}`);
                    }
                } catch (e) {
                    console.log("[KUTS BRIDGE] Unformatted text frame received from daemon:", event.data);
                }
            };

            this.socket.onclose = () => {
                this.isDaemonActive = false;
                this.dispatchDaemonStatus(false);
                this.attemptReconnection();
            };

            this.socket.onerror = (error) => {
                // Silent fail to ensure standard MSME user sessions do not crash if they aren't hosting the daemon
                this.socket.close();
            };

        } catch (err) {
            console.warn("[KUTS BRIDGE] Relay Daemon not found. Operating in browser-only isolated memory mode.");
        }
    },

    /**
     * Compiles current local storage keys and transmits them over the wire to the daemon
     */
    mirrorStateToDaemon() {
        if (!this.isDaemonActive || this.socket.readyState !== WebSocket.OPEN) return;

        const systemState = {
            wallet: JSON.parse(localStorage.getItem('kuts_directory_wallet')) || { balance: 0 },
            auditLogs: JSON.parse(localStorage.getItem('kuts_directory_audit_logs')) || [],
            entities: JSON.parse(localStorage.getItem('kuts_directory_entities')) || []
        };

        const frame = {
            action: "MIRROR_STATE",
            timestamp: new Date().toISOString(),
            payload: systemState
        };

        this.socket.send(JSON.stringify(frame));
    },

    /**
     * Exponential or fixed backoff to find the daemon if it is rebooted
     */
    attemptReconnection() {
        if (this.retryTimer) return;
        this.retryTimer = setInterval(() => {
            console.log("[KUTS BRIDGE] Searching for active Archival Relay Daemon...");
            this.connectToRelayDaemon();
        }, this.reconnectInterval);
    },

    /**
     * Dispatches a custom window event to update the Genesis browser UI status lights
     */
    dispatchDaemonStatus(status) {
        window.dispatchEvent(new CustomEvent("KUTS_DAEMON_STATUS", { detail: status }));
    }
};

// --- Execution Observers ---

// 1. Boot up the connection tracker on window load
window.addEventListener('DOMContentLoaded', () => {
    KUTS_PERSISTENCE.connectToRelayDaemon();
});

// 2. Listen for any transaction shifts across the browser and immediately pipe them to cold storage
window.addEventListener('storage', () => {
    KUTS_PERSISTENCE.mirrorStateToDaemon();
});

// 3. Bind a custom event to capture actions made specifically inside the active current tab
window.addEventListener('KUTS_TRANSACTION_EXECUTED', () => {
    KUTS_PERSISTENCE.mirrorStateToDaemon();
});