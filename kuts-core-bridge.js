/**
 * KUTS Unified Core Calculations Bridge System
 * Manages central local storage parameters, execution hooks, and systemic deduction loops.
 */

const KUTS_BRIDGE = {
    // Shared LocalStorage memory key maps
    STORAGE_KEYS: {
        WALLET: 'kuts_directory_wallet',
        AUDIT_LOGS: 'kuts_directory_audit_logs',
        ENTITIES: 'kuts_directory_entities'
    },

    /**
     * Retrieves current node wallet state details
     */
    getWalletState() {
        const defaultState = { balance: 0.00 };
        const data = localStorage.getItem(this.STORAGE_KEYS.WALLET);
        return data ? JSON.parse(data) : defaultState;
    },

    /**
     * Retrieves the entire raw transaction audit history chain array
     */
    getAuditLogs() {
        const data = localStorage.getItem(this.STORAGE_KEYS.AUDIT_LOGS);
        return data ? JSON.parse(data) : [];
    },

    /**
     * Compiles 22-digit micro-precision timestamp string matching KUTS network contracts
     */
    generateSystemTimestamp() {
        const now = new Date();
        const GE = "0130"; const EE = "05"; const PE = "26"; const TE = "04";
        const Day = now.getDate().toString().padStart(2, '0');
        const H = now.getHours().toString().padStart(2, '0');
        const M = now.getMinutes().toString().padStart(2, '0');
        const S = now.getSeconds().toString().padStart(2, '0');
        const ms = now.getMilliseconds();
        
        const BaseE = Math.floor(ms / 10).toString().padStart(2, '0');
        const MilliE = Math.floor(Math.random() * 99).toString().padStart(2, '0');
        const MicroE = Math.floor(Math.random() * 99).toString().padStart(2, '0');
        
        return `(+00):${GE}.${EE}.${PE}.${TE}.${Day}.${H}.${M}.${S}.${BaseE}.${MilliE}.${MicroE}`;
    },

    /**
     * Core Ingestion Module: Dispatches new transaction block logs, 
     * applies 1% System TDS deductions, and handles game royalty triggers.
     */
    executeTransaction(sourceNodeId, targetNodeId, grossKineInput, manifestDescription) {
        const gross = parseFloat(grossKineInput) || 0;
        
        // 1. Calculate standard 1% Statutory TDS deduction
        const tds = Math.round((gross * 0.01) * 10000) / 10000;
        
        // 2. Evaluate game-related royalty triggers
        let royalty = 0.00;
        if (sourceNodeId === "LOCAL-GAME-SANDBOX" || manifestDescription.includes("Pulse Harvest")) {
            royalty = Math.round((gross * 0.01) * 10000) / 10000;
        }

        // 3. Compute clean remaining net value
        const net = Math.round((gross - tds - royalty) * 10000) / 10000;
        
        const uniqueTxHash = `AUD-${Math.floor(100000 + Math.random() * 900000)}`;
        const timeString = this.generateSystemTimestamp();

        // 4. Construct complete, structured transaction block
        const logEntry = {
            id: uniqueTxHash,
            timestamp: timeString,
            source: sourceNodeId.toUpperCase(),
            target: targetNodeId.toUpperCase(),
            gross: gross,
            tds: tds,
            royalty: royalty,
            net: net,
            desc: manifestDescription
        };

        // 5. Append transaction block to active local history array registers
        const activeLogs = this.getAuditLogs();
        activeLogs.unshift(logEntry);
        localStorage.setItem(this.STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(activeLogs));

        // 6. Credit net value balance parameter straight to localized user wallet
        const currentWallet = this.getWalletState();
        currentWallet.balance = Math.round((currentWallet.balance + net) * 10000) / 10000;
        currentWallet.lastUpdated = new Date().toISOString();
        localStorage.setItem(this.STORAGE_KEYS.WALLET, JSON.stringify(currentWallet));

        // 7. BROADCAST TRIGGER LINK FOR LAYER 06 BACKEND RELAY SYNCS
        window.dispatchEvent(new Event('KUTS_TRANSACTION_EXECUTED'));

        return logEntry;
    }
};