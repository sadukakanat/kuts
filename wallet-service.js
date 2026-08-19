/**
 * ============================================================
 * KUTS Ecosystem
 * Module : Wallet Service
 * File   : wallet-service.js
 * Purpose: Manage member wallets
 * Version : 0.1.0
 * ============================================================
 */

class WalletService {

    /**
     * Create wallet for a new user
     */
    static create(userId) {

        if (!userId) {
            throw new Error("User ID is required.");
        }

        if (WalletStorage.exists(userId)) {
            throw new Error("Wallet already exists.");
        }

        const wallet = new WalletModel(userId);

        const validation =
            WalletValidator.validateWallet(wallet);

        if (!validation.valid) {
            throw new Error(validation.errors.join(", "));
        }

        WalletStorage.add(wallet);

        return wallet;

    }

    /**
     * Credit wallet
     */
    static credit(userId, amount, reason = "") {

        const wallet =
            WalletStorage.findByUserId(userId);

        const validation =
            WalletValidator.validateCredit(
                wallet,
                amount
            );

        if (!validation.valid) {
            throw new Error(validation.errors.join(", "));
        }

        wallet.balance += amount;

        wallet.totalEarned += amount;

        wallet.updatedAt =
            new Date().toISOString();

        WalletStorage.update(wallet);

        // Future:
        // WalletLedger.record(wallet, "CREDIT", amount, reason);

        return wallet;

    }

    /**
     * Debit wallet
     */
    static debit(userId, amount, reason = "") {

        const wallet =
            WalletStorage.findByUserId(userId);

        const validation =
            WalletValidator.validateDebit(
                wallet,
                amount
            );

        if (!validation.valid) {
            throw new Error(validation.errors.join(", "));
        }

        wallet.balance -= amount;

        wallet.totalSpent += amount;

        wallet.updatedAt =
            new Date().toISOString();

        WalletStorage.update(wallet);

        // Future:
        // WalletLedger.record(wallet, "DEBIT", amount, reason);

        return wallet;

    }

    /**
     * Withdraw money
     */
    static withdraw(userId, amount) {

        const wallet =
            WalletStorage.findByUserId(userId);

        const validation =
            WalletValidator.validateWithdrawal(
                wallet,
                amount
            );

        if (!validation.valid) {
            throw new Error(validation.errors.join(", "));
        }

        wallet.balance -= amount;

        wallet.totalSpent += amount;

        wallet.totalWithdrawn += amount;

        wallet.updatedAt =
            new Date().toISOString();

        WalletStorage.update(wallet);

        // Future:
        // WalletLedger.record(wallet, "WITHDRAWAL", amount);

        return wallet;

    }

    /**
     * Refund
     */
    static refund(userId, amount, reason = "") {

        const wallet =
            WalletStorage.findByUserId(userId);

        const validation =
            WalletValidator.validateRefund(
                wallet,
                amount
            );

        if (!validation.valid) {
            throw new Error(validation.errors.join(", "));
        }

        wallet.balance += amount;

        wallet.totalRefunded += amount;

        wallet.updatedAt =
            new Date().toISOString();

        WalletStorage.update(wallet);

        // Future:
        // WalletLedger.record(wallet, "REFUND", amount, reason);

        return wallet;

    }

    /**
     * Get wallet
     */
    static getWallet(userId) {

        return WalletStorage.findByUserId(userId);

    }

    /**
     * Wallet exists?
     */
    static exists(userId) {

        return WalletStorage.exists(userId);

    }

    /**
     * Current balance
     */
    static getBalance(userId) {

        const wallet =
            WalletStorage.findByUserId(userId);

        return wallet ? wallet.balance : 0;

    }

    /**
     * Pending balance
     */
    static getPendingBalance(userId) {

        const wallet =
            WalletStorage.findByUserId(userId);

        return wallet ? wallet.pendingBalance : 0;

    }

    /**
     * Suspend wallet
     */
    static suspend(userId) {

        const wallet =
            WalletStorage.findByUserId(userId);

        if (!wallet) {
            throw new Error("Wallet not found.");
        }

        wallet.status =
            WalletModel.STATUS.SUSPENDED;

        wallet.updatedAt =
            new Date().toISOString();

        WalletStorage.update(wallet);

        return wallet;

    }

    /**
     * Activate wallet
     */
    static activate(userId) {

        const wallet =
            WalletStorage.findByUserId(userId);

        if (!wallet) {
            throw new Error("Wallet not found.");
        }

        wallet.status =
            WalletModel.STATUS.ACTIVE;

        wallet.updatedAt =
            new Date().toISOString();

        WalletStorage.update(wallet);

        return wallet;

    }

    /**
     * Close wallet
     */
    static close(userId) {

        const wallet =
            WalletStorage.findByUserId(userId);

        if (!wallet) {
            throw new Error("Wallet not found.");
        }

        wallet.status =
            WalletModel.STATUS.CLOSED;

        wallet.updatedAt =
            new Date().toISOString();

        WalletStorage.update(wallet);

        return wallet;

    }

}