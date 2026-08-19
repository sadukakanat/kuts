/**
 * ============================================================
 * KUTS Ecosystem
 * Module : Subscription Validator
 * File   : subscription-validator.js
 * Purpose: Validate subscription requests
 * Version: 0.0.1
 * ============================================================
 */

class SubscriptionValidator {

    /**
     * Supported subscription plans
     */
    static PLANS = [
        "FREE",
        "BASIC",
        "STANDARD",
        "PREMIUM",
        "ENTERPRISE"
    ];

    /**
     * Supported subscription statuses
     */
    static STATUSES = [
        "PENDING",
        "ACTIVE",
        "EXPIRED",
        "SUSPENDED",
        "CANCELLED"
    ];

    /**
     * Validate new subscription
     */
    static validate(subscription) {

        const errors = [];

        if (!subscription.userId) {
            errors.push("User ID is required.");
        }

        if (!this.isValidPlan(subscription.plan)) {
            errors.push("Invalid subscription plan.");
        }

        if (!this.isValidStatus(subscription.status)) {
            errors.push("Invalid subscription status.");
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate plan
     */
    static isValidPlan(plan) {

        return this.PLANS.includes(plan);

    }

    /**
     * Validate status
     */
    static isValidStatus(status) {

        return this.STATUSES.includes(status);

    }

    /**
     * Validate subscription duration
     */
    static isValidDuration(months) {

        return Number.isInteger(months) &&
               months > 0 &&
               months <= 60;

    }

    /**
     * Validate activation
     */
    static validateActivation(userId, months) {

        const errors = [];

        if (!userId) {
            errors.push("User ID is required.");
        }

        if (!this.isValidDuration(months)) {
            errors.push("Invalid subscription duration.");
        }

        return {

            valid: errors.length === 0,

            errors

        };

    }

    /**
     * Validate renewal
     */
    static validateRenewal(subscription) {

        const errors = [];

        if (!subscription) {

            errors.push("Subscription not found.");

        }

        else if (
            subscription.status === "CANCELLED"
        ) {

            errors.push(
                "Cancelled subscriptions cannot be renewed."
            );

        }

        return {

            valid: errors.length === 0,

            errors

        };

    }

    /**
     * Validate cancellation
     */
    static validateCancellation(subscription) {

        const errors = [];

        if (!subscription) {

            errors.push("Subscription not found.");

        }

        else if (
            subscription.status === "CANCELLED"
        ) {

            errors.push(
                "Subscription is already cancelled."
            );

        }

        return {

            valid: errors.length === 0,

            errors

        };

    }

}