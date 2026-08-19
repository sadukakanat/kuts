/**
 * ============================================================
 * KUTS Ecosystem
 * Module : Wallet Model
 * File   : wallet-model.js
 * Purpose: Standard wallet data model
 * Version: 0.0.1
 * ============================================================
 */

class WalletModel {

    constructor(userId, options = {}) {

        const now = new Date().toISOString();

        this.id = options.id || WalletModel.generateWalletId();

        this.userId = userId;

        this.currency = options.currency || "INR";

        this.balance = options.balance || 0;

        this.pendingBalance = options.pendingBalance || 0;

        this.totalEarned = options.totalEarned || 0;

        this.totalSpent = options.totalSpent || 0;

        this.totalWithdrawn = options.totalWithdrawn || 0;

        this.totalRefunded = options.totalRefunded || 0;

        this.status = options.status || "ACTIVE";

        this.createdAt = options.createdAt || now;

        this.updatedAt = options.updatedAt || now;

    }

    /**
     * Wallet Status
     */
    static STATUS = {

        ACTIVE: "ACTIVE",

        SUSPENDED: "SUSPENDED",

        CLOSED: "CLOSED"

    };

    /**
     * Supported Currency
     */
    static DEFAULT_CURRENCY = "INR";

    /**
     * Generate Wallet ID
     */
    static generateWalletId() {

        return "WAL-" + Date.now() + "-" +
               Math.floor(Math.random() * 10000);

    }

}