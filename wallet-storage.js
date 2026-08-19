/**
 * ============================================================
 * KUTS Ecosystem
 * Module : Wallet Storage
 * File   : wallet-storage.js
 * Purpose: Store and retrieve wallet records
 * Version: 0.0.1
 * ============================================================
 */

const WALLET_STORAGE_KEY = "kuts_wallets";

class WalletStorage {

    /**
     * Get all wallets
     */
    static getAll() {

        const data = localStorage.getItem(
            WALLET_STORAGE_KEY
        );

        return data ? JSON.parse(data) : [];
    }

    /**
     * Save all wallets
     */
    static saveAll(wallets) {

        localStorage.setItem(
            WALLET_STORAGE_KEY,
            JSON.stringify(wallets)
        );

    }

    /**
     * Add new wallet
     */
    static add(wallet) {

        const wallets = this.getAll();

        wallets.push(wallet);

        this.saveAll(wallets);

        return wallet;

    }

    /**
     * Update wallet
     */
    static update(wallet) {

        const wallets = this.getAll();

        const index = wallets.findIndex(
            w => w.id === wallet.id
        );

        if (index === -1) {
            return false;
        }

        wallet.updatedAt =
            new Date().toISOString();

        wallets[index] = wallet;

        this.saveAll(wallets);

        return true;

    }

    /**
     * Delete wallet
     */
    static delete(walletId) {

        const wallets = this.getAll();

        const filtered = wallets.filter(
            w => w.id !== walletId
        );

        this.saveAll(filtered);

    }

    /**
     * Find by wallet ID
     */
    static findById(walletId) {

        return this.getAll().find(
            w => w.id === walletId
        ) || null;

    }

    /**
     * Find by user ID
     */
    static findByUserId(userId) {

        return this.getAll().find(
            w => w.userId === userId
        ) || null;

    }

    /**
     * Check if wallet exists
     */
    static exists(userId) {

        return this.findByUserId(userId) !== null;

    }

    /**
     * Count wallets
     */
    static count() {

        return this.getAll().length;

    }

    /**
     * Get wallets by status
     */
    static findByStatus(status) {

        return this.getAll().filter(
            w => w.status === status
        );

    }

    /**
     * Clear all wallets
     * (Useful for development/testing)
     */
    static clear() {

        localStorage.removeItem(
            WALLET_STORAGE_KEY
        );

    }

}