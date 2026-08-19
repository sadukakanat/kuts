"use strict";

/**
 * ==========================================================
 * KUTS ECOSYSTEM
 * Dashboard Controller
 * ----------------------------------------------------------
 * Version : 1.0.0
 * Purpose : Core System Dashboard Controller
 * ==========================================================
 */

class Dashboard {
    /**
     * Dashboard State
     */
    static initialized = false;
    static elements = {};
    static refreshInterval = null;

    static state = {
        initialized: false,
        refreshInterval: null
    };

    /**
     * Initialize Dashboard
     */
    static initialize() {
        if (this.initialized || this.state.initialized) {
            console.log("[Dashboard] Already initialized.");
            return;
        }

        console.log("[Dashboard] Initializing...");

        this.cacheElements();
        
        if (!this.verifyGateway()) {
            console.error("[Dashboard] Gateway verification failed.");
        }

        this.initialized = true;
        this.state.initialized = true;

        this.render();
        this.startLiveUpdates();
        this.registerEvents();

        console.log("[Dashboard] Ready.");
    }

    /**
     * Logger helper
     */
    static log(message) {
        console.log(`[Dashboard] ${message}`);
    }

    /**
     * Cache DOM Elements
     */
    static cacheElements() {
        this.elements = {
            signup: document.getElementById("signup-status"),
            subscription: document.getElementById("subscription-status"),
            referral: document.getElementById("referral-status"),
            wallet: document.getElementById("wallet-status"),
            config: document.getElementById("config-status"),
            users: document.getElementById("users-count")
        };
    }

    /**
     * Verify Gateway
     */
    static verifyGateway() {
        if (typeof Gateway === "undefined") {
            console.error("[Dashboard] Gateway not found.");
            return false;
        }
        return true;
    }

    /**
     * Get Cached Element
     */
    static getElement(name) {
        return this.elements[name] || document.getElementById(name) || null;
    }

    /**
     * Update Text Helper
     */
    static updateText(id, value) {
        const element = document.getElementById(id) || this.getElement(id);
        if (element) {
            element.textContent = value;
        }
    }

    /**
     * Status Color Setter
     */
    static setStatusColor(name, online = true) {
        const element = this.getElement(name);
        if (!element) return;

        element.classList.remove(
            "text-emerald-400",
            "text-red-400",
            "text-yellow-400"
        );

        element.classList.add(online ? "text-emerald-400" : "text-red-400");
    }

    /**
     * Render Engine
     */
    static render() {
        this.renderSystemHealth();
        this.renderStatistics();
        this.renderModuleStatus();
        this.renderLastUpdated();
    }

    static renderSystemHealth() {
        if (typeof Gateway === "undefined" ||typeof Gateway.getHealthReport !== "function") return;
        const health = Gateway.getHealthReport();

        this.updateText("gateway-status", health.ready ? "ONLINE" : "OFFLINE");
        this.updateText("browser-status", health.browserCompatible ? "SUPPORTED" : "UNSUPPORTED");
        this.updateText("storage-status", health.storageAvailable ? "AVAILABLE" : "UNAVAILABLE");
    }

    static renderStatistics() {
        const users = JSON.parse(localStorage.getItem("kuts_users") || "[]");
        const referrals = JSON.parse(localStorage.getItem("kuts_referrals") || "[]");
        const wallets = JSON.parse(localStorage.getItem("kuts_wallets") || "[]");
        const subscriptions = JSON.parse(localStorage.getItem("kuts_subscriptions") || "[]");

        this.updateText("users-count", users.length);
        this.updateText("referrals-count", referrals.length);
        this.updateText("wallet-count", wallets.length);
        this.updateText("subscription-count", subscriptions.length);
    }

    static renderModuleStatus() {
        if (typeof Gateway === "undefined" ||typeof Gateway.getStatus !== "function") return;
        const modules = Gateway.getStatus().modules || {};

        Object.keys(modules).forEach(name => {
            const element = document.getElementById(`${name}-status`);
            if (!element) return;

            element.textContent = modules[name] ? "ONLINE" : "OFFLINE";
            element.className = modules[name] ? "text-emerald-400 font-bold" : "text-red-400 font-bold";
        });
    }

    static renderLastUpdated() {
        this.updateText("dashboard-last-update", new Date().toLocaleTimeString());
    }

    /**
     * Live Update Engine
     */
    static startLiveUpdates(interval = 5000) {
        this.log("Starting dashboard live updates...");
        this.stopLiveUpdates();

        this.refreshInterval = setInterval(() => {
            this.render();
        }, interval);
    }

    static stopLiveUpdates() {
        if (this.refreshInterval !== null) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    static registerEvents() {
        this.log("Registering dashboard events...");

        document.addEventListener("gateway:ready", () => {
            this.render();
        });

        document.addEventListener("gateway:shutdown", () => {
            this.updateSystemState("OFFLINE");
        });

        window.addEventListener("storage", () => {
            this.render();
        });

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                this.stopLiveUpdates();
            } else {
                this.render();
                this.startLiveUpdates();
            }
        });
    }

    static refresh() {
        this.render();
    }

    static updateSystemState(state) {
        const element = document.getElementById("gateway-status");
        if (!element) return;

        element.textContent = state;
        switch (state) {
            case "ONLINE":
                element.className = "text-emerald-400 font-bold";
                break;
            case "OFFLINE":
                element.className = "text-red-400 font-bold";
                break;
            default:
                element.className = "text-yellow-400 font-bold";
        }
    }

    /**
     * Data Getters (Fix for missing methods)
     */
    static getUsers() {
        return JSON.parse(localStorage.getItem("kuts_users") || "[]");
    }

    static getSubscriptions() {
        return JSON.parse(localStorage.getItem("kuts_subscriptions") || "[]");
    }

    static getReferrals() {
        return JSON.parse(localStorage.getItem("kuts_referrals") || "[]");
    }

    static getWallets() {
        return JSON.parse(localStorage.getItem("kuts_wallets") || "[]");
    }

    /**
     * Diagnostics & Dev Tools
     */
    static getDiagnostics() {
        return {
            timestamp: new Date().toISOString(),
            gateway: typeof Gateway !== "undefined" ? Gateway.getStatus() : null,
            health: typeof Gateway !== "undefined" ? Gateway.getHealthReport() : null,
            users: this.getUsers(),
            subscriptions: this.getSubscriptions(),
            referrals: this.getReferrals(),
            wallets: this.getWallets()
        };
    }

    static exportDiagnostics() {
        const data = JSON.stringify(this.getDiagnostics(), null, 4);
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "kuts-dashboard-diagnostics.json";
        link.click();
        URL.revokeObjectURL(url);
    }

    static printSummary() {
        console.group("KUTS Dashboard");
        console.table({
            Users: this.getUsers().length,
            Wallets: this.getWallets().length,
            Referrals: this.getReferrals().length,
            Subscriptions: this.getSubscriptions().length,
            Gateway: typeof Gateway !== "undefined" && Gateway.isReady() ? "READY" : "OFFLINE"
        });
        console.groupEnd();
    }

    static getStorageUsage() {
        let bytes = 0;
        for (const key in localStorage) {
            if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
                bytes += key.length + localStorage[key].length;
            }
        }
        return {
            bytes,
            kilobytes: (bytes / 1024).toFixed(2),
            megabytes: (bytes / 1024 / 1024).toFixed(3)
        };
    }

    static printStorageUsage() {
        console.group("Storage Usage");
        console.table(this.getStorageUsage());
        console.groupEnd();
    }

    static clearCache() {
        this.log("Clearing dashboard cache...");
        sessionStorage.clear();
    }

    static reset() {
        this.stopLiveUpdates();
        this.render();
        this.startLiveUpdates();
        this.log("Dashboard reset.");
    }

    static destroy() {
        this.stopLiveUpdates();
        this.initialized = false;
        this.elements = {};
    }
}

/**
 * ==========================================================
 * DASHBOARD BOOTSTRAP
 * ==========================================================
 */
window.Dashboard = Dashboard;

document.addEventListener("DOMContentLoaded", () => {
    Dashboard.initialize();
});