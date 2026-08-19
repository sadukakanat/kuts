/**
 * ============================================================
 * KUTS Ecosystem
 * Module : Wallet Validator
 * File   : wallet-validator.js
 * Purpose: Validate wallet operations
 * Version: 0.0.1
 * ============================================================
 */

class WalletValidator {

    /**
     * Configuration
     */
    static MIN_AMOUNT = 1;

    static MAX_TRANSACTION_AMOUNT = 1000000;

    static SUPPORTED_CURRENCIES = [
        "INR"
    ];

    /**
     * Validate wallet object
     */
    static validateWallet(wallet) {

        const errors = [];

        if (!wallet) {
            errors.push("Wallet not found.");
        }

        if (!wallet.userId) {
            errors.push("User ID is required.");
        }

        if (!this.isSupportedCurrency(wallet.currency)) {
            errors.push("Unsupported currency.");
        }

        return {
            valid: errors.length === 0,
            errors
        };

    }

    /**
     * Validate credit
     */
    static validateCredit(wallet, amount) {

        const errors = [];

        if (!wallet) {
            errors.push("Wallet not found.");
        }

        if (!this.isValidAmount(amount)) {
            errors.push("Invalid credit amount.");
        }

        return {
            valid: errors.length === 0,
            errors
        };

    }

    /**
     * Validate debit
     */
    static validateDebit(wallet, amount) {

        const errors = [];

        if (!wallet) {
            errors.push("Wallet not found.");
        }

        if (!this.isValidAmount(amount)) {
            errors.push("Invalid debit amount.");
        }

        if (wallet && wallet.balance < amount) {
            errors.push("Insufficient wallet balance.");
        }

        return {
            valid: errors.length === 0,
            errors
        };

    }

    /**
     * Validate withdrawal
     */
    static validateWithdrawal(wallet, amount) {

        const result = this.validateDebit(wallet, amount);

        if (result.valid && wallet.status !== "ACTIVE") {
            result.valid = false;
            result.errors.push(
                "Wallet is not active."
            );
        }

        return result;

    }

    /**
     * Validate refund
     */
    static validateRefund(wallet, amount) {

        return this.validateCredit(wallet, amount);

    }

    /**
     * Validate transfer
     */
    static validateTransfer(fromWallet, toWallet, amount) {

        const errors = [];

        if (!fromWallet) {
            errors.push("Source wallet not found.");
        }

        if (!toWallet) {
            errors.push("Destination wallet not found.");
        }

        if (!this.isValidAmount(amount)) {
            errors.push("Invalid transfer amount.");
        }

        if (
            fromWallet &&
            fromWallet.balance < amount
        ) {
            errors.push("Insufficient balance.");
        }

        return {
            valid: errors.length === 0,
            errors
        };

    }

    /**
     * Amount validation
     */
    static isValidAmount(amount) {

        return Number.isFinite(amount) &&
               amount >= this.MIN_AMOUNT &&
               amount <= this.MAX_TRANSACTION_AMOUNT;

    }

    /**
     * Currency validation
     */
    static isSupportedCurrency(currency) {

        return this.SUPPORTED_CURRENCIES.includes(
            currency
        );

    }

}