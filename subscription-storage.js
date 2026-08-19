/**
 * ============================================================
 * KUTS Ecosystem
 * Module : Subscription Storage
 * File   : subscription-storage.js
 * Purpose: Store and retrieve subscription records
 * Version: 0.0.1
 * ============================================================
 */

const SUBSCRIPTION_STORAGE_KEY = "kuts_subscriptions";

class SubscriptionStorage {

    /**
     * Get all subscriptions
     */
    static getAll() {

        const data = localStorage.getItem(
            SUBSCRIPTION_STORAGE_KEY
        );

        return data ? JSON.parse(data) : [];
    }

    /**
     * Save all subscriptions
     */
    static saveAll(subscriptions) {

        localStorage.setItem(
            SUBSCRIPTION_STORAGE_KEY,
            JSON.stringify(subscriptions)
        );

    }

    /**
     * Add new subscription
     */
    static add(subscription) {

        const subscriptions = this.getAll();

        subscriptions.push(subscription);

        this.saveAll(subscriptions);

        return subscription;

    }

    /**
     * Update subscription
     */
    static update(subscription) {

        const subscriptions = this.getAll();

        const index = subscriptions.findIndex(
            s => s.id === subscription.id
        );

        if (index === -1) {
            return false;
        }

        subscriptions[index] = subscription;

        this.saveAll(subscriptions);

        return true;

    }

    /**
     * Delete subscription
     */
    static delete(subscriptionId) {

        const subscriptions = this.getAll();

        const filtered = subscriptions.filter(
            s => s.id !== subscriptionId
        );

        this.saveAll(filtered);

    }

    /**
     * Find by subscription ID
     */
    static findById(subscriptionId) {

        return this.getAll().find(
            s => s.id === subscriptionId
        ) || null;

    }

    /**
     * Find by user ID
     */
    static findByUserId(userId) {

        return this.getAll().find(
            s => s.userId === userId
        ) || null;

    }

    /**
     * Check whether a user already has a subscription
     */
    static exists(userId) {

        return this.findByUserId(userId) !== null;

    }

    /**
     * Count subscriptions
     */
    static count() {

        return this.getAll().length;

    }

    /**
     * Remove everything
     * (Useful during development/testing)
     */
    static clear() {

        localStorage.removeItem(
            SUBSCRIPTION_STORAGE_KEY
        );

    }

}