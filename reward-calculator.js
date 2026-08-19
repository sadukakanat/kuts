/**
 * ============================================================
 * KUTS Ecosystem
 * Module : Reward Calculator
 * File   : reward-calculator.js
 * Purpose: Calculate referral rewards and deductions
 * Version: 0.1.0
 * ============================================================
 */

class RewardCalculator {

    /**
     * Default Configuration
     */
    static CONFIG = {

        referralPercentage: 10,

        tdsPercentage: 5,

        servicePercentage: 0

    };

    /**
     * Calculate referral reward
     */
    static calculate(subscriptionAmount, config = {}) {

        const settings = {

            ...this.CONFIG,

            ...config

        };

        const grossReward =
            subscriptionAmount *
            settings.referralPercentage / 100;

        const tds =
            grossReward *
            settings.tdsPercentage / 100;

        const serviceCharge =
            grossReward *
            settings.servicePercentage / 100;

        const netReward =
            grossReward -
            tds -
            serviceCharge;

        return {

            subscriptionAmount,

            referralPercentage:
                settings.referralPercentage,

            grossReward,

            tds,

            serviceCharge,

            netReward,

            currency: "INR"

        };

    }

    /**
     * Round monetary values
     */
    static round(value) {

        return Number(value.toFixed(2));

    }

}