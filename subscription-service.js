/**
 * ============================================================
 * KUTS Ecosystem
 * Module : Subscription Service
 * File   : subscription-service.js
 * Purpose: Manage member subscriptions
 * Version: 0.0.1
 * ============================================================
 */

const SUBSCRIPTION_KEY = "kuts_subscriptions";

class SubscriptionService {

    /**
     * Create a new subscription record
     */
    static create(userId, plan = "FREE") {

        const subscription = {

            id: this.generateId(),

            userId,

            plan,

            status: "PENDING",

            startDate: null,

            expiryDate: null,

            createdAt: new Date().toISOString(),

            updatedAt: new Date().toISOString()

        };

        const subscriptions = this.getAll();

        subscriptions.push(subscription);

        localStorage.setItem(
            SUBSCRIPTION_KEY,
            JSON.stringify(subscriptions)
        );

        return subscription;
    }

    /**
     * Activate subscription
     */
    static activate(userId, months = 1) {

        const subscriptions = this.getAll();

        const subscription =
            subscriptions.find(s => s.userId === userId);

        if (!subscription) {
            throw new Error("Subscription not found.");
        }

        const today = new Date();

        const expiry = new Date(today);

        expiry.setMonth(expiry.getMonth() + months);

        subscription.status = "ACTIVE";

        subscription.startDate = today.toISOString();

        subscription.expiryDate = expiry.toISOString();

        subscription.updatedAt = today.toISOString();

        this.saveAll(subscriptions);

        return subscription;
    }

    /**
     * Renew subscription
     */
    static renew(userId, months = 1) {

        const subscription = this.getByUser(userId);

        if (!subscription) {
            throw new Error("Subscription not found.");
        }

        let expiry =
            subscription.expiryDate
                ? new Date(subscription.expiryDate)
                : new Date();

        expiry.setMonth(expiry.getMonth() + months);

        subscription.expiryDate = expiry.toISOString();

        subscription.updatedAt =
            new Date().toISOString();

        const subscriptions = this.getAll();

        const index =
            subscriptions.findIndex(
                s => s.userId === userId
            );

        subscriptions[index] = subscription;

        this.saveAll(subscriptions);

        return subscription;
    }

    /**
     * Cancel subscription
     */
    static cancel(userId) {

        const subscription = this.getByUser(userId);

        if (!subscription) {
            throw new Error("Subscription not found.");
        }

        subscription.status = "CANCELLED";

        subscription.updatedAt =
            new Date().toISOString();

        const subscriptions = this.getAll();

        const index =
            subscriptions.findIndex(
                s => s.userId === userId
            );

        subscriptions[index] = subscription;

        this.saveAll(subscriptions);

        return subscription;
    }

    /**
     * Get subscription by user
     */
    static getByUser(userId) {

        return this.getAll().find(
            s => s.userId === userId
        );
    }

    /**
     * Check if subscription is active
     */
    static isActive(userId) {

        const subscription =
            this.getByUser(userId);

        if (!subscription) {
            return false;
        }

        if (subscription.status !== "ACTIVE") {
            return false;
        }

        if (!subscription.expiryDate) {
            return false;
        }

        return new Date(subscription.expiryDate) > new Date();
    }

    /**
     * Get all subscriptions
     */
    static getAll() {

        return JSON.parse(
            localStorage.getItem(SUBSCRIPTION_KEY)
        ) || [];
    }

    /**
     * Save all subscriptions
     */
    static saveAll(subscriptions) {

        localStorage.setItem(
            SUBSCRIPTION_KEY,
            JSON.stringify(subscriptions)
        );
    }

    /**
     * Generate Subscription ID
     */
    static generateId() {

        return "SUB-" + Date.now();
    }

}