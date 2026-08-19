"use strict";

/**
 * ==========================================================
 * KUTS ECOSYSTEM
 * ANALYTICS ENGINE
 * ----------------------------------------------------------
 * Version : 1.0.0
 * Purpose : Central analytics and metrics manager
 * ==========================================================
 */

class Analytics {

    /**
     * ------------------------------------------------------
     * Configuration
     * ------------------------------------------------------
     */

    static config = {

        version: "1.0.0",

        debug: true,

        maxEvents: 10000,

        autoSave: true,

        storageKey: "kuts_analytics"

    };

    /**
     * ------------------------------------------------------
     * Runtime Status
     * ------------------------------------------------------
     */

    static status = {

        initialized: false,

        enabled: true,

        sessionId: null,

        sessionStarted: null,

        totalEvents: 0

    };

    /**
     * ------------------------------------------------------
     * Event Storage
     * ------------------------------------------------------
     */

    static events = [];

    /**
     * ------------------------------------------------------
     * Counters
     * ------------------------------------------------------
     */

    static counters = new Map();

    /**
     * ------------------------------------------------------
     * Timers
     * ------------------------------------------------------
     */

    static timers = new Map();

    /**
     * ------------------------------------------------------
     * Initialize Analytics
     * ------------------------------------------------------
     */

    static initialize() {

        if (this.status.initialized) {

            return;

        }

        this.log("Initializing Analytics...");

        this.createSession();

        this.load();

        this.status.initialized = true;

        this.log("Analytics initialized.");

    }

    /**
     * ------------------------------------------------------
     * Create Session
     * ------------------------------------------------------
     */

    static createSession() {

        this.status.sessionId =

            crypto.randomUUID();

        this.status.sessionStarted =

            new Date().toISOString();

    }

    /**
     * ------------------------------------------------------
     * Track Event
     * ------------------------------------------------------
     */

    static track(

        name,

        data = {}

    ) {

        if (!this.status.enabled) {

            return;

        }

        const event = {

            name,

            data,

            timestamp:

                new Date().toISOString(),

            session:

                this.status.sessionId

        };

        this.events.push(event);

        this.status.totalEvents++;

        if (

            this.events.length >

            this.config.maxEvents

        ) {

            this.events.shift();

        }

        if (this.config.autoSave) {

            this.save();

        }

        this.log(`Tracked: ${name}`);

    }

    /**
     * ------------------------------------------------------
     * Increment Counter
     * ------------------------------------------------------
     */

    static increment(

        name,

        amount = 1

    ) {

        const value =

            this.counters.get(name) || 0;

        this.counters.set(

            name,

            value + amount

        );

    }

    /**
     * ------------------------------------------------------
     * Get Counter
     * ------------------------------------------------------
     */

    static getCounter(name) {

        return this.counters.get(name) || 0;

    }

    /**
     * ------------------------------------------------------
     * Start Timer
     * ------------------------------------------------------
     */

    static startTimer(name) {

        this.timers.set(

            name,

            performance.now()

        );

    }

    /**
     * ------------------------------------------------------
     * Stop Timer
     * ------------------------------------------------------
     */

    static stopTimer(name) {

        if (!this.timers.has(name)) {

            return null;

        }

        const elapsed =

            performance.now() -

            this.timers.get(name);

        this.timers.delete(name);

        return elapsed;

    }

    /**
     * ------------------------------------------------------
     * Save Analytics
     * ------------------------------------------------------
     */

    static save() {

        try {

            localStorage.setItem(

                this.config.storageKey,

                JSON.stringify(this.events)

            );

        }

        catch (error) {

            this.warn(

                "Unable to save analytics."

            );

        }

    }

    /**
     * ------------------------------------------------------
     * Load Analytics
     * ------------------------------------------------------
     */

    static load() {

        try {

            const data =

                localStorage.getItem(

                    this.config.storageKey

                );

            if (data) {

                this.events =

                    JSON.parse(data);

            }

        }

        catch (error) {

            this.warn(

                "Unable to load analytics."

            );

        }

    }

    /**
     * ------------------------------------------------------
     * Clear Analytics
     * ------------------------------------------------------
     */

    static clear() {

        this.events = [];

        this.counters.clear();

        this.timers.clear();

        this.status.totalEvents = 0;

        localStorage.removeItem(

            this.config.storageKey

        );

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

            "[Analytics]",

            message

        );

    }

    static warn(message) {

        console.warn(

            "[Analytics]",

            message

        );

    }

    static error(message) {

        console.error(

            "[Analytics]",

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
 * USER ACTIVITY & SESSION ANALYTICS
 * ==========================================================
 */

/**
 * ------------------------------------------------------
 * Page Statistics
 * ------------------------------------------------------
 */

Analytics.pages = new Map();

/**
 * ------------------------------------------------------
 * Current Page
 * ------------------------------------------------------
 */

Analytics.currentPage = null;

/**
 * ------------------------------------------------------
 * Track Page View
 * ------------------------------------------------------
 */

Analytics.trackPage = function (page = window.location.pathname) {

    this.currentPage = page;

    const count = this.pages.get(page) || 0;

    this.pages.set(page, count + 1);

    this.track("page.view", {

        page,

        views: count + 1

    });

};

/**
 * ------------------------------------------------------
 * Track User Action
 * ------------------------------------------------------
 */

Analytics.trackAction = function (

    action,

    target = "",

    metadata = {}

) {

    this.track("user.action", {

        action,

        target,

        ...metadata

    });

};

/**
 * ------------------------------------------------------
 * Track Navigation
 * ------------------------------------------------------
 */

Analytics.trackNavigation = function (

    from,

    to

) {

    this.track("navigation", {

        from,

        to

    });

};

/**
 * ------------------------------------------------------
 * Track Error
 * ------------------------------------------------------
 */

Analytics.trackError = function (

    message,

    source = "application"

) {

    this.track("error", {

        message,

        source

    });

};

/**
 * ------------------------------------------------------
 * Session Duration
 * ------------------------------------------------------
 */

Analytics.getSessionDuration = function () {

    if (!this.status.sessionStarted) {

        return 0;

    }

    return (

        Date.now() -

        new Date(

            this.status.sessionStarted

        ).getTime()

    );

};

/**
 * ------------------------------------------------------
 * Page Views
 * ------------------------------------------------------
 */

Analytics.getPageViews = function (page = null) {

    if (page) {

        return this.pages.get(page) || 0;

    }

    const result = {};

    this.pages.forEach((count, key) => {

        result[key] = count;

    });

    return result;

};

/**
 * ------------------------------------------------------
 * Filter Events
 * ------------------------------------------------------
 */

Analytics.getEventsByName = function (name) {

    return this.events.filter(event =>

        event.name === name

    );

};

/**
 * ------------------------------------------------------
 * Events Between Dates
 * ------------------------------------------------------
 */

Analytics.getEventsBetween = function (

    start,

    end

) {

    const startDate = new Date(start);

    const endDate = new Date(end);

    return this.events.filter(event => {

        const time = new Date(event.timestamp);

        return (

            time >= startDate &&

            time <= endDate

        );

    });

};

/**
 * ------------------------------------------------------
 * Automatic Click Tracking
 * ------------------------------------------------------
 */

Analytics.enableClickTracking = function () {

    document.addEventListener(

        "click",

        event => {

            const element = event.target;

            this.trackAction(

                "click",

                element.id ||

                element.tagName.toLowerCase()

            );

        }

    );

};

/**
 * ------------------------------------------------------
 * Automatic Form Tracking
 * ------------------------------------------------------
 */

Analytics.enableFormTracking = function () {

    document.addEventListener(

        "submit",

        event => {

            const form = event.target;

            this.trackAction(

                "form.submit",

                form.id || "form"

            );

        }

    );

};

/**
 * ------------------------------------------------------
 * Automatic Page Tracking
 * ------------------------------------------------------
 */

Analytics.enablePageTracking = function () {

    this.trackPage();

};

/**
 * ------------------------------------------------------
 * Browser Event Tracking
 * ------------------------------------------------------
 */

Analytics.registerBrowserEvents = function () {

    window.addEventListener(

        "online",

        () => {

            this.track(

                "browser.online"

            );

        }

    );

    window.addEventListener(

        "offline",

        () => {

            this.track(

                "browser.offline"

            );

        }

    );

    document.addEventListener(

        "visibilitychange",

        () => {

            this.track(

                "page.visibility",

                {

                    hidden:

                        document.hidden

                }

            );

        }

    );

};

/**
 * ------------------------------------------------------
 * Initialize Activity Tracking
 * ------------------------------------------------------
 */

Analytics.initializeTracking = function () {

    this.enablePageTracking();

    this.enableClickTracking();

    this.enableFormTracking();

    this.registerBrowserEvents();

    this.log(

        "User activity tracking initialized."

    );

};
/**
 * ==========================================================
 * PART 2A
 * PERFORMANCE METRICS & TIMING
 * ==========================================================
 */

/**
 * ------------------------------------------------------
 * Performance Statistics
 * ------------------------------------------------------
 */

Analytics.performance = {

    operations: new Map(),

    apiRequests: [],

    slowOperations: [],

    threshold: 1000

};

/**
 * ------------------------------------------------------
 * Begin Operation
 * ------------------------------------------------------
 */

Analytics.beginOperation = function (name) {

    this.performance.operations.set(

        name,

        performance.now()

    );

};

/**
 * ------------------------------------------------------
 * End Operation
 * ------------------------------------------------------
 */

Analytics.endOperation = function (name) {

    if (

        !this.performance.operations.has(name)

    ) {

        return null;

    }

    const started =

        this.performance.operations.get(name);

    const duration =

        performance.now() - started;

    this.performance.operations.delete(name);

    this.track(

        "performance.operation",

        {

            name,

            duration

        }

    );

    if (

        duration >

        this.performance.threshold

    ) {

        this.performance.slowOperations.push({

            name,

            duration,

            timestamp: new Date().toISOString()

        });

    }

    return duration;

};

/**
 * ------------------------------------------------------
 * Record API Request
 * ------------------------------------------------------
 */

Analytics.recordApiRequest = function (

    endpoint,

    method,

    duration,

    success = true

) {

    const request = {

        endpoint,

        method,

        duration,

        success,

        timestamp: new Date().toISOString()

    };

    this.performance.apiRequests.push(request);

    this.track(

        "performance.api",

        request

    );

};

/**
 * ------------------------------------------------------
 * Average API Response Time
 * ------------------------------------------------------
 */

Analytics.getAverageApiTime = function () {

    const requests =

        this.performance.apiRequests;

    if (requests.length === 0) {

        return 0;

    }

    const total = requests.reduce(

        (sum, request) =>

            sum + request.duration,

        0

    );

    return total / requests.length;

};

/**
 * ------------------------------------------------------
 * Slow Operations
 * ------------------------------------------------------
 */

Analytics.getSlowOperations = function () {

    return [

        ...this.performance.slowOperations

    ];

};

/**
 * ------------------------------------------------------
 * Memory Usage
 * ------------------------------------------------------
 */

Analytics.getMemoryUsage = function () {

    if (

        performance.memory

    ) {

        return {

            used:

                performance.memory.usedJSHeapSize,

            total:

                performance.memory.totalJSHeapSize,

            limit:

                performance.memory.jsHeapSizeLimit

        };

    }

    return null;

};

/**
 * ------------------------------------------------------
 * Navigation Timing
 * ------------------------------------------------------
 */

Analytics.getNavigationTiming = function () {

    const entries =

        performance.getEntriesByType(

            "navigation"

        );

    if (

        entries.length === 0

    ) {

        return null;

    }

    const nav = entries[0];

    return {

        domComplete:

            nav.domComplete,

        loadEvent:

            nav.loadEventEnd,

        responseTime:

            nav.responseEnd -

            nav.requestStart,

        domInteractive:

            nav.domInteractive

    };

};

/**
 * ------------------------------------------------------
 * Performance Summary
 * ------------------------------------------------------
 */

Analytics.getPerformanceSummary = function () {

    return {

        averageApiTime:

            this.getAverageApiTime(),

        apiRequests:

            this.performance.apiRequests.length,

        slowOperations:

            this.performance.slowOperations.length,

        memory:

            this.getMemoryUsage(),

        navigation:

            this.getNavigationTiming()

    };

};

/**
 * ------------------------------------------------------
 * Reset Performance Statistics
 * ------------------------------------------------------
 */

Analytics.resetPerformance = function () {

    this.performance.operations.clear();

    this.performance.apiRequests = [];

    this.performance.slowOperations = [];

};
/**
 * ==========================================================
 * PART 2B
 * BUSINESS METRICS & KPI TRACKING
 * ==========================================================
 */

/**
 * ------------------------------------------------------
 * Business Metrics
 * ------------------------------------------------------
 */

Analytics.metrics = {

    registrations: 0,

    logins: 0,

    subscriptions: 0,

    walletDeposits: 0,

    walletWithdrawals: 0,

    referralRegistrations: 0,

    revenue: 0,

    custom: new Map()

};

/**
 * ------------------------------------------------------
 * Increment Metric
 * ------------------------------------------------------
 */

Analytics.incrementMetric = function (

    name,

    amount = 1

) {

    if (

        Object.prototype.hasOwnProperty.call(

            this.metrics,

            name

        ) &&

        typeof this.metrics[name] === "number"

    ) {

        this.metrics[name] += amount;

    }

    else {

        const value =

            this.metrics.custom.get(name) || 0;

        this.metrics.custom.set(

            name,

            value + amount

        );

    }

    this.track("metric.increment", {

        metric: name,

        amount

    });

};

/**
 * ------------------------------------------------------
 * Set Metric
 * ------------------------------------------------------
 */

Analytics.setMetric = function (

    name,

    value

) {

    if (

        Object.prototype.hasOwnProperty.call(

            this.metrics,

            name

        ) &&

        typeof this.metrics[name] === "number"

    ) {

        this.metrics[name] = value;

    }

    else {

        this.metrics.custom.set(

            name,

            value

        );

    }

};

/**
 * ------------------------------------------------------
 * Get Metric
 * ------------------------------------------------------
 */

Analytics.getMetric = function (name) {

    if (

        Object.prototype.hasOwnProperty.call(

            this.metrics,

            name

        ) &&

        typeof this.metrics[name] === "number"

    ) {

        return this.metrics[name];

    }

    return this.metrics.custom.get(name) || 0;

};

/**
 * ------------------------------------------------------
 * Record Revenue
 * ------------------------------------------------------
 */

Analytics.recordRevenue = function (

    amount

) {

    this.metrics.revenue += Number(amount);

    this.track("business.revenue", {

        amount

    });

};

/**
 * ------------------------------------------------------
 * Record Registration
 * ------------------------------------------------------
 */

Analytics.recordRegistration = function () {

    this.incrementMetric(

        "registrations"

    );

};

/**
 * ------------------------------------------------------
 * Record Login
 * ------------------------------------------------------
 */

Analytics.recordLogin = function () {

    this.incrementMetric(

        "logins"

    );

};

/**
 * ------------------------------------------------------
 * Record Subscription
 * ------------------------------------------------------
 */

Analytics.recordSubscription = function () {

    this.incrementMetric(

        "subscriptions"

    );

};

/**
 * ------------------------------------------------------
 * Record Wallet Deposit
 * ------------------------------------------------------
 */

Analytics.recordDeposit = function (

    amount = 0

) {

    this.incrementMetric(

        "walletDeposits"

    );

    this.recordRevenue(amount);

};

/**
 * ------------------------------------------------------
 * Record Wallet Withdrawal
 * ------------------------------------------------------
 */

Analytics.recordWithdrawal = function () {

    this.incrementMetric(

        "walletWithdrawals"

    );

};

/**
 * ------------------------------------------------------
 * Record Referral Registration
 * ------------------------------------------------------
 */

Analytics.recordReferral = function () {

    this.incrementMetric(

        "referralRegistrations"

    );

};

/**
 * ------------------------------------------------------
 * KPI Summary
 * ------------------------------------------------------
 */

Analytics.getKPIs = function () {

    return {

        registrations:

            this.metrics.registrations,

        logins:

            this.metrics.logins,

        subscriptions:

            this.metrics.subscriptions,

        walletDeposits:

            this.metrics.walletDeposits,

        walletWithdrawals:

            this.metrics.walletWithdrawals,

        referrals:

            this.metrics.referralRegistrations,

        revenue:

            this.metrics.revenue

    };

};

/**
 * ------------------------------------------------------
 * Export Business Metrics
 * ------------------------------------------------------
 */

Analytics.exportMetrics = function () {

    return {

        ...this.getKPIs(),

        custom:

            Object.fromEntries(

                this.metrics.custom

            )

    };

};

/**
 * ------------------------------------------------------
 * Reset Business Metrics
 * ------------------------------------------------------
 */

Analytics.resetMetrics = function () {

    this.metrics.registrations = 0;

    this.metrics.logins = 0;

    this.metrics.subscriptions = 0;

    this.metrics.walletDeposits = 0;

    this.metrics.walletWithdrawals = 0;

    this.metrics.referralRegistrations = 0;

    this.metrics.revenue = 0;

    this.metrics.custom.clear();

};
/**
 * ==========================================================
 * PART 2C
 * DATA AGGREGATION & REPORTING
 * ==========================================================
 */

/**
 * ------------------------------------------------------
 * Report Cache
 * ------------------------------------------------------
 */

Analytics.reports = [];

/**
 * ------------------------------------------------------
 * Generate Summary
 * ------------------------------------------------------
 */

Analytics.generateSummary = function () {

    return {

        sessionId:
            this.status.sessionId,

        sessionStarted:
            this.status.sessionStarted,

        sessionDuration:
            this.getSessionDuration(),

        totalEvents:
            this.status.totalEvents,

        totalPages:
            this.pages.size,

        totalCounters:
            this.counters.size,

        totalMetrics:
            this.metrics.custom.size +

            Object.keys(this.getKPIs()).length

    };

};

/**
 * ------------------------------------------------------
 * Generate Report
 * ------------------------------------------------------
 */

Analytics.generateReport = function (

    title = "Analytics Report"

) {

    const report = {

        title,

        createdAt:

            new Date().toISOString(),

        summary:

            this.generateSummary(),

        kpis:

            this.getKPIs(),

        performance:

            this.getPerformanceSummary(),

        events:

            this.events.length,

        pageViews:

            this.getPageViews()

    };

    this.reports.push(report);

    return report;

};

/**
 * ------------------------------------------------------
 * List Reports
 * ------------------------------------------------------
 */

Analytics.getReports = function () {

    return [...this.reports];

};

/**
 * ------------------------------------------------------
 * Latest Report
 * ------------------------------------------------------
 */

Analytics.getLatestReport = function () {

    if (

        this.reports.length === 0

    ) {

        return null;

    }

    return this.reports[

        this.reports.length - 1

    ];

};

/**
 * ------------------------------------------------------
 * Daily Event Summary
 * ------------------------------------------------------
 */

Analytics.getDailySummary = function () {

    const summary = {};

    this.events.forEach(event => {

        const day =

            event.timestamp.substring(0, 10);

        summary[day] =

            (summary[day] || 0) + 1;

    });

    return summary;

};

/**
 * ------------------------------------------------------
 * Event Frequency
 * ------------------------------------------------------
 */

Analytics.getEventFrequency = function () {

    const frequency = {};

    this.events.forEach(event => {

        frequency[event.name] =

            (frequency[event.name] || 0) + 1;

    });

    return frequency;

};

/**
 * ------------------------------------------------------
 * Most Frequent Event
 * ------------------------------------------------------
 */

Analytics.getTopEvent = function () {

    const frequency =

        this.getEventFrequency();

    let top = null;

    let count = 0;

    Object.entries(frequency).forEach(

        ([name, value]) => {

            if (value > count) {

                top = name;

                count = value;

            }

        }

    );

    return {

        name: top,

        count

    };

};

/**
 * ------------------------------------------------------
 * Export Report
 * ------------------------------------------------------
 */

Analytics.exportReport = function () {

    return {

        generated:

            new Date().toISOString(),

        summary:

            this.generateSummary(),

        report:

            this.generateReport(),

        events:

            [...this.events],

        metrics:

            this.exportMetrics()

    };

};

/**
 * ------------------------------------------------------
 * Clear Reports
 * ------------------------------------------------------
 */

Analytics.clearReports = function () {

    this.reports = [];

};

/**
 * ------------------------------------------------------
 * Analytics Overview
 * ------------------------------------------------------
 */

Analytics.getOverview = function () {

    return {

        summary:

            this.generateSummary(),

        performance:

            this.getPerformanceSummary(),

        topEvent:

            this.getTopEvent(),

        reports:

            this.reports.length

    };

};
/**
 * ==========================================================
 * PART 3
 * CHARTS, TRENDS & DASHBOARD INTEGRATION
 * ==========================================================
 */

/**
 * ------------------------------------------------------
 * Dashboard Data Cache
 * ------------------------------------------------------
 */

Analytics.dashboard = {

    lastUpdated: null,

    refreshCount: 0

};

/**
 * ------------------------------------------------------
 * Build Trend Data
 * ------------------------------------------------------
 */

Analytics.getTrendData = function () {

    const trends = {};

    this.events.forEach(event => {

        const day = event.timestamp.substring(0, 10);

        if (!trends[day]) {

            trends[day] = 0;

        }

        trends[day]++;

    });

    return Object.entries(trends).map(

        ([date, count]) => ({

            date,

            count

        })

    );

};

/**
 * ------------------------------------------------------
 * KPI Dashboard
 * ------------------------------------------------------
 */

Analytics.getDashboardKPIs = function () {

    return {

        events:

            this.status.totalEvents,

        registrations:

            this.metrics.registrations,

        logins:

            this.metrics.logins,

        subscriptions:

            this.metrics.subscriptions,

        revenue:

            this.metrics.revenue,

        apiRequests:

            this.performance.apiRequests.length,

        averageApiTime:

            this.getAverageApiTime()

    };

};

/**
 * ------------------------------------------------------
 * Activity Timeline
 * ------------------------------------------------------
 */

Analytics.getActivityTimeline = function (

    limit = 20

) {

    return this.events

        .slice(-limit)

        .map(event => ({

            time: event.timestamp,

            event: event.name,

            data: event.data

        }));

};

/**
 * ------------------------------------------------------
 * Chart Dataset
 * ------------------------------------------------------
 */

Analytics.getChartDataset = function () {

    const frequency =

        this.getEventFrequency();

    return Object.entries(frequency).map(

        ([label, value]) => ({

            label,

            value

        })

    );

};

/**
 * ------------------------------------------------------
 * Dashboard Snapshot
 * ------------------------------------------------------
 */

Analytics.getDashboardSnapshot = function () {

    return {

        generated:

            new Date().toISOString(),

        summary:

            this.generateSummary(),

        kpis:

            this.getDashboardKPIs(),

        trends:

            this.getTrendData(),

        chart:

            this.getChartDataset(),

        performance:

            this.getPerformanceSummary()

    };

};

/**
 * ------------------------------------------------------
 * Refresh Dashboard
 * ------------------------------------------------------
 */

Analytics.refreshDashboard = function () {

    this.dashboard.lastUpdated =

        new Date().toISOString();

    this.dashboard.refreshCount++;

    if (

        typeof Dashboard !== "undefined" &&

        typeof Dashboard.refreshAnalytics === "function"

    ) {

        Dashboard.refreshAnalytics(

            this.getDashboardSnapshot()

        );

    }

};

/**
 * ------------------------------------------------------
 * Auto Refresh
 * ------------------------------------------------------
 */

Analytics.startDashboardRefresh = function (

    interval = 60000

) {

    if (

        this.dashboard.intervalId

    ) {

        clearInterval(

            this.dashboard.intervalId

        );

    }

    this.dashboard.intervalId =

        setInterval(() => {

            this.refreshDashboard();

        }, interval);

};

/**
 * ------------------------------------------------------
 * Stop Auto Refresh
 * ------------------------------------------------------
 */

Analytics.stopDashboardRefresh = function () {

    if (

        this.dashboard.intervalId

    ) {

        clearInterval(

            this.dashboard.intervalId

        );

        this.dashboard.intervalId = null;

    }

};

/**
 * ------------------------------------------------------
 * Dashboard Status
 * ------------------------------------------------------
 */

Analytics.getDashboardStatus = function () {

    return {

        lastUpdated:

            this.dashboard.lastUpdated,

        refreshCount:

            this.dashboard.refreshCount,

        autoRefresh:

            !!this.dashboard.intervalId

    };

};
/**
 * ==========================================================
 * PART 3A
 * DATA EXPORT & IMPORT
 * ==========================================================
 */

/**
 * ------------------------------------------------------
 * Export Analytics (JSON)
 * ------------------------------------------------------
 */

Analytics.exportJSON = function () {

    return JSON.stringify({

        version: this.config.version,

        exportedAt: new Date().toISOString(),

        status: this.getStatus(),

        events: this.events,

        metrics: this.exportMetrics(),

        performance: this.getPerformanceSummary(),

        reports: this.getReports()

    }, null, 2);

};

/**
 * ------------------------------------------------------
 * Import Analytics (JSON)
 * ------------------------------------------------------
 */

Analytics.importJSON = function (json) {

    try {

        const data = JSON.parse(json);

        if (Array.isArray(data.events)) {

            this.events = data.events;

            this.status.totalEvents =

                this.events.length;

        }

        if (

            Array.isArray(data.reports)

        ) {

            this.reports = data.reports;

        }

        this.log("Analytics imported.");

        return true;

    }

    catch (error) {

        this.handleImportError(error);

        return false;

    }

};

/**
 * ------------------------------------------------------
 * Export CSV
 * ------------------------------------------------------
 */

Analytics.exportCSV = function () {

    const rows = [

        "Timestamp,Event,Session"

    ];

    this.events.forEach(event => {

        rows.push(

            `"${event.timestamp}","${event.name}","${event.session}"`

        );

    });

    return rows.join("\n");

};

/**
 * ------------------------------------------------------
 * Backup
 * ------------------------------------------------------
 */

Analytics.createBackup = function () {

    return {

        createdAt:

            new Date().toISOString(),

        version:

            this.config.version,

        events:

            structuredClone(this.events),

        metrics:

            this.exportMetrics(),

        reports:

            structuredClone(this.reports)

    };

};

/**
 * ------------------------------------------------------
 * Restore Backup
 * ------------------------------------------------------
 */

Analytics.restoreBackup = function (

    backup

) {

    if (

        !backup ||

        typeof backup !== "object"

    ) {

        return false;

    }

    this.events =

        backup.events || [];

    this.reports =

        backup.reports || [];

    this.status.totalEvents =

        this.events.length;

    this.log("Backup restored.");

    return true;

};

/**
 * ------------------------------------------------------
 * Download JSON
 * ------------------------------------------------------
 */

Analytics.downloadJSON = function (

    filename = "analytics.json"

) {

    const blob = new Blob(

        [this.exportJSON()],

        {

            type: "application/json"

        }

    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = filename;

    link.click();

    URL.revokeObjectURL(url);

};

/**
 * ------------------------------------------------------
 * Download CSV
 * ------------------------------------------------------
 */

Analytics.downloadCSV = function (

    filename = "analytics.csv"

) {

    const blob = new Blob(

        [this.exportCSV()],

        {

            type: "text/csv"

        }

    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = filename;

    link.click();

    URL.revokeObjectURL(url);

};

/**
 * ------------------------------------------------------
 * Import Error
 * ------------------------------------------------------
 */

Analytics.handleImportError = function (

    error

) {

    this.error(

        "Import failed: " +

        error.message

    );

};

/**
 * ------------------------------------------------------
 * Export Information
 * ------------------------------------------------------
 */

Analytics.getExportInformation = function () {

    return {

        reports:

            this.reports.length,

        events:

            this.events.length,

        metrics:

            Object.keys(

                this.getKPIs()

            ).length,

        exportedVersion:

            this.config.version

    };

};
/**
 * ==========================================================
 * PART 3B
 * ALERTS • THRESHOLDS • MONITORING
 * ==========================================================
 */

/**
 * ------------------------------------------------------
 * Monitoring Configuration
 * ------------------------------------------------------
 */

Analytics.monitoring = {

    enabled: true,

    thresholds: {

        events: 5000,

        apiResponse: 1000,

        slowOperations: 50,

        memoryUsage: 100 * 1024 * 1024

    },

    alerts: []

};

/**
 * ------------------------------------------------------
 * Add Alert
 * ------------------------------------------------------
 */

Analytics.addAlert = function (

    type,

    message,

    data = {}

) {

    const alert = {

        id: crypto.randomUUID(),

        type,

        message,

        data,

        timestamp: new Date().toISOString()

    };

    this.monitoring.alerts.push(alert);

    this.track("monitor.alert", {

        type,

        message

    });

    this.log(`Alert: ${message}`);

    if (

        typeof Dashboard !== "undefined" &&

        typeof Dashboard.notify === "function"

    ) {

        Dashboard.notify(alert);

    }

    return alert;

};

/**
 * ------------------------------------------------------
 * Check Event Threshold
 * ------------------------------------------------------
 */

Analytics.checkEventThreshold = function () {

    if (

        this.status.totalEvents >

        this.monitoring.thresholds.events

    ) {

        this.addAlert(

            "warning",

            "Event threshold exceeded.",

            {

                totalEvents:

                    this.status.totalEvents

            }

        );

    }

};

/**
 * ------------------------------------------------------
 * Check API Performance
 * ------------------------------------------------------
 */

Analytics.checkApiPerformance = function () {

    const average =

        this.getAverageApiTime();

    if (

        average >

        this.monitoring.thresholds.apiResponse

    ) {

        this.addAlert(

            "performance",

            "Average API response time is high.",

            {

                average

            }

        );

    }

};

/**
 * ------------------------------------------------------
 * Check Slow Operations
 * ------------------------------------------------------
 */

Analytics.checkSlowOperations = function () {

    if (

        this.performance.slowOperations.length >

        this.monitoring.thresholds.slowOperations

    ) {

        this.addAlert(

            "performance",

            "Too many slow operations detected.",

            {

                count:

                    this.performance.slowOperations.length

            }

        );

    }

};

/**
 * ------------------------------------------------------
 * Check Memory Usage
 * ------------------------------------------------------
 */

Analytics.checkMemoryUsage = function () {

    const memory =

        this.getMemoryUsage();

    if (

        !memory

    ) {

        return;

    }

    if (

        memory.used >

        this.monitoring.thresholds.memoryUsage

    ) {

        this.addAlert(

            "memory",

            "High JavaScript memory usage.",

            memory

        );

    }

};

/**
 * ------------------------------------------------------
 * Run Monitoring
 * ------------------------------------------------------
 */

Analytics.runMonitoring = function () {

    if (

        !this.monitoring.enabled

    ) {

        return;

    }

    this.checkEventThreshold();

    this.checkApiPerformance();

    this.checkSlowOperations();

    this.checkMemoryUsage();

};

/**
 * ------------------------------------------------------
 * Start Monitoring
 * ------------------------------------------------------
 */

Analytics.startMonitoring = function (

    interval = 60000

) {

    this.stopMonitoring();

    this.monitorTimer = setInterval(() => {

        this.runMonitoring();

    }, interval);

};

/**
 * ------------------------------------------------------
 * Stop Monitoring
 * ------------------------------------------------------
 */

Analytics.stopMonitoring = function () {

    if (

        this.monitorTimer

    ) {

        clearInterval(

            this.monitorTimer

        );

        this.monitorTimer = null;

    }

};

/**
 * ------------------------------------------------------
 * Get Alerts
 * ------------------------------------------------------
 */

Analytics.getAlerts = function () {

    return [

        ...this.monitoring.alerts

    ];

};

/**
 * ------------------------------------------------------
 * Clear Alerts
 * ------------------------------------------------------
 */

Analytics.clearAlerts = function () {

    this.monitoring.alerts = [];

};

/**
 * ------------------------------------------------------
 * Monitoring Status
 * ------------------------------------------------------
 */

Analytics.getMonitoringStatus = function () {

    return {

        enabled:

            this.monitoring.enabled,

        alerts:

            this.monitoring.alerts.length,

        thresholds:

            structuredClone(

                this.monitoring.thresholds

            )

    };

};
/**
 * ==========================================================
 * PART 3C
 * DIAGNOSTICS • HEALTH REPORT • INITIALIZATION
 * ==========================================================
 */

/**
 * ------------------------------------------------------
 * Runtime Statistics
 * ------------------------------------------------------
 */

Analytics.runtime = {

    initializedAt: null,

    uptimeStarted: Date.now(),

    reportsGenerated: 0,

    exportsPerformed: 0,

    importsPerformed: 0

};

/**
 * ------------------------------------------------------
 * Uptime
 * ------------------------------------------------------
 */

Analytics.getUptime = function () {

    return Date.now() -

        this.runtime.uptimeStarted;

};

/**
 * ------------------------------------------------------
 * Health Report
 * ------------------------------------------------------
 */

Analytics.getHealthReport = function () {

    return {

        initialized:

            this.status.initialized,

        enabled:

            this.status.enabled,

        sessionId:

            this.status.sessionId,

        totalEvents:

            this.status.totalEvents,

        reports:

            this.reports.length,

        alerts:

            this.monitoring.alerts.length,

        dashboard:

            this.getDashboardStatus(),

        monitoring:

            this.getMonitoringStatus(),

        performance:

            this.getPerformanceSummary(),

        uptime:

            this.getUptime()

    };

};

/**
 * ------------------------------------------------------
 * Export Diagnostics
 * ------------------------------------------------------
 */

Analytics.exportDiagnostics = function () {

    return {

        status:

            this.getStatus(),

        summary:

            this.generateSummary(),

        health:

            this.getHealthReport(),

        metrics:

            this.exportMetrics(),

        dashboard:

            this.getDashboardSnapshot(),

        monitoring:

            this.getMonitoringStatus(),

        runtime:

            structuredClone(this.runtime)

    };

};

/**
 * ------------------------------------------------------
 * Print Status
 * ------------------------------------------------------
 */

Analytics.printStatus = function () {

    console.group("Analytics Status");

    console.table(this.getStatus());

    console.groupEnd();

};

/**
 * ------------------------------------------------------
 * Print Metrics
 * ------------------------------------------------------
 */

Analytics.printMetrics = function () {

    console.group("Analytics KPIs");

    console.table(this.getKPIs());

    console.groupEnd();

};

/**
 * ------------------------------------------------------
 * Print Performance
 * ------------------------------------------------------
 */

Analytics.printPerformance = function () {

    console.group("Analytics Performance");

    console.table(this.getPerformanceSummary());

    console.groupEnd();

};

/**
 * ------------------------------------------------------
 * Print Monitoring
 * ------------------------------------------------------
 */

Analytics.printMonitoring = function () {

    console.group("Analytics Monitoring");

    console.table(this.getMonitoringStatus());

    console.groupEnd();

};

/**
 * ------------------------------------------------------
 * Print Diagnostics
 * ------------------------------------------------------
 */

Analytics.printDiagnostics = function () {

    console.group("KUTS Analytics Diagnostics");

    this.printStatus();

    this.printMetrics();

    this.printPerformance();

    this.printMonitoring();

    console.groupEnd();

};

/**
 * ------------------------------------------------------
 * Reset Analytics
 * ------------------------------------------------------
 */

Analytics.reset = function () {

    this.clear();

    this.clearReports();

    this.clearAlerts();

    this.resetMetrics();

    this.resetPerformance();

    this.runtime = {

        initializedAt: null,

        uptimeStarted: Date.now(),

        reportsGenerated: 0,

        exportsPerformed: 0,

        importsPerformed: 0

    };

    this.log("Analytics reset completed.");

};

/**
 * ------------------------------------------------------
 * Final Initialization
 * ------------------------------------------------------
 */

Analytics.initializeRuntime = function () {

    this.runtime.initializedAt =

        new Date().toISOString();

    this.log("Analytics runtime initialized.");

};

/**
 * ------------------------------------------------------
 * Automatic Startup
 * ------------------------------------------------------
 */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        Analytics.initialize();

        Analytics.initializeRuntime();

    }

);
