/**
 * ============================================================
 * KUTS Ecosystem
 * Module : Referral Service
 * File   : referral-service.js
 * Purpose: Manage referral relationships
 * Version: 0.1.0
 * ============================================================
 */

class ReferralService {

    /**
     * Create a referral relationship
     */
    static create(referrerId, referredUserId, referralCode) {

        const referral = new ReferralModel({

            referrerId,
            referredUserId,
            referralCode

        });

        const validation =
            ReferralValidator.validate(referral);

        if (!validation.valid) {
            throw new Error(
                validation.errors.join(", ")
            );
        }

        const existingReferral =
            ReferralStorage.findByReferredUser(
                referredUserId
            );

        const duplicateValidation =
            ReferralValidator.validateUniqueReferral(
                existingReferral
            );

        if (!duplicateValidation.valid) {
            throw new Error(
                duplicateValidation.errors.join(", ")
            );
        }

        ReferralStorage.add(referral);

        return referral;

    }

    /**
     * Get referral by ID
     */
    static getById(referralId) {

        return ReferralStorage.findById(
            referralId
        );

    }

    /**
     * Get referral by referred user
     */
    static getByUser(userId) {

        return ReferralStorage.findByReferredUser(
            userId
        );

    }

    /**
     * Get all referrals made by a referrer
     */
    static getByReferrer(referrerId) {

        return ReferralStorage.findByReferrer(
            referrerId
        );

    }

    /**
     * Activate referral
     */
    static activate(referralId) {

        const referral =
            ReferralStorage.findById(
                referralId
            );

        if (!referral) {
            throw new Error(
                "Referral not found."
            );
        }

        referral.status =
            ReferralModel.STATUS.ACTIVE;

        referral.updatedAt =
            new Date().toISOString();

        ReferralStorage.update(referral);

        return referral;

    }

    /**
     * Complete referral
     */
    static complete(referralId) {

        const referral =
            ReferralStorage.findById(
                referralId
            );

        if (!referral) {
            throw new Error(
                "Referral not found."
            );
        }

        referral.status =
            ReferralModel.STATUS.COMPLETED;

        referral.updatedAt =
            new Date().toISOString();

        ReferralStorage.update(referral);

        return referral;

    }

    /**
     * Reject referral
     */
    static reject(referralId, reason = "") {

        const referral =
            ReferralStorage.findById(
                referralId
            );

        if (!referral) {
            throw new Error(
                "Referral not found."
            );
        }

        referral.status =
            ReferralModel.STATUS.REJECTED;

        referral.notes = reason;

        referral.updatedAt =
            new Date().toISOString();

        ReferralStorage.update(referral);

        return referral;

    }

    /**
     * Cancel referral
     */
    static cancel(referralId, reason = "") {

        const referral =
            ReferralStorage.findById(
                referralId
            );

        if (!referral) {
            throw new Error(
                "Referral not found."
            );
        }

        referral.status =
            ReferralModel.STATUS.CANCELLED;

        referral.notes = reason;

        referral.updatedAt =
            new Date().toISOString();

        ReferralStorage.update(referral);

        return referral;

    }

    /**
     * Approve reward
     */
    static approveReward(referralId, amount) {

        const referral =
            ReferralStorage.findById(
                referralId
            );

        if (!referral) {
            throw new Error(
                "Referral not found."
            );
        }

        referral.rewardStatus =
            ReferralModel.REWARD_STATUS.APPROVED;

        referral.rewardAmount = amount;

        referral.updatedAt =
            new Date().toISOString();

        ReferralStorage.update(referral);

        return referral;

    }

    /**
     * Mark reward paid
     */
    static markRewardPaid(
        referralId,
        walletTransactionId
    ) {

        const referral =
            ReferralStorage.findById(
                referralId
            );

        if (!referral) {
            throw new Error(
                "Referral not found."
            );
        }

        referral.rewardStatus =
            ReferralModel.REWARD_STATUS.PAID;

        referral.walletTransactionId =
            walletTransactionId;

        referral.rewardPaid =
            referral.rewardAmount;

        referral.updatedAt =
            new Date().toISOString();

        ReferralStorage.update(referral);

        return referral;

    }

    /**
     * Update referral
     */
    static update(referral) {

        referral.updatedAt =
            new Date().toISOString();

        ReferralStorage.update(referral);

        return referral;

    }

    /**
     * Delete referral
     */
    static delete(referralId) {

        ReferralStorage.delete(
            referralId
        );

    }

}