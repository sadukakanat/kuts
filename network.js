/**
 * KUTS Core Network Module
 *
 * Initial development implementation.
 *
 * This module provides a simple local node model.
 *
 * It is NOT yet a real peer-to-peer network.
 */

class KutsNode {
    constructor({
        nodeId,
        ledger
    }) {
        this.nodeId = nodeId;

        this.ledger = ledger;

        this.peers = new Map();

        this.status = "OFFLINE";
    }

    /**
     * Start the node.
     */
    start() {
        this.status = "ONLINE";

        return {
            nodeId: this.nodeId,
            status: this.status
        };
    }

    /**
     * Stop the node.
     */
    stop() {
        this.status = "OFFLINE";

        return {
            nodeId: this.nodeId,
            status: this.status
        };
    }

    /**
     * Connect to another local node.
     */
    connectPeer(peerNode) {
        if (
            !peerNode ||
            !peerNode.nodeId
        ) {
            throw new Error(
                "Invalid peer node"
            );
        }

        this.peers.set(
            peerNode.nodeId,
            peerNode
        );

        return {
            connected: true,
            peerId: peerNode.nodeId
        };
    }

    /**
     * Disconnect from a peer.
     */
    disconnectPeer(peerId) {
        this.peers.delete(peerId);

        return {
            disconnected: true,
            peerId
        };
    }

    /**
     * Return connected peers.
     */
    getPeers() {
        return Array.from(
            this.peers.keys()
        );
    }

    /**
     * Broadcast a transaction to peers.
     *
     * This initial implementation only forwards
     * the transaction to connected local nodes.
     *
     * Each receiving node must validate the transaction
     * before committing it.
     */
    broadcastTransaction(
        transaction
    ) {
        const results = [];

        for (
            const peer of this.peers.values()
        ) {
            results.push(
                peer.receiveTransaction(
                    transaction
                )
            );
        }

        return results;
    }

    /**
     * Receive a transaction.
     *
     * Validation will later be connected to the
     * full KUTS validation pipeline.
     */
    receiveTransaction(
        transaction
    ) {
        return {
            received: true,
            nodeId: this.nodeId,
            transaction
        };
    }
}

module.exports = {
    KutsNode
};