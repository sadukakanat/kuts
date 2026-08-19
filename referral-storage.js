/**
 * ============================================================
 * KUTS Ecosystem
 * Module : Referral Storage
 * File   : referral-storage.js
 * Purpose: Store and retrieve referral records
 * Version: 0.1.0
 * ============================================================
 */

const REFERRAL_STORAGE_KEY = "kuts_referrals";

class ReferralStorage {

    /**
     * Get all referrals
     */
    static getAll() {

        const data = localStorage.getItem(
            REFERRAL_STORAGE_KEY
        );

        return data ? JSON.parse(data) : [];

    }

    /**
     * Save all referrals
     */
    static saveAll(referrals) {

        localStorage.setItem(
            REFERRAL_STORAGE_KEY,
            JSON.stringify(referrals)
        );

    }

    /**
     * Add referral
     */
    static add(referral) {

        const referrals = this.getAll();

        referrals.push(referral);

        this.saveAll(referrals);

        return referral;

    }

    /**
     * Update referral
     */
    static update(referral) {

        const referrals = this.getAll();

        const index = referrals.findIndex(
            r => r.id === referral.id
        );

        if (index === -1) {
            return false;
        }

        referrals[index] = referral;

        this.saveAll(referrals);

        return true;

    }

    /**
     * Delete referral
     */
    static delete(referralId) {

        const referrals = this.getAll();

        const filtered = referrals.filter(
            r => r.id !== referralId
        );

        this.saveAll(filtered);

    }

    /**
     * Find by referral ID
     */
    static findById(referralId) {

        return this.getAll().find(
            r => r.id === referralId
        ) || null;

    }

    /**
     * Find referral by referred user
     */
    static findByReferredUser(userId) {

        return this.getAll().find(
            r => r.referredUserId === userId
        ) || null;

    }

    /**
     * Find all referrals made by a referrer
     */
    static findByReferrer(referrerId) {

        return this.getAll().filter(
            r => r.referrerId === referrerId
        );

    }

    /**
     * Find referrals by status
     */
    static findByStatus(status) {

        return this.getAll().filter(
            r => r.status === status
        );

    }

    /**
     * Find referrals by reward status
     */
    static findByRewardStatus(rewardStatus) {

        return this.getAll().filter(
            r => r.rewardStatus === rewardStatus
        );

    }

    /**
     * Check whether a user was referred
     */
    static existsForUser(userId) {

        return this.findByReferredUser(userId) !== null;

    }

    /**
     * Count all referrals
     */
    static count() {

        return this.getAll().length;

    }

    /**
     * Count referrals for a referrer
     */
    static countByReferrer(referrerId) {

        return this.findByReferrer(
            referrerId
        ).length;

    }

    /**
     * Remove all referrals
     * Useful for development/testing
     */
    static clear() {

        localStorage.removeItem(
            REFERRAL_STORAGE_KEY
        );

    }

}