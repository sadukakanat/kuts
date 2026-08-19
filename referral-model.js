/**
 * ============================================================
 * KUTS Ecosystem
 * Module : Referral Model
 * File   : referral-model.js
 * Purpose: Standard referral data model
 * Version: 0.1.0
 * ============================================================
 */

class ReferralModel {

    constructor(options = {}) {

        const now = new Date().toISOString();

        this.id = options.id || ReferralModel.generateReferralId();

        // Person who shared the referral
        this.referrerId = options.referrerId || "";

        // Person who joined using the referral
        this.referredUserId = options.referredUserId || "";

        // Referral code used during signup
        this.referralCode = options.referralCode || "";

        // Relationship status
        this.status = options.status || ReferralModel.STATUS.PENDING;

        // Reward information
        this.rewardStatus =
            options.rewardStatus ||
            ReferralModel.REWARD_STATUS.PENDING;

        this.rewardAmount = options.rewardAmount || 0;

        this.rewardPaid = options.rewardPaid || 0;

        // Subscription that qualified for reward
        this.subscriptionId =
            options.subscriptionId || "";

        // Wallet transaction reference
        this.walletTransactionId =
            options.walletTransactionId || "";

        // Optional notes
        this.notes = options.notes || "";

        this.createdAt =
            options.createdAt || now;

        this.updatedAt =
            options.updatedAt || now;

    }

    /**
     * Referral Status
     */
    static STATUS = {

        PENDING: "PENDING",

        ACTIVE: "ACTIVE",

        COMPLETED: "COMPLETED",

        REJECTED: "REJECTED",

        CANCELLED: "CANCELLED"

    };

    /**
     * Reward Status
     */
    static REWARD_STATUS = {

        PENDING: "PENDING",

        APPROVED: "APPROVED",

        PAID: "PAID",

        CANCELLED: "CANCELLED"

    };

    /**
     * Generate Referral ID
     */
    static generateReferralId() {

        return (
            "REF-" +
            Date.now() +
            "-" +
            Math.floor(Math.random() * 10000)
        );

    }

}