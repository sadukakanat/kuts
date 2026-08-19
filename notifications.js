"use strict";

/**
 * ==========================================================
 * KUTS ECOSYSTEM
 * NOTIFICATION MANAGER
 * ----------------------------------------------------------
 * Version : 1.0.0
 * Purpose : Central notification management system
 * ==========================================================
 */

class Notifications {

    /**
     * ------------------------------------------------------
     * Configuration
     * ------------------------------------------------------
     */

    static config = {

        version: "1.0.0",

        debug: true,

        maxNotifications: 500,

        autoSave: true,

        storageKey: "kuts_notifications"

    };

    /**
     * ------------------------------------------------------
     * Runtime Status
     * ------------------------------------------------------
     */

    static status = {

        initialized: false,

        enabled: true,

        unread: 0,

        total: 0

    };

    /**
     * ------------------------------------------------------
     * Notification Storage
     * ------------------------------------------------------
     */

    static notifications = [];

    /**
     * ------------------------------------------------------
     * Notification Types
     * ------------------------------------------------------
     */

    static types = Object.freeze({

        SUCCESS: "success",

        INFO: "info",

        WARNING: "warning",

        ERROR: "error",

        SYSTEM: "system"

    });

    /**
     * ------------------------------------------------------
     * Priority Levels
     * ------------------------------------------------------
     */

    static priorities = Object.freeze({

        LOW: "low",

        NORMAL: "normal",

        HIGH: "high",

        CRITICAL: "critical"

    });

    /**
     * ------------------------------------------------------
     * Initialize
     * ------------------------------------------------------
     */

    static initialize() {

        if (this.status.initialized) {

            return;

        }

        this.log("Initializing Notifications...");

        this.load();

        this.status.initialized = true;

        this.log("Notifications initialized.");

    }

    /**
     * ------------------------------------------------------
     * Create Notification
     * ------------------------------------------------------
     */

    static notify({

        title = "",

        message = "",

        type = this.types.INFO,

        priority = this.priorities.NORMAL,

        data = {}

    }) {

        if (!this.status.enabled) {

            return null;

        }

        const notification = {

            id: crypto.randomUUID(),

            title,

            message,

            type,

            priority,

            data,

            read: false,

            createdAt: new Date().toISOString()

        };

        this.notifications.push(notification);

        this.status.total++;

        this.status.unread++;

        if (

            this.notifications.length >

            this.config.maxNotifications

        ) {

            this.notifications.shift();

        }

        if (this.config.autoSave) {

            this.save();

        }

        this.log(

            `Notification: ${title}`

        );

        return notification;

    }

    /**
     * ------------------------------------------------------
     * Convenience Methods
     * ------------------------------------------------------
     */

    static success(title, message = "") {

        return this.notify({

            title,

            message,

            type: this.types.SUCCESS

        });

    }

    static info(title, message = "") {

        return this.notify({

            title,

            message,

            type: this.types.INFO

        });

    }

    static warning(title, message = "") {

        return this.notify({

            title,

            message,

            type: this.types.WARNING

        });

    }

    static error(title, message = "") {

        return this.notify({

            title,

            message,

            type: this.types.ERROR

        });

    }

    /**
     * ------------------------------------------------------
     * Get Notification
     * ------------------------------------------------------
     */

    static get(id) {

        return this.notifications.find(

            notification =>

                notification.id === id

        ) || null;

    }

    /**
     * ------------------------------------------------------
     * List Notifications
     * ------------------------------------------------------
     */

    static getAll() {

        return [

            ...this.notifications

        ];

    }

    /**
     * ------------------------------------------------------
     * Remove Notification
     * ------------------------------------------------------
     */

    static remove(id) {

        const index =

            this.notifications.findIndex(

                notification =>

                    notification.id === id

            );

        if (index === -1) {

            return false;

        }

        const notification =

            this.notifications[index];

        if (!notification.read) {

            this.status.unread--;

        }

        this.notifications.splice(index, 1);

        this.status.total--;

        this.save();

        return true;

    }

    /**
     * ------------------------------------------------------
     * Clear Notifications
     * ------------------------------------------------------
     */

    static clear() {

        this.notifications = [];

        this.status.total = 0;

        this.status.unread = 0;

        localStorage.removeItem(

            this.config.storageKey

        );

    }

    /**
     * ------------------------------------------------------
     * Save
     * ------------------------------------------------------
     */

    static save() {

        try {

            localStorage.setItem(

                this.config.storageKey,

                JSON.stringify(

                    this.notifications

                )

            );

        }

        catch (error) {

            this.warn(

                "Unable to save notifications."

            );

        }

    }

    /**
     * ------------------------------------------------------
     * Load
     * ------------------------------------------------------
     */

    static load() {

        try {

            const data =

                localStorage.getItem(

                    this.config.storageKey

                );

            if (!data) {

                return;

            }

            this.notifications =

                JSON.parse(data);

            this.status.total =

                this.notifications.length;

            this.status.unread =

                this.notifications.filter(

                    notification =>

                        !notification.read

                ).length;

        }

        catch (error) {

            this.warn(

                "Unable to load notifications."

            );

        }

    }

    /**
     * ------------------------------------------------------
     * Logging
     * ------------------------------------------------------
     */

    static log(message) {

        if (!this.config.debug) {

            return;

        }

        console.log(

            "[Notifications]",

            message

        );

    }

    static warn(message) {

        console.warn(

            "[Notifications]",

            message

        );

    }

    static errorLog(message) {

        console.error(

            "[Notifications]",

            message

        );

    }

    /**
     * ------------------------------------------------------
     * Public API
     * ------------------------------------------------------
     */

    static getStatus() {

        return structuredClone(

            this.status

        );

    }

    static getVersion() {

        return this.config.version;

    }

}
/**
 * ==========================================================
 * PART 2
 * NOTIFICATION QUEUE & DISPLAY
 * ==========================================================
 */

/**
 * ------------------------------------------------------
 * Queue
 * ------------------------------------------------------
 */

Notifications.queue = [];

/**
 * ------------------------------------------------------
 * Active Notification
 * ------------------------------------------------------
 */

Notifications.active = null;

/**
 * ------------------------------------------------------
 * Add To Queue
 * ------------------------------------------------------
 */

Notifications.enqueue = function (notification) {

    if (!notification) {

        return false;

    }

    this.queue.push(notification);

    this.log("Notification queued.");

    return true;

};

/**
 * ------------------------------------------------------
 * Process Queue
 * ------------------------------------------------------
 */

Notifications.processQueue = function () {

    if (this.active || this.queue.length === 0) {

        return;

    }

    this.active = this.queue.shift();

    this.display(this.active);

};

/**
 * ------------------------------------------------------
 * Display Notification
 * ------------------------------------------------------
 */

Notifications.display = function (notification) {

    if (!notification) {

        return;

    }

    this.log(

        `Displaying: ${notification.title}`

    );

    if (

        typeof UI !== "undefined" &&

        typeof UI.showNotification === "function"

    ) {

        UI.showNotification(notification);

    }

};

/**
 * ------------------------------------------------------
 * Hide Notification
 * ------------------------------------------------------
 */

Notifications.hide = function () {

    this.active = null;

    this.processQueue();

};

/**
 * ------------------------------------------------------
 * Mark As Read
 * ------------------------------------------------------
 */

Notifications.markAsRead = function (id) {

    const notification = this.get(id);

    if (!notification) {

        return false;

    }

    if (!notification.read) {

        notification.read = true;

        this.status.unread--;

        this.save();

    }

    return true;

};

/**
 * ------------------------------------------------------
 * Mark All As Read
 * ------------------------------------------------------
 */

Notifications.markAllAsRead = function () {

    this.notifications.forEach(notification => {

        notification.read = true;

    });

    this.status.unread = 0;

    this.save();

};

/**
 * ------------------------------------------------------
 * Unread Notifications
 * ------------------------------------------------------
 */

Notifications.getUnread = function () {

    return this.notifications.filter(

        notification =>

            !notification.read

    );

};

/**
 * ------------------------------------------------------
 * Read Notifications
 * ------------------------------------------------------
 */

Notifications.getRead = function () {

    return this.notifications.filter(

        notification =>

            notification.read

    );

};

/**
 * ------------------------------------------------------
 * Notification Count
 * ------------------------------------------------------
 */

Notifications.count = function () {

    return this.notifications.length;

};

/**
 * ------------------------------------------------------
 * Find By Type
 * ------------------------------------------------------
 */

Notifications.findByType = function (type) {

    return this.notifications.filter(

        notification =>

            notification.type === type

    );

};

/**
 * ------------------------------------------------------
 * Find By Priority
 * ------------------------------------------------------
 */

Notifications.findByPriority = function (priority) {

    return this.notifications.filter(

        notification =>

            notification.priority === priority

    );

};

/**
 * ------------------------------------------------------
 * Latest Notification
 * ------------------------------------------------------
 */

Notifications.latest = function () {

    if (

        this.notifications.length === 0

    ) {

        return null;

    }

    return this.notifications[

        this.notifications.length - 1

    ];

};

/**
 * ------------------------------------------------------
 * Remove Read Notifications
 * ------------------------------------------------------
 */

Notifications.removeRead = function () {

    this.notifications =

        this.notifications.filter(

            notification =>

                !notification.read

        );

    this.status.total =

        this.notifications.length;

    this.save();

};

/**
 * ------------------------------------------------------
 * Queue Status
 * ------------------------------------------------------
 */

Notifications.getQueueStatus = function () {

    return {

        queued:

            this.queue.length,

        active:

            this.active !== null,

        unread:

            this.status.unread,

        total:

            this.status.total

    };

};

/**
 * ------------------------------------------------------
 * Refresh Display
 * ------------------------------------------------------
 */

Notifications.refresh = function () {

    if (

        typeof UI !== "undefined" &&

        typeof UI.refreshNotifications === "function"

    ) {

        UI.refreshNotifications(

            this.getAll()

        );

    }

};
/**
 * ==========================================================
 * PART 2A
 * NOTIFICATION TEMPLATES & CATEGORIES
 * ==========================================================
 */

/**
 * ------------------------------------------------------
 * Categories
 * ------------------------------------------------------
 */

Notifications.categories = Object.freeze({

    SYSTEM: "system",

    AUTH: "authentication",

    ACCOUNT: "account",

    WALLET: "wallet",

    SUBSCRIPTION: "subscription",

    REFERRAL: "referral",

    API: "api",

    DASHBOARD: "dashboard",

    SECURITY: "security",

    GENERAL: "general"

});

/**
 * ------------------------------------------------------
 * Notification Templates
 * ------------------------------------------------------
 */

Notifications.templates = new Map();

/**
 * ------------------------------------------------------
 * Register Template
 * ------------------------------------------------------
 */

Notifications.registerTemplate = function (

    name,

    template

) {

    if (

        !name ||

        typeof name !== "string"

    ) {

        throw new Error(

            "Invalid template name."

        );

    }

    this.templates.set(

        name,

        structuredClone(template)

    );

};

/**
 * ------------------------------------------------------
 * Remove Template
 * ------------------------------------------------------
 */

Notifications.removeTemplate = function (

    name

) {

    return this.templates.delete(name);

};

/**
 * ------------------------------------------------------
 * Get Template
 * ------------------------------------------------------
 */

Notifications.getTemplate = function (

    name

) {

    if (

        !this.templates.has(name)

    ) {

        return null;

    }

    return structuredClone(

        this.templates.get(name)

    );

};

/**
 * ------------------------------------------------------
 * List Templates
 * ------------------------------------------------------
 */

Notifications.listTemplates = function () {

    return Array.from(

        this.templates.keys()

    );

};

/**
 * ------------------------------------------------------
 * Send Template Notification
 * ------------------------------------------------------
 */

Notifications.sendTemplate = function (

    name,

    overrides = {}

) {

    const template =

        this.getTemplate(name);

    if (!template) {

        this.warn(

            `Template '${name}' not found.`

        );

        return null;

    }

    return this.notify({

        ...template,

        ...overrides

    });

};

/**
 * ------------------------------------------------------
 * Register Default Templates
 * ------------------------------------------------------
 */

Notifications.registerDefaultTemplates = function () {

    this.registerTemplate(

        "login_success",

        {

            title: "Login Successful",

            message:

                "Welcome back to KUTS.",

            type: this.types.SUCCESS,

            priority:

                this.priorities.NORMAL,

            category:

                this.categories.AUTH

        }

    );

    this.registerTemplate(

        "login_failed",

        {

            title: "Login Failed",

            message:

                "Invalid username or password.",

            type: this.types.ERROR,

            priority:

                this.priorities.HIGH,

            category:

                this.categories.AUTH

        }

    );

    this.registerTemplate(

        "wallet_credit",

        {

            title: "Wallet Updated",

            message:

                "Funds have been added.",

            type: this.types.SUCCESS,

            priority:

                this.priorities.NORMAL,

            category:

                this.categories.WALLET

        }

    );

    this.registerTemplate(

        "subscription_expiring",

        {

            title: "Subscription Reminder",

            message:

                "Your subscription will expire soon.",

            type: this.types.WARNING,

            priority:

                this.priorities.HIGH,

            category:

                this.categories.SUBSCRIPTION

        }

    );

    this.registerTemplate(

        "system_error",

        {

            title: "System Error",

            message:

                "An unexpected error occurred.",

            type: this.types.ERROR,

            priority:

                this.priorities.CRITICAL,

            category:

                this.categories.SYSTEM

        }

    );

};

/**
 * ------------------------------------------------------
 * Find By Category
 * ------------------------------------------------------
 */

Notifications.findByCategory = function (

    category

) {

    return this.notifications.filter(

        notification =>

            notification.category === category

    );

};

/**
 * ------------------------------------------------------
 * Category Statistics
 * ------------------------------------------------------
 */

Notifications.getCategoryStatistics = function () {

    const statistics = {};

    this.notifications.forEach(

        notification => {

            const category =

                notification.category ||

                this.categories.GENERAL;

            statistics[category] =

                (statistics[category] || 0) + 1;

        }

    );

    return statistics;

};

/**
 * ------------------------------------------------------
 * Clear Templates
 * ------------------------------------------------------
 */

Notifications.clearTemplates = function () {

    this.templates.clear();

};
/**
 * ==========================================================
 * PART 2B
 * SCHEDULING • EXPIRATION • AUTO-DISMISS
 * ==========================================================
 */

/**
 * ------------------------------------------------------
 * Scheduled Notifications
 * ------------------------------------------------------
 */

Notifications.scheduled = [];

/**
 * ------------------------------------------------------
 * Default Timing
 * ------------------------------------------------------
 */

Notifications.timing = {

    autoDismiss: true,

    dismissAfter: 5000,

    schedulerInterval: 1000

};

/**
 * ------------------------------------------------------
 * Schedule Notification
 * ------------------------------------------------------
 */

Notifications.schedule = function (

    notification,

    executeAt

) {

    if (!notification) {

        return false;

    }

    this.scheduled.push({

        notification,

        executeAt:

            new Date(executeAt).getTime()

    });

    this.log("Notification scheduled.");

    return true;

};

/**
 * ------------------------------------------------------
 * Process Scheduled Notifications
 * ------------------------------------------------------
 */

Notifications.processScheduled = function () {

    const now = Date.now();

    this.scheduled = this.scheduled.filter(item => {

        if (item.executeAt <= now) {

            this.notify(item.notification);

            return false;

        }

        return true;

    });

};

/**
 * ------------------------------------------------------
 * Set Expiration
 * ------------------------------------------------------
 */

Notifications.setExpiration = function (

    id,

    milliseconds

) {

    const notification = this.get(id);

    if (!notification) {

        return false;

    }

    notification.expiresAt =

        Date.now() + milliseconds;

    return true;

};

/**
 * ------------------------------------------------------
 * Remove Expired
 * ------------------------------------------------------
 */

Notifications.removeExpired = function () {

    const now = Date.now();

    this.notifications =

        this.notifications.filter(notification => {

            if (

                !notification.expiresAt

            ) {

                return true;

            }

            return (

                notification.expiresAt >

                now

            );

        });

    this.status.total =

        this.notifications.length;

    this.status.unread =

        this.notifications.filter(

            notification =>

                !notification.read

        ).length;

    this.save();

};

/**
 * ------------------------------------------------------
 * Auto Dismiss Active Notification
 * ------------------------------------------------------
 */

Notifications.autoDismiss = function (

    delay = this.timing.dismissAfter

) {

    if (

        !this.timing.autoDismiss ||

        !this.active

    ) {

        return;

    }

    setTimeout(() => {

        this.hide();

    }, delay);

};

/**
 * ------------------------------------------------------
 * Start Scheduler
 * ------------------------------------------------------
 */

Notifications.startScheduler = function () {

    this.stopScheduler();

    this.scheduler = setInterval(() => {

        this.processScheduled();

        this.removeExpired();

    },

    this.timing.schedulerInterval);

    this.log("Scheduler started.");

};

/**
 * ------------------------------------------------------
 * Stop Scheduler
 * ------------------------------------------------------
 */

Notifications.stopScheduler = function () {

    if (this.scheduler) {

        clearInterval(this.scheduler);

        this.scheduler = null;

    }

};

/**
 * ------------------------------------------------------
 * Scheduler Status
 * ------------------------------------------------------
 */

Notifications.getSchedulerStatus = function () {

    return {

        running:

            !!this.scheduler,

        scheduled:

            this.scheduled.length,

        autoDismiss:

            this.timing.autoDismiss,

        dismissAfter:

            this.timing.dismissAfter

    };

};

/**
 * ------------------------------------------------------
 * Configure Timing
 * ------------------------------------------------------
 */

Notifications.configureTiming = function (

    options = {}

) {

    Object.assign(

        this.timing,

        options

    );

};

/**
 * ------------------------------------------------------
 * Clear Scheduled
 * ------------------------------------------------------
 */

Notifications.clearScheduled = function () {

    this.scheduled = [];

};
/**
 * ==========================================================
 * PART 2C
 * USER PREFERENCES & FILTERING
 * ==========================================================
 */

/**
 * ------------------------------------------------------
 * User Preferences
 * ------------------------------------------------------
 */

Notifications.preferences = {

    enabled: true,

    quietMode: false,

    allowedTypes: [

        "success",

        "info",

        "warning",

        "error",

        "system"

    ],

    allowedCategories: [

        "general",

        "system",

        "authentication",

        "account",

        "wallet",

        "subscription",

        "referral",

        "dashboard",

        "api",

        "security"

    ],

    minimumPriority: "low"

};

/**
 * ------------------------------------------------------
 * Preference Storage Key
 * ------------------------------------------------------
 */

Notifications.preferenceKey =

    "kuts_notification_preferences";

/**
 * ------------------------------------------------------
 * Save Preferences
 * ------------------------------------------------------
 */

Notifications.savePreferences = function () {

    localStorage.setItem(

        this.preferenceKey,

        JSON.stringify(

            this.preferences

        )

    );

};

/**
 * ------------------------------------------------------
 * Load Preferences
 * ------------------------------------------------------
 */

Notifications.loadPreferences = function () {

    const saved =

        localStorage.getItem(

            this.preferenceKey

        );

    if (!saved) {

        return;

    }

    try {

        Object.assign(

            this.preferences,

            JSON.parse(saved)

        );

    }

    catch (error) {

        this.warn(

            "Unable to load preferences."

        );

    }

};

/**
 * ------------------------------------------------------
 * Quiet Mode
 * ------------------------------------------------------
 */

Notifications.setQuietMode = function (

    enabled

) {

    this.preferences.quietMode =

        !!enabled;

    this.savePreferences();

};

/**
 * ------------------------------------------------------
 * Enable Notifications
 * ------------------------------------------------------
 */

Notifications.enable = function () {

    this.preferences.enabled = true;

    this.savePreferences();

};

/**
 * ------------------------------------------------------
 * Disable Notifications
 * ------------------------------------------------------
 */

Notifications.disable = function () {

    this.preferences.enabled = false;

    this.savePreferences();

};

/**
 * ------------------------------------------------------
 * Allow Type
 * ------------------------------------------------------
 */

Notifications.allowType = function (

    type

) {

    if (

        !this.preferences.allowedTypes.includes(type)

    ) {

        this.preferences.allowedTypes.push(type);

        this.savePreferences();

    }

};

/**
 * ------------------------------------------------------
 * Block Type
 * ------------------------------------------------------
 */

Notifications.blockType = function (

    type

) {

    this.preferences.allowedTypes =

        this.preferences.allowedTypes.filter(

            item => item !== type

        );

    this.savePreferences();

};

/**
 * ------------------------------------------------------
 * Allow Category
 * ------------------------------------------------------
 */

Notifications.allowCategory = function (

    category

) {

    if (

        !this.preferences.allowedCategories.includes(category)

    ) {

        this.preferences.allowedCategories.push(category);

        this.savePreferences();

    }

};

/**
 * ------------------------------------------------------
 * Block Category
 * ------------------------------------------------------
 */

Notifications.blockCategory = function (

    category

) {

    this.preferences.allowedCategories =

        this.preferences.allowedCategories.filter(

            item => item !== category

        );

    this.savePreferences();

};

/**
 * ------------------------------------------------------
 * Search Notifications
 * ------------------------------------------------------
 */

Notifications.search = function (

    keyword

) {

    keyword = keyword.toLowerCase();

    return this.notifications.filter(

        notification =>

            notification.title

                .toLowerCase()

                .includes(keyword)

            ||

            notification.message

                .toLowerCase()

                .includes(keyword)

    );

};

/**
 * ------------------------------------------------------
 * Filter Notifications
 * ------------------------------------------------------
 */

Notifications.filter = function (

    options = {}

) {

    return this.notifications.filter(

        notification => {

            if (

                options.type &&

                notification.type !==

                options.type

            ) {

                return false;

            }

            if (

                options.category &&

                notification.category !==

                options.category

            ) {

                return false;

            }

            if (

                options.read !== undefined &&

                notification.read !==

                options.read

            ) {

                return false;

            }

            return true;

        }

    );

};

/**
 * ------------------------------------------------------
 * Preferences
 * ------------------------------------------------------
 */

Notifications.getPreferences = function () {

    return structuredClone(

        this.preferences

    );

};

/**
 * ------------------------------------------------------
 * Reset Preferences
 * ------------------------------------------------------
 */

Notifications.resetPreferences = function () {

    localStorage.removeItem(

        this.preferenceKey

    );

};
/**
 * ==========================================================
 * PART 3
 * INTEGRATIONS & EVENT HANDLING
 * ==========================================================
 */

/**
 * ------------------------------------------------------
 * Event Registry
 * ------------------------------------------------------
 */

Notifications.events = new Map();

/**
 * ------------------------------------------------------
 * Register Event Listener
 * ------------------------------------------------------
 */

Notifications.on = function (

    eventName,

    handler

) {

    if (

        typeof eventName !== "string" ||

        typeof handler !== "function"

    ) {

        return false;

    }

    if (!this.events.has(eventName)) {

        this.events.set(

            eventName,

            new Set()

        );

    }

    this.events

        .get(eventName)

        .add(handler);

    return true;

};

/**
 * ------------------------------------------------------
 * Remove Event Listener
 * ------------------------------------------------------
 */

Notifications.off = function (

    eventName,

    handler

) {

    const listeners =

        this.events.get(eventName);

    if (!listeners) {

        return false;

    }

    const removed =

        listeners.delete(handler);

    if (listeners.size === 0) {

        this.events.delete(eventName);

    }

    return removed;

};

/**
 * ------------------------------------------------------
 * Emit Event
 * ------------------------------------------------------
 */

Notifications.emit = function (

    eventName,

    data = {}

) {

    const listeners =

        this.events.get(eventName);

    if (!listeners) {

        return;

    }

    listeners.forEach(handler => {

        try {

            handler(data);

        }

        catch (error) {

            this.errorLog(

                `Event handler failed: ${eventName}`

            );

        }

    });

};

/**
 * ------------------------------------------------------
 * Create Integration Notification
 * ------------------------------------------------------
 */

Notifications.integrationNotify = function (

    source,

    title,

    message,

    options = {}

) {

    const notification = this.notify({

        title,

        message,

        type:

            options.type ||

            this.types.INFO,

        priority:

            options.priority ||

            this.priorities.NORMAL,

        category:

            options.category ||

            this.categories.GENERAL,

        data: {

            source,

            ...(options.data || {})

        }

    });

    if (notification) {

        this.emit(

            "notification.created",

            notification

        );

    }

    return notification;

};

/**
 * ------------------------------------------------------
 * Authentication Integration
 * ------------------------------------------------------
 */

Notifications.connectAuth = function () {

    if (

        typeof Auth === "undefined"

    ) {

        return false;

    }

    if (

        typeof Auth.on === "function"

    ) {

        Auth.on(

            "login",

            data => {

                this.integrationNotify(

                    "auth",

                    "Login Successful",

                    "You have successfully signed in.",

                    {

                        type:

                            this.types.SUCCESS,

                        category:

                            this.categories.AUTH,

                        data

                    }

                );

            }

        );

        Auth.on(

            "logout",

            data => {

                this.integrationNotify(

                    "auth",

                    "Signed Out",

                    "You have been signed out.",

                    {

                        type:

                            this.types.INFO,

                        category:

                            this.categories.AUTH,

                        data

                    }

                );

            }

        );

    }

    return true;

};

/**
 * ------------------------------------------------------
 * API Integration
 * ------------------------------------------------------
 */

Notifications.connectAPI = function () {

    if (

        typeof API === "undefined"

    ) {

        return false;

    }

    if (

        typeof API.on === "function"

    ) {

        API.on(

            "error",

            data => {

                this.integrationNotify(

                    "api",

                    "API Error",

                    "A network request could not be completed.",

                    {

                        type:

                            this.types.ERROR,

                        priority:

                            this.priorities.HIGH,

                        category:

                            this.categories.API,

                        data

                    }

                );

            }

        );

    }

    return true;

};

/**
 * ------------------------------------------------------
 * Dashboard Integration
 * ------------------------------------------------------
 */

Notifications.connectDashboard = function () {

    if (

        typeof Dashboard === "undefined"

    ) {

        return false;

    }

    if (

        typeof Dashboard.on === "function"

    ) {

        Dashboard.on(

            "alert",

            data => {

                this.integrationNotify(

                    "dashboard",

                    data.title ||

                        "Dashboard Alert",

                    data.message ||

                        "A dashboard alert was triggered.",

                    {

                        type:

                            data.type ||

                            this.types.WARNING,

                        category:

                            this.categories.DASHBOARD,

                        data

                    }

                );

            }

        );

    }

    return true;

};

/**
 * ------------------------------------------------------
 * Analytics Integration
 * ------------------------------------------------------
 */

Notifications.connectAnalytics = function () {

    if (

        typeof Analytics === "undefined"

    ) {

        return false;

    }

    this.on(

        "notification.created",

        notification => {

            if (

                typeof Analytics.track ===

                "function"

            ) {

                Analytics.track(

                    "notification.created",

                    {

                        id:

                            notification.id,

                        type:

                            notification.type,

                        priority:

                            notification.priority,

                        category:

                            notification.category

                    }

                );

            }

        }

    );

    return true;

};

/**
 * ------------------------------------------------------
 * UI Integration
 * ------------------------------------------------------
 */

Notifications.connectUI = function () {

    if (

        typeof UI === "undefined"

    ) {

        return false;

    }

    if (

        typeof UI.showNotification ===

        "function"

    ) {

        this.on(

            "notification.created",

            notification => {

                UI.showNotification(

                    notification

                );

            }

        );

    }

    return true;

};

/**
 * ------------------------------------------------------
 * Connect All Integrations
 * ------------------------------------------------------
 */

Notifications.connectIntegrations = function () {

    return {

        auth:

            this.connectAuth(),

        api:

            this.connectAPI(),

        dashboard:

            this.connectDashboard(),

        analytics:

            this.connectAnalytics(),

        ui:

            this.connectUI()

    };

};

/**
 * ------------------------------------------------------
 * Integration Status
 * ------------------------------------------------------
 */

Notifications.getIntegrationStatus = function () {

    return {

        auth:

            typeof Auth !== "undefined",

        api:

            typeof API !== "undefined",

        dashboard:

            typeof Dashboard !== "undefined",

        analytics:

            typeof Analytics !== "undefined",

        ui:

            typeof UI !== "undefined"

    };

};
/**
 * ==========================================================
 * PART 3A
 * PERSISTENCE • EXPORT • IMPORT
 * ==========================================================
 */

/**
 * ------------------------------------------------------
 * Export Notifications as JSON
 * ------------------------------------------------------
 */

Notifications.exportJSON = function () {

    return JSON.stringify({

        version: this.config.version,

        exportedAt:
            new Date().toISOString(),

        notifications:
            this.notifications,

        scheduled:
            this.scheduled,

        preferences:
            this.preferences,

        status:
            this.getStatus()

    }, null, 2);

};

/**
 * ------------------------------------------------------
 * Import Notifications from JSON
 * ------------------------------------------------------
 */

Notifications.importJSON = function (json) {

    try {

        const data = JSON.parse(json);

        if (
            !data ||
            typeof data !== "object"
        ) {

            return false;

        }

        if (
            Array.isArray(data.notifications)
        ) {

            this.notifications =
                data.notifications;

        }

        if (
            Array.isArray(data.scheduled)
        ) {

            this.scheduled =
                data.scheduled;

        }

        if (
            data.preferences &&
            typeof data.preferences === "object"
        ) {

            Object.assign(
                this.preferences,
                data.preferences
            );

        }

        this.status.total =
            this.notifications.length;

        this.status.unread =
            this.notifications.filter(
                notification =>
                    !notification.read
            ).length;

        this.save();

        this.savePreferences();

        this.emit(
            "notifications.imported",
            {
                count:
                    this.notifications.length
            }
        );

        return true;

    }

    catch (error) {

        this.errorLog(
            "Notification import failed."
        );

        return false;

    }

};

/**
 * ------------------------------------------------------
 * Export Notifications as CSV
 * ------------------------------------------------------
 */

Notifications.exportCSV = function () {

    const escapeCSV = value => {

        return `"${String(value ?? "")
            .replace(/"/g, '""')}"`;

    };

    const rows = [

        [

            "ID",

            "Title",

            "Message",

            "Type",

            "Priority",

            "Category",

            "Read",

            "Created At"

        ]

    ];

    this.notifications.forEach(
        notification => {

            rows.push([

                notification.id,

                notification.title,

                notification.message,

                notification.type,

                notification.priority,

                notification.category ||
                    this.categories.GENERAL,

                notification.read,

                notification.createdAt

            ]);

        }
    );

    return rows

        .map(row =>
            row.map(escapeCSV).join(",")
        )

        .join("\n");

};

/**
 * ------------------------------------------------------
 * Create Backup
 * ------------------------------------------------------
 */

Notifications.createBackup = function () {

    return {

        version:
            this.config.version,

        createdAt:
            new Date().toISOString(),

        notifications:
            structuredClone(
                this.notifications
            ),

        scheduled:
            structuredClone(
                this.scheduled
            ),

        preferences:
            structuredClone(
                this.preferences
            )

    };

};

/**
 * ------------------------------------------------------
 * Restore Backup
 * ------------------------------------------------------
 */

Notifications.restoreBackup = function (
    backup
) {

    if (
        !backup ||
        typeof backup !== "object"
    ) {

        return false;

    }

    if (
        Array.isArray(
            backup.notifications
        )
    ) {

        this.notifications =
            structuredClone(
                backup.notifications
            );

    }

    if (
        Array.isArray(
            backup.scheduled
        )
    ) {

        this.scheduled =
            structuredClone(
                backup.scheduled
            );

    }

    if (
        backup.preferences &&
        typeof backup.preferences === "object"
    ) {

        this.preferences =
            structuredClone(
                backup.preferences
            );

    }

    this.status.total =
        this.notifications.length;

    this.status.unread =
        this.notifications.filter(
            notification =>
                !notification.read
        ).length;

    this.save();

    this.savePreferences();

    this.emit(
        "notifications.restored",
        {
            count:
                this.notifications.length
        }
    );

    return true;

};

/**
 * ------------------------------------------------------
 * Download JSON
 * ------------------------------------------------------
 */

Notifications.downloadJSON = function (
    filename = "notifications.json"
) {

    const blob = new Blob(
        [this.exportJSON()],
        {
            type:
                "application/json"
        }
    );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

};

/**
 * ------------------------------------------------------
 * Download CSV
 * ------------------------------------------------------
 */

Notifications.downloadCSV = function (
    filename = "notifications.csv"
) {

    const blob = new Blob(
        [this.exportCSV()],
        {
            type:
                "text/csv;charset=utf-8"
        }
    );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

};

/**
 * ------------------------------------------------------
 * Persistence Information
 * ------------------------------------------------------
 */

Notifications.getPersistenceInfo = function () {

    return {

        storageKey:
            this.config.storageKey,

        notificationCount:
            this.notifications.length,

        scheduledCount:
            this.scheduled.length,

        unreadCount:
            this.status.unread,

        preferenceStorageKey:
            this.preferenceKey

    };

};
/**
 * ==========================================================
 * PART 3B
 * MONITORING • STATISTICS • DELIVERY REPORTS
 * ==========================================================
 */

/**
 * ------------------------------------------------------
 * Monitoring State
 * ------------------------------------------------------
 */

Notifications.monitoring = {

    enabled: true,

    created: 0,

    displayed: 0,

    read: 0,

    removed: 0,

    failed: 0,

    scheduled: 0,

    expired: 0,

    dismissed: 0,

    lastCreatedAt: null,

    lastDisplayedAt: null,

    lastErrorAt: null

};

/**
 * ------------------------------------------------------
 * Record Metric
 * ------------------------------------------------------
 */

Notifications.recordMetric = function (

    metric,

    amount = 1

) {

    if (!this.monitoring.enabled) {

        return;

    }

    if (

        typeof this.monitoring[metric] !==

        "number"

    ) {

        this.monitoring[metric] = 0;

    }

    this.monitoring[metric] += amount;

};

/**
 * ------------------------------------------------------
 * Record Notification Created
 * ------------------------------------------------------
 */

Notifications.recordCreated = function () {

    this.recordMetric("created");

    this.monitoring.lastCreatedAt =

        new Date().toISOString();

};

/**
 * ------------------------------------------------------
 * Record Notification Displayed
 * ------------------------------------------------------
 */

Notifications.recordDisplayed = function () {

    this.recordMetric("displayed");

    this.monitoring.lastDisplayedAt =

        new Date().toISOString();

};

/**
 * ------------------------------------------------------
 * Record Notification Read
 * ------------------------------------------------------
 */

Notifications.recordRead = function () {

    this.recordMetric("read");

};

/**
 * ------------------------------------------------------
 * Record Notification Removed
 * ------------------------------------------------------
 */

Notifications.recordRemoved = function () {

    this.recordMetric("removed");

};

/**
 * ------------------------------------------------------
 * Record Notification Failure
 * ------------------------------------------------------
 */

Notifications.recordFailure = function () {

    this.recordMetric("failed");

    this.monitoring.lastErrorAt =

        new Date().toISOString();

};

/**
 * ------------------------------------------------------
 * Record Scheduled Notification
 * ------------------------------------------------------
 */

Notifications.recordScheduled = function () {

    this.recordMetric("scheduled");

};

/**
 * ------------------------------------------------------
 * Record Expired Notification
 * ------------------------------------------------------
 */

Notifications.recordExpired = function () {

    this.recordMetric("expired");

};

/**
 * ------------------------------------------------------
 * Record Dismissed Notification
 * ------------------------------------------------------
 */

Notifications.recordDismissed = function () {

    this.recordMetric("dismissed");

};

/**
 * ------------------------------------------------------
 * Delivery Statistics
 * ------------------------------------------------------
 */

Notifications.getDeliveryStatistics = function () {

    const created =

        this.monitoring.created;

    const displayed =

        this.monitoring.displayed;

    const failed =

        this.monitoring.failed;

    const deliveryRate =

        created > 0

            ? (displayed / created) * 100

            : 0;

    const failureRate =

        created > 0

            ? (failed / created) * 100

            : 0;

    return {

        created,

        displayed,

        failed,

        deliveryRate,

        failureRate,

        pending:

            Math.max(

                created - displayed - failed,

                0

            )

    };

};

/**
 * ------------------------------------------------------
 * Notification Statistics
 * ------------------------------------------------------
 */

Notifications.getStatistics = function () {

    const byType = {};

    const byCategory = {};

    const byPriority = {};

    this.notifications.forEach(

        notification => {

            const type =

                notification.type ||

                this.types.INFO;

            const category =

                notification.category ||

                this.categories.GENERAL;

            const priority =

                notification.priority ||

                this.priorities.NORMAL;

            byType[type] =

                (byType[type] || 0) + 1;

            byCategory[category] =

                (byCategory[category] || 0) + 1;

            byPriority[priority] =

                (byPriority[priority] || 0) + 1;

        }

    );

    return {

        total:

            this.notifications.length,

        unread:

            this.status.unread,

        read:

            this.notifications.length -

            this.status.unread,

        byType,

        byCategory,

        byPriority

    };

};

/**
 * ------------------------------------------------------
 * Monitoring Report
 * ------------------------------------------------------
 */

Notifications.getMonitoringReport = function () {

    return {

        monitoring:

            structuredClone(

                this.monitoring

            ),

        delivery:

            this.getDeliveryStatistics(),

        statistics:

            this.getStatistics(),

        queue:

            this.getQueueStatus(),

        scheduler:

            this.getSchedulerStatus(),

        generatedAt:

            new Date().toISOString()

    };

};

/**
 * ------------------------------------------------------
 * Reset Monitoring
 * ------------------------------------------------------
 */

Notifications.resetMonitoring = function () {

    this.monitoring = {

        enabled:

            this.monitoring.enabled,

        created: 0,

        displayed: 0,

        read: 0,

        removed: 0,

        failed: 0,

        scheduled: 0,

        expired: 0,

        dismissed: 0,

        lastCreatedAt: null,

        lastDisplayedAt: null,

        lastErrorAt: null

    };

};

/**
 * ------------------------------------------------------
 * Enable Monitoring
 * ------------------------------------------------------
 */

Notifications.enableMonitoring = function () {

    this.monitoring.enabled = true;

};

/**
 * ------------------------------------------------------
 * Disable Monitoring
 * ------------------------------------------------------
 */

Notifications.disableMonitoring = function () {

    this.monitoring.enabled = false;

};

/**
 * ------------------------------------------------------
 * Delivery Health
 * ------------------------------------------------------
 */

Notifications.getDeliveryHealth = function () {

    const delivery =

        this.getDeliveryStatistics();

    if (delivery.created === 0) {

        return {

            status: "healthy",

            deliveryRate: 100,

            failureRate: 0

        };

    }

    if (

        delivery.failureRate >= 25

    ) {

        return {

            status: "critical",

            deliveryRate:

                delivery.deliveryRate,

            failureRate:

                delivery.failureRate

        };

    }

    if (

        delivery.failureRate >= 10

    ) {

        return {

            status: "warning",

            deliveryRate:

                delivery.deliveryRate,

            failureRate:

                delivery.failureRate

        };

    }

    return {

        status: "healthy",

        deliveryRate:

            delivery.deliveryRate,

        failureRate:

            delivery.failureRate

    };

};
/**
 * ==========================================================
 * PART 3C
 * DIAGNOSTICS • HEALTH REPORT • FINAL INITIALIZATION
 * ==========================================================
 */

/**
 * ------------------------------------------------------
 * Runtime Information
 * ------------------------------------------------------
 */

Notifications.runtime = {

    initializedAt: null,

    uptimeStartedAt: Date.now(),

    lastHealthCheckAt: null

};

/**
 * ------------------------------------------------------
 * Get Uptime
 * ------------------------------------------------------
 */

Notifications.getUptime = function () {

    return Date.now() -

        this.runtime.uptimeStartedAt;

};

/**
 * ------------------------------------------------------
 * Configuration Report
 * ------------------------------------------------------
 */

Notifications.getConfigurationReport = function () {

    return {

        version:
            this.config.version,

        debug:
            this.config.debug,

        enabled:
            this.status.enabled,

        maxNotifications:
            this.config.maxNotifications,

        autoSave:
            this.config.autoSave,

        storageKey:
            this.config.storageKey,

        timing:
            structuredClone(
                this.timing
            ),

        preferences:
            this.getPreferences()

    };

};

/**
 * ------------------------------------------------------
 * Health Check
 * ------------------------------------------------------
 */

Notifications.healthCheck = function () {

    const issues = [];

    if (!this.status.initialized) {

        issues.push(
            "Notification system is not initialized."
        );

    }

    if (!this.status.enabled) {

        issues.push(
            "Notification system is disabled."
        );

    }

    if (
        this.notifications.length >
        this.config.maxNotifications
    ) {

        issues.push(
            "Notification storage exceeds configured limit."
        );

    }

    const deliveryHealth =
        this.getDeliveryHealth();

    if (
        deliveryHealth.status === "critical"
    ) {

        issues.push(
            "Notification delivery failure rate is critical."
        );

    }

    this.runtime.lastHealthCheckAt =
        new Date().toISOString();

    return {

        healthy:
            issues.length === 0,

        status:
            issues.length === 0
                ? "healthy"
                : "warning",

        issues,

        delivery:
            deliveryHealth,

        queue:
            this.getQueueStatus(),

        scheduler:
            this.getSchedulerStatus(),

        checkedAt:
            this.runtime.lastHealthCheckAt

    };

};

/**
 * ------------------------------------------------------
 * Complete Diagnostic Report
 * ------------------------------------------------------
 */

Notifications.getDiagnostics = function () {

    return {

        configuration:
            this.getConfigurationReport(),

        status:
            this.getStatus(),

        statistics:
            this.getStatistics(),

        delivery:
            this.getDeliveryStatistics(),

        monitoring:
            structuredClone(
                this.monitoring
            ),

        queue:
            this.getQueueStatus(),

        scheduler:
            this.getSchedulerStatus(),

        integrations:
            this.getIntegrationStatus(),

        persistence:
            this.getPersistenceInfo(),

        health:
            this.healthCheck(),

        runtime:
            structuredClone(
                this.runtime
            )

    };

};

/**
 * ------------------------------------------------------
 * Print Diagnostics
 * ------------------------------------------------------
 */

Notifications.printDiagnostics = function () {

    const diagnostics =
        this.getDiagnostics();

    console.group(
        "KUTS Notifications Diagnostics"
    );

    console.log(
        "Configuration:",
        diagnostics.configuration
    );

    console.log(
        "Status:",
        diagnostics.status
    );

    console.log(
        "Statistics:",
        diagnostics.statistics
    );

    console.log(
        "Delivery:",
        diagnostics.delivery
    );

    console.log(
        "Monitoring:",
        diagnostics.monitoring
    );

    console.log(
        "Queue:",
        diagnostics.queue
    );

    console.log(
        "Scheduler:",
        diagnostics.scheduler
    );

    console.log(
        "Integrations:",
        diagnostics.integrations
    );

    console.log(
        "Persistence:",
        diagnostics.persistence
    );

    console.log(
        "Health:",
        diagnostics.health
    );

    console.groupEnd();

};

/**
 * ------------------------------------------------------
 * Runtime Reset
 * ------------------------------------------------------
 */

Notifications.resetRuntime = function () {

    this.queue = [];

    this.active = null;

    this.scheduled = [];

    this.resetMonitoring();

    this.runtime = {

        initializedAt: null,

        uptimeStartedAt: Date.now(),

        lastHealthCheckAt: null

    };

};

/**
 * ------------------------------------------------------
 * Full Reset
 * ------------------------------------------------------
 */

Notifications.resetAll = function () {

    this.stopScheduler();

    this.notifications = [];

    this.queue = [];

    this.active = null;

    this.scheduled = [];

    this.resetMonitoring();

    this.resetPreferences();

    localStorage.removeItem(
        this.config.storageKey
    );

    this.status = {

        initialized: false,

        enabled: true,

        unread: 0,

        total: 0

    };

    this.runtime = {

        initializedAt: null,

        uptimeStartedAt: Date.now(),

        lastHealthCheckAt: null

    };

};

/**
 * ------------------------------------------------------
 * Final Runtime Initialization
 * ------------------------------------------------------
 */

Notifications.initializeRuntime = function () {

    if (
        this.runtime.initializedAt
    ) {

        return;

    }

    this.runtime.initializedAt =
        new Date().toISOString();

    this.runtime.uptimeStartedAt =
        Date.now();

    this.loadPreferences();

    this.startScheduler();

    this.connectIntegrations();

    this.emit(
        "notifications.initialized",
        {
            timestamp:
                this.runtime.initializedAt
        }
    );

    this.log(
        "Notification runtime initialized."
    );

};

/**
 * ------------------------------------------------------
 * Final Initialization
 * ------------------------------------------------------
 */

Notifications.finalInitialize = function () {

    if (
        !this.status.initialized
    ) {

        this.initialize();

    }

    this.initializeRuntime();

    return this.getStatus();

};

/**
 * ------------------------------------------------------
 * Automatic Initialization
 * ------------------------------------------------------
 */

if (
    typeof document !== "undefined"
) {

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            () => {

                Notifications.finalInitialize();

            },
            {
                once: true
            }
        );

    }
    else {

        Notifications.finalInitialize();

    }

}
