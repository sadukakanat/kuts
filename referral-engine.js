/**
 * ============================================================
 * KUTS Ecosystem
 * Module : Referral Engine
 * File   : referral-engine.js
 * Purpose: Orchestrate referral reward processing
 * Version: 0.1.0
 * ============================================================
 */

class ReferralEngine {

    /**
     * Process referral reward
     *
     * @param {String} referredUserId
     * @param {Object} subscription
     */
    static processReward(referredUserId, subscription) {

        // Find referral relationship
        const referral =
            ReferralService.getByUser(
                referredUserId
            );

        if (!referral) {
            return null;
        }

        // Validate eligibility
        const validation =
            ReferralValidator.validateRewardEligibility(
                referral,
                subscription
            );

        if (!validation.valid) {
            throw new Error(
                validation.errors.join(", ")
            );
        }

        // Calculate reward
        const reward =
            RewardCalculator.calculate(
                subscription.amount
            );

        // Approve reward
        ReferralService.approveReward(
            referral.id,
            reward.netReward
        );

        // Credit wallet
        const wallet =
            WalletService.credit(

                referral.referrerId,

                reward.netReward,

                "Referral Reward"

            );

        // Mark reward as paid
        ReferralService.markRewardPaid(

            referral.id,

            null // Wallet transaction ID (future ledger)

        );

        return {

            referral,

            reward,

            wallet

        };

    }

    /**
     * Process referral activation after
     * successful subscription
     */
    static processSubscription(subscription) {

        if (!subscription) {
            return null;
        }

        if (subscription.status !== "ACTIVE") {
            return null;
        }

        return this.processReward(

            subscription.userId,

            subscription

        );

    }

    /**
     * Activate referral
     */
    static activateReferral(referredUserId) {

        const referral =
            ReferralService.getByUser(
                referredUserId
            );

        if (!referral) {
            return null;
        }

        return ReferralService.activate(
            referral.id
        );

    }

    /**
     * Cancel referral
     */
    static cancelReferral(
        referredUserId,
        reason = ""
    ) {

        const referral =
            ReferralService.getByUser(
                referredUserId
            );

        if (!referral) {
            return null;
        }

        return ReferralService.cancel(

            referral.id,

            reason

        );

    }

    /**
     * Reject referral
     */
    static rejectReferral(
        referredUserId,
        reason = ""
    ) {

        const referral =
            ReferralService.getByUser(
                referredUserId
            );

        if (!referral) {
            return null;
        }

        return ReferralService.reject(

            referral.id,

            reason

        );

    }

}