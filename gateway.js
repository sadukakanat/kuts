"use strict";

/**
 * ==========================================================
 * KUTS ECOSYSTEM
 * Gateway Bootstrap Module
 * ----------------------------------------------------------
 * Version : 1.0.0
 * Purpose : Central application bootstrapper
 * ==========================================================
 */

class Gateway {

    /**
     * ------------------------------------------------------
     * Runtime State
     * ------------------------------------------------------
     */

    static status = {
        initialized: false,
        ready: false,
        version: "1.0.0",
        environment: "development",
        browserCompatible: false,
        storageAvailable: false,
        startupTime: null,

        modules: {
            config: false,
            signup: false,
            subscription: false,
            wallet: false,
            referral: false,
            dashboard: false,
            authentication: false
        },

        errors: []
    };

    /**
     * ------------------------------------------------------
     * Application Bootstrap
     * ------------------------------------------------------
     */

    static initialize() {
        this.startBootTimer();

        if (this.status.initialized) {
            this.log("Gateway already initialized.");
            this.finishBootTimer();
            return;
        }

        this.log("=======================================");
        this.log("Starting KUTS Ecosystem Gateway");
        this.log("=======================================");

        this.status.startupTime = new Date().toISOString();

        try {

            this.loadConfiguration();

            this.verifyBrowser();

            this.initializeStorage();

            this.status.initialized = true;

            this.finishBootTimer();

            this.log("Gateway bootstrap completed.");

        } catch (error) {

            this.handleError(error);

        }

    }

    /**
     * ------------------------------------------------------
     * Load Configuration
     * ------------------------------------------------------
     */

    static loadConfiguration() {

        this.log("Loading configuration...");

        if (typeof AppConfig !== "undefined") {

            this.status.modules.config = true;

            if (AppConfig.VERSION)
                this.status.version = AppConfig.VERSION;

            if (AppConfig.ENVIRONMENT)
                this.status.environment = AppConfig.ENVIRONMENT;

            this.log("Configuration loaded.");

        } else {

            this.warn("AppConfig not found.");

        }

    }

    /**
     * ------------------------------------------------------
     * Browser Compatibility
     * ------------------------------------------------------
     */

    static verifyBrowser() {

        this.log("Checking browser compatibility...");

        const compatible =
            typeof window !== "undefined" &&
            typeof document !== "undefined" &&
            typeof localStorage !== "undefined" &&
            typeof JSON !== "undefined";

        this.status.browserCompatible = compatible;

        if (!compatible) {

            throw new Error(
                "Browser is not compatible with KUTS."
            );

        }

        this.log("Browser compatible.");

    }

    /**
     * ------------------------------------------------------
     * Storage Check
     * ------------------------------------------------------
     */

    static initializeStorage() {

        this.log("Checking Local Storage...");

        try {

            const key = "__kuts_gateway_test__";

            localStorage.setItem(key, "OK");

            localStorage.removeItem(key);

            this.status.storageAvailable = true;

            this.log("Local Storage available.");

        } catch (error) {

            this.status.storageAvailable = false;

            throw new Error(
                "Local Storage unavailable."
            );

        }

    }

    /**
     * ------------------------------------------------------
     * Logging
     * ------------------------------------------------------
     */

    static log(message) {

        if (
            typeof AppConfig !== "undefined" &&
            AppConfig.DEBUG_MODE === false
        ) {
            return;
        }

        console.log("[Gateway]", message);

    }

    static warn(message) {

        console.warn("[Gateway]", message);

    }

    static error(message) {

        console.error("[Gateway]", message);

    }

    /**
     * ------------------------------------------------------
     * Error Handling
     * ------------------------------------------------------
     */

    static handleError(error) {

        this.status.errors.push(error.message);

        this.error(error.message);

    }

    /**
     * ------------------------------------------------------
     * Public API
     * ------------------------------------------------------
     */

    static getStatus() {

        return structuredClone(this.status);

    }

    static getVersion() {

        return this.status.version;

    }

    /**
     * ------------------------------------------------------
     * Initialize Core Modules
     * ------------------------------------------------------
     */

    static initializeModules() {

        this.log("Initializing core modules...");

        this.initializeSignup();

        this.initializeSubscription();

        this.initializeWallet();

        this.initializeReferral();

        this.verifyModules();

    }

    /**
     * ------------------------------------------------------
     * Signup Module
     * ------------------------------------------------------
     */

    static initializeSignup() {

        if (typeof UserStorage === "undefined") {

            this.warn("UserStorage not found.");

            return;

        }

        this.status.modules.signup = true;

        if (typeof UserStorage.initialize === "function") {

            UserStorage.initialize();

        }

        this.log("Signup module ready.");

    }

    /**
     * ------------------------------------------------------
     * Subscription Module
     * ------------------------------------------------------
     */

    static initializeSubscription() {

        if (typeof SubscriptionStorage === "undefined") {

            this.warn("SubscriptionStorage not found.");

            return;

        }

        this.status.modules.subscription = true;

        if (typeof SubscriptionStorage.initialize === "function") {

            SubscriptionStorage.initialize();

        }

        this.log("Subscription module ready.");

    }

    /**
     * ------------------------------------------------------
     * Wallet Module
     * ------------------------------------------------------
     */

    static initializeWallet() {

        if (typeof WalletStorage === "undefined") {

            this.warn("WalletStorage not found.");

            return;

        }

        this.status.modules.wallet = true;

        if (typeof WalletStorage.initialize === "function") {

            WalletStorage.initialize();

        }

        this.log("Wallet module ready.");

    }

    /**
     * ------------------------------------------------------
     * Referral Module
     * ------------------------------------------------------
     */

    static initializeReferral() {

        if (typeof ReferralStorage === "undefined") {

            this.warn("ReferralStorage not found.");

            return;

        }

        this.status.modules.referral = true;

        if (typeof ReferralStorage.initialize === "function") {

            ReferralStorage.initialize();

        }

        this.log("Referral module ready.");

    }

    /**
     * ------------------------------------------------------
     * Verify Module Health
     * ------------------------------------------------------
     */

    static verifyModules() {

        this.log("Running module health checks...");

        const modules = this.status.modules;

        const missing = [];

        Object.keys(modules).forEach(name => {

            if (!modules[name]) {

                missing.push(name);

            }

        });

        if (missing.length > 0) {

            this.warn(
                "Modules unavailable: " +
                missing.join(", ")
            );

        } else {

            this.log(
                "All core modules initialized successfully."
            );

        }

        this.status.ready = true;

        this.log("Gateway is READY.");

    }

    /**
     * ------------------------------------------------------
     * Module Status
     * ------------------------------------------------------
     */

    static isModuleAvailable(moduleName) {

        return !!this.status.modules[moduleName];

    }

    /**
     * ------------------------------------------------------
     * Health Report
     * ------------------------------------------------------
     */

    static getHealthReport() {

        return {

            ready: this.status.ready,

            browserCompatible:
                this.status.browserCompatible,

            storageAvailable:
                this.status.storageAvailable,

            modules: structuredClone(
                this.status.modules
            ),

            startupTime:
                this.status.startupTime,

            errors:
                [...this.status.errors]

        };

    }

    /**
     * ------------------------------------------------------
     * Dashboard Initialization
     * ------------------------------------------------------
     */

    static initializeDashboard() {

        this.log("Initializing dashboard...");

        if (typeof Dashboard === "undefined") {

            this.warn("Dashboard module not found.");

            return;

        }

        try {

            if (typeof Dashboard.initialize === "function") {

                Dashboard.initialize();

            }

            this.status.modules.dashboard = true;

            this.log("Dashboard initialized.");

        } catch (error) {

            this.handleError(error);

        }

    }

    /**
     * ------------------------------------------------------
     * Authentication Initialization
     * ------------------------------------------------------
     */

    static initializeAuthentication() {

        this.log("Initializing authentication...");

        if (typeof AuthService === "undefined") {

            this.warn("Authentication module not found.");

            return;

        }

        try {

            if (typeof AuthService.initialize === "function") {

                AuthService.initialize();

            }

            this.status.modules.authentication = true;

            this.log("Authentication initialized.");

        } catch (error) {

            this.handleError(error);

        }

    }

    /**
     * ------------------------------------------------------
     * Register Global Events
     * ------------------------------------------------------
     */

    static registerEvents() {

        this.log("Registering global events...");

        window.addEventListener("storage", () => {

            this.log("Storage updated.");

        });

        window.addEventListener("beforeunload", () => {

            this.shutdown();

        });

    }

    /**
     * ------------------------------------------------------
     * Dispatch Gateway Events
     * ------------------------------------------------------
     */

    static dispatchEvent(name, detail = {}) {

        document.dispatchEvent(

            new CustomEvent(name, {

                detail

            })

        );

    }

    /**
     * ------------------------------------------------------
     * Gateway Ready
     * ------------------------------------------------------
     */

    static finishInitialization() {

        this.status.ready = true;

        this.dispatchEvent(

            "gateway:ready",

            this.getStatus()

        );

        this.log("Gateway is READY.");

    }

    /**
     * ------------------------------------------------------
     * Restart Gateway
     * ------------------------------------------------------
     */

    static restart() {

        this.log("Restarting Gateway...");

        this.status.initialized = false;

        this.status.ready = false;

        this.initialize();

    }

    /**
     * ------------------------------------------------------
     * Shutdown Gateway
     * ------------------------------------------------------
     */

    static shutdown() {

        this.log("Gateway shutting down...");

        this.dispatchEvent(

            "gateway:shutdown",

            this.getStatus()

        );

    }

    /**
     * ------------------------------------------------------
     * Ready State
     * ------------------------------------------------------
     */

    static isReady() {

        return this.status.ready;

    }

    /**
     * ------------------------------------------------------
     * Initialize Runtime Services
     * ------------------------------------------------------
     */

    static initializeRuntime() {

        this.initializeDashboard();

        this.initializeAuthentication();

        this.registerEvents();

        this.finishInitialization();

    }

    /**
     * ==========================================================
     * PART 3A
     * MODULE REGISTRY
     * ==========================================================
     */

    /**
     * Registered modules
     */
    static modules = new Map();

    /**
     * ----------------------------------------------------------
     * Register Module
     * ----------------------------------------------------------
     */

    static registerModule(name, module) {

        if (!name || typeof name !== "string") {

            throw new Error("Gateway.registerModule(): Invalid module name.");

        }

        if (!module || typeof module !== "object") {

            throw new Error(`Gateway.registerModule(): ${name} is invalid.`);

        }

        if (this.modules.has(name)) {

            this.warn(`Module '${name}' already registered.`);

            return false;

        }

        this.modules.set(name, {

            name,

            instance: module,

            version: module.version || "1.0.0",

            initialized: false,

            registeredAt: new Date().toISOString()

        });

        this.log(`Module registered: ${name}`);

        return true;

    }

    /**
     * ----------------------------------------------------------
     * Unregister Module
     * ----------------------------------------------------------
     */

    static unregisterModule(name) {

        if (!this.modules.has(name)) {

            return false;

        }

        this.modules.delete(name);

        this.log(`Module removed: ${name}`);

        return true;

    }

    /**
     * ----------------------------------------------------------
     * Get Module
     * ----------------------------------------------------------
     */

    static getModule(name) {

        const entry = this.modules.get(name);

        return entry ? entry.instance : null;

    }

    /**
     * ----------------------------------------------------------
     * Module Exists
     * ----------------------------------------------------------
     */

    static hasModule(name) {

        return this.modules.has(name);

    }

    /**
     * ----------------------------------------------------------
     * Module Count
     * ----------------------------------------------------------
     */

    static getModuleCount() {

        return this.modules.size;

    }

    /**
     * ----------------------------------------------------------
     * List Modules
     * ----------------------------------------------------------
     */

    static listModules() {

        return Array.from(this.modules.keys());

    }

    /**
     * ----------------------------------------------------------
     * Initialize Registered Modules
     * ----------------------------------------------------------
     */

    static initializeRegisteredModules() {

        this.log("Initializing registered modules...");

        for (const [name, entry] of this.modules.entries()) {

            try {

                const module = entry.instance;

                if (typeof module.initialize === "function") {

                    module.initialize();

                }

                entry.initialized = true;

                this.log(`${name} initialized.`);

            } catch (error) {

                entry.initialized = false;

                this.recordFailure(name, error);

                if (!this.runtime.safeMode) {

                    this.enableSafeMode();

                }

                this.handleError(error);

            }

        }

    }

    /**
     * ----------------------------------------------------------
     * Registered Module Status
     * ----------------------------------------------------------
     */

    static getRegisteredModules() {

        return Array.from(this.modules.values());

    }

    /**
     * ----------------------------------------------------------
     * Print Module Registry
     * ----------------------------------------------------------
     */

    static printModules() {

        console.group("Gateway Module Registry");

        console.table(

            this.getRegisteredModules().map(module => ({

                Name: module.name,

                Version: module.version,

                Initialized: module.initialized,

                Registered: module.registeredAt

            }))

        );

        console.groupEnd();

    }

    /**
     * ==========================================================
     * PART 3B
     * SERVICE REGISTRY & EVENT BUS
     * ==========================================================
     */

    /**
     * Shared services
     */
    static services = new Map();

    /**
     * Event subscribers
     */
    static subscribers = new Map();

    /* ----------------------------------------------------------
     * Register Service
     * ---------------------------------------------------------- */

    static registerService(name, service) {

        if (!name || typeof name !== "string") {
            throw new Error("Invalid service name.");
        }

        if (!service) {
            throw new Error("Invalid service.");
        }

        if (this.services.has(name)) {

            this.warn(`Service '${name}' already registered.`);

            return false;

        }

        this.services.set(name, service);

        this.log(`Service registered: ${name}`);

        return true;

    }

    /* ----------------------------------------------------------
     * Get Service
     * ---------------------------------------------------------- */

    static getService(name) {

        return this.services.get(name) || null;

    }

    /* ----------------------------------------------------------
     * Remove Service
     * ---------------------------------------------------------- */

    static unregisterService(name) {

        if (!this.services.has(name)) {

            return false;

        }

        this.services.delete(name);

        this.log(`Service removed: ${name}`);

        return true;

    }

    /* ----------------------------------------------------------
     * Service Exists
     * ---------------------------------------------------------- */

    static hasService(name) {

        return this.services.has(name);

    }

    /* ----------------------------------------------------------
     * List Services
     * ---------------------------------------------------------- */

    static listServices() {

        return Array.from(this.services.keys());

    }

    /* ----------------------------------------------------------
     * Subscribe
     * ---------------------------------------------------------- */

    static subscribe(eventName, callback) {

        if (typeof callback !== "function") {

            throw new Error("Subscriber must be a function.");

        }

        if (!this.subscribers.has(eventName)) {

            this.subscribers.set(eventName, []);

        }

        this.subscribers.get(eventName).push(callback);

    }

    /* ----------------------------------------------------------
     * Unsubscribe
     * ---------------------------------------------------------- */

    static unsubscribe(eventName, callback) {

        if (!this.subscribers.has(eventName)) {

            return;

        }

        const listeners = this.subscribers.get(eventName);

        const filtered = listeners.filter(fn => fn !== callback);

        this.subscribers.set(eventName, filtered);

    }

    /* ----------------------------------------------------------
     * Publish Event
     * ---------------------------------------------------------- */

    static publish(eventName, payload = {}) {

        this.log(`Publishing: ${eventName}`);

        const listeners = this.subscribers.get(eventName);

        if (!listeners || listeners.length === 0) {

            return;

        }

        listeners.forEach(listener => {

            try {

                listener(payload);

            }

            catch (error) {

                this.handleError(error);

            }

        });

    }

    /* ----------------------------------------------------------
     * Clear Event
     * ---------------------------------------------------------- */

    static clearSubscribers(eventName) {

        this.subscribers.delete(eventName);

    }

    /* ----------------------------------------------------------
     * Clear All Events
     * ---------------------------------------------------------- */

    static clearAllSubscribers() {

        this.subscribers.clear();

    }

    /* ----------------------------------------------------------
     * Broadcast System Status
     * ---------------------------------------------------------- */

    static broadcastStatus() {

        this.publish("gateway.status", {

            status: this.getStatus(),

            health: this.getHealthReport(),

            timestamp: Date.now()

        });

    }

    /* ----------------------------------------------------------
     * Print Services
     * ---------------------------------------------------------- */

    static printServices() {

        console.group("Gateway Services");

        console.table(

            this.listServices().map(service => ({

                Service: service

            }))

        );

        console.groupEnd();

    }

    /* ----------------------------------------------------------
     * Print Event Bus
     * ---------------------------------------------------------- */

    static printEvents() {

        console.group("Gateway Event Bus");

        const rows = [];

        this.subscribers.forEach((listeners, eventName) => {

            rows.push({

                Event: eventName,

                Subscribers: listeners.length

            });

        });

        console.table(rows);

        console.groupEnd();

    }

    /**
     * ==========================================================
     * PART 3C
     * DIAGNOSTICS • SAFE MODE • DEVELOPER TOOLS
     * ==========================================================
     */

    /**
     * Runtime statistics
     */
    static runtime = {

        startTime: null,

        initializedAt: null,

        bootDuration: 0,

        failedModules: [],

        safeMode: false

    };

    /* ----------------------------------------------------------
     * Start Boot Timer
     * ---------------------------------------------------------- */

    static startBootTimer() {

        this.runtime.startTime = performance.now();

    }

    /* ----------------------------------------------------------
     * Finish Boot Timer
     * ---------------------------------------------------------- */

    static finishBootTimer() {

        this.runtime.initializedAt = new Date().toISOString();

        this.runtime.bootDuration =
            performance.now() - this.runtime.startTime;

    }

    /* ----------------------------------------------------------
     * Enable Safe Mode
     * ---------------------------------------------------------- */

    static enableSafeMode() {

        this.runtime.safeMode = true;

        this.warn("Gateway SAFE MODE enabled.");

    }

    /* ----------------------------------------------------------
     * Record Module Failure
     * ---------------------------------------------------------- */

    static recordFailure(moduleName, error) {

        this.runtime.failedModules.push({

            module: moduleName,

            message: error.message,

            time: new Date().toISOString()

        });

        this.warn(`${moduleName} failed.`);

    }

    /* ----------------------------------------------------------
     * Uptime
     * ---------------------------------------------------------- */

    static getUptime() {

        if (!this.runtime.initializedAt) {

            return 0;

        }

        return Date.now() -
            new Date(this.runtime.initializedAt).getTime();

    }

    /* ----------------------------------------------------------
     * System Information
     * ---------------------------------------------------------- */

    static getSystemInformation() {

        return {

            version: this.getVersion(),

            browser: navigator.userAgent,

            language: navigator.language,

            platform: navigator.platform,

            online: navigator.onLine,

            storageAvailable: this.status.storageAvailable,

            initialized: this.status.initialized,

            ready: this.status.ready,

            safeMode: this.runtime.safeMode,

            uptime: this.getUptime(),

            bootDuration: this.runtime.bootDuration

        };

    }

    /* ----------------------------------------------------------
     * Print Status
     * ---------------------------------------------------------- */

    static printStatus() {

        console.group("Gateway Status");

        console.table(this.getStatus());

        console.groupEnd();

    }

    /* ----------------------------------------------------------
     * Print Health
     * ---------------------------------------------------------- */

    static printHealth() {

        console.group("Gateway Health");

        console.table(this.getHealthReport());

        console.groupEnd();

    }

    /* ----------------------------------------------------------
     * Print Runtime
     * ---------------------------------------------------------- */

    static printRuntime() {

        console.group("Gateway Runtime");

        console.table(this.runtime);

        console.groupEnd();

    }

    /* ----------------------------------------------------------
     * Export Diagnostics
     * ---------------------------------------------------------- */

    static exportDiagnostics() {

        return {

            status: this.getStatus(),

            health: this.getHealthReport(),

            runtime: this.runtime,

            system: this.getSystemInformation(),

            modules: this.getRegisteredModules(),

            services: this.listServices()

        };

    }

    /* ----------------------------------------------------------
     * Print Diagnostics
     * ---------------------------------------------------------- */

    static printDiagnostics() {

        console.group("KUTS Gateway Diagnostics");

        this.printStatus();

        this.printHealth();

        this.printModules();

        this.printServices();

        this.printEvents();

        this.printRuntime();

        console.groupEnd();

    }

}

/**
 * ==========================================================
 * GATEWAY BOOTSTRAP
 * ==========================================================
 */

window.Gateway = Gateway;

Object.freeze(Gateway);

document.addEventListener("DOMContentLoaded", () => {
    Gateway.initialize();
});