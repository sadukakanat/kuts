/**
 * ============================================================
 * KUTS Ecosystem
 * Module : Referral Validator
 * File   : referral-validator.js
 * Purpose: Validate referral operations
 * Version: 0.1.0
 * ============================================================
 */

class ReferralValidator {

    /**
     * Validate a new referral
     */
    static validate(referral) {

        const errors = [];

        if (!referral) {
            errors.push("Referral is required.");
        }

        if (!referral.referrerId) {
            errors.push("Referrer ID is required.");
        }

        if (!referral.referredUserId) {
            errors.push("Referred User ID is required.");
        }

        if (!referral.referralCode) {
            errors.push("Referral code is required.");
        }

        if (
            referral.referrerId &&
            referral.referredUserId &&
            referral.referrerId === referral.referredUserId
        ) {
            errors.push("Self-referral is not allowed.");
        }

        return {

            valid: errors.length === 0,

            errors

        };

    }

    /**
     * Validate referral code
     */
    static validateReferralCode(code) {

        if (!code) {

            return {

                valid: false,

                errors: ["Referral code is required."]

            };

        }

        const regex = /^[A-Z0-9-]{4,30}$/;

        return {

            valid: regex.test(code),

            errors: regex.test(code)
                ? []
                : ["Invalid referral code."]

        };

    }

    /**
     * Check whether a user has already been referred
     */
    static validateUniqueReferral(userId) {

        const exists =
            ReferralStorage.existsForUser(userId);

        return {

            valid: !exists,

            errors: exists
                ? ["User already has a referral."]
                : []

        };

    }

    /**
     * Prevent self referral
     */
    static validateSelfReferral(
        referrerId,
        referredUserId
    ) {

        const valid =
            referrerId !== referredUserId;

        return {

            valid,

            errors: valid
                ? []
                : ["Self-referral is not permitted."]

        };

    }

    /**
     * Validate reward eligibility
     */
    static validateRewardEligibility(
        referral,
        subscription
    ) {

        const errors = [];

        if (!referral) {

            errors.push(
                "Referral record not found."
            );

        }

        if (!subscription) {

            errors.push(
                "Subscription record not found."
            );

        }

        if (
            referral &&
            referral.rewardStatus ===
            ReferralModel.REWARD_STATUS.PAID
        ) {

            errors.push(
                "Reward has already been paid."
            );

        }

        if (
            subscription &&
            subscription.status !== "ACTIVE"
        ) {

            errors.push(
                "Subscription is not active."
            );

        }

        return {

            valid: errors.length === 0,

            errors

        };

    }

    /**
     * Validate status transition
     */
    static validateStatus(status) {

        return Object.values(
            ReferralModel.STATUS
        ).includes(status);

    }

    /**
     * Validate reward status
     */
    static validateRewardStatus(status) {

        return Object.values(
            ReferralModel.REWARD_STATUS
        ).includes(status);

    }

}