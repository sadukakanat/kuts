/**
 * KUTS P2P Mesh Communication Engine (Layer 05 - Wire Networking Core)
 * Handles RTC peer initialization, cryptographic channel bindings, and message framing.
 */

const KUTS_P2P = {
    peerConnection: null,
    dataChannel: null,
    connectionState: "DISCONNECTED",

    // Standard public STUN turnstiles to resolve local NAT configurations safely
    rtcConfig: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    },

    /**
     * Node Alpha: Initialize a session and generate an Outbound Connection Offer string
     */
    async initiateConnection() {
        this.closeExistingConnection();
        
        this.peerConnection = new RTCPeerConnection(this.rtcConfig);
        this.connectionState = "INITIALIZING";
        
        // Open the raw, ordered biometric/ledger pipeline frame
        this.dataChannel = this.peerConnection.createDataChannel("kuts_wire_channel", {
            ordered: true
        });
        
        this.bindChannelEvents();
        this.bindPeerEvents();

        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        return new Promise((resolve) => {
            // Wait for local network ICE candidates to gather completely before exporting the string token
            this.peerConnection.onicegatheringstatechange = () => {
                if (this.peerConnection.iceGatheringState === "complete") {
                    const encodedOffer = btoa(JSON.stringify(this.peerConnection.localDescription));
                    this.connectionState = "AWAITING_ANSWER";
                    resolve(encodedOffer);
                }
            };
        });
    },

    /**
     * Node Beta: Ingest Node Alpha's Offer string, configure local slot, and return an Answer string
     */
    async acceptOfferAndCreateAnswer(encodedOffer) {
        this.closeExistingConnection();
        
        this.peerConnection = new RTCPeerConnection(this.rtcConfig);
        this.connectionState = "CONNECTING";

        this.bindPeerEvents();

        // Listen for incoming channel allocations dispatched by Node Alpha
        this.peerConnection.ondatachannel = (event) => {
            this.dataChannel = event.channel;
            this.bindChannelEvents();
        };

        const parsedOffer = new RTCSessionDescription(JSON.parse(atob(encodedOffer)));
        await this.peerConnection.setRemoteDescription(parsedOffer);

        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        return new Promise((resolve) => {
            this.peerConnection.onicegatheringstatechange = () => {
                if (this.peerConnection.iceGatheringState === "complete") {
                    const encodedAnswer = btoa(JSON.stringify(this.peerConnection.localDescription));
                    resolve(encodedAnswer);
                }
            };
        });
    },

    /**
     * Node Alpha: Finalize Handshake by ingesting Node Beta's Answer string token
     */
    async finalizeHandshake(encodedAnswer) {
        if (!this.peerConnection) return false;
        const parsedAnswer = new RTCSessionDescription(JSON.parse(atob(encodedAnswer)));
        await this.peerConnection.setRemoteDescription(parsedAnswer);
        return true;
    },

    /**
     * Binds state change events directly to the peer architecture
     */
    bindPeerEvents() {
        this.peerConnection.onconnectionstatechange = () => {
            this.connectionState = this.peerConnection.connectionState.toUpperCase();
            this.dispatchNetworkStatePulse();
        };
    },

    /**
     * Binds messaging stream protocols to the operational channel pipeline
     */
    bindChannelEvents() {
        if (!this.dataChannel) return;

        this.dataChannel.onopen = () => {
            this.connectionState = "CONNECTED";
            this.dispatchNetworkStatePulse();
            this.sendFrame("SYS_HANDSHAKE_PULSE", { activeNode: "REMOTE_PEER_SLOT" });
        };

        this.dataChannel.onclose = () => {
            this.connectionState = "DISCONNECTED";
            this.dispatchNetworkStatePulse();
        };

        this.dataChannel.onmessage = (event) => {
            try {
                const parsedFrame = JSON.parse(event.data);
                this.routeIncomingFrame(parsedFrame);
            } catch (err) {
                console.error("Wire Protocol Error: Failed parsing frame envelope structure.", err);
            }
        };
    },

    /**
     * Formats and transmits an isolated message packet through the active connection pipe
     */
    sendFrame(type, payload) {
        if (!this.dataChannel || this.dataChannel.readyState !== "open") return false;
        
        const frame = {
            wireType: type,
            senderTimestamp: new Date().toISOString(),
            data: payload
        };
        
        this.dataChannel.send(JSON.stringify(frame));
        return true;
    },

    /**
     * Routes incoming wire payloads to local custom window triggers or handlers
     */
    routeIncomingFrame(frame) {
        console.log(`P2P Packet Received [${frame.wireType}]:`, frame.data);
        
        // Forward the network frame reactively out to other listening browser documents
        const event = new CustomEvent("KUTS_P2P_FRAME", { detail: frame });
        window.dispatchEvent(event);
    },

    dispatchNetworkStatePulse() {
        window.dispatchEvent(new CustomEvent("KUTS_P2P_STATE_CHANGE", { detail: this.connectionState }));
    },

    closeExistingConnection() {
        if (this.dataChannel) { this.dataChannel.close(); this.dataChannel = null; }
        if (this.peerConnection) { this.peerConnection.close(); this.peerConnection = null; }
        this.connectionState = "DISCONNECTED";
        this.dispatchNetworkStatePulse();
    }
};