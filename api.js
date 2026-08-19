"use strict";

/**
 * ==========================================================
 * KUTS ECOSYSTEM
 * API SERVICE
 * ----------------------------------------------------------
 * Version : 1.0.1
 * Purpose : Central API communication layer with unified 
 *           initialization, robust queue persistence, and 
 *           safe error handling.
 * ==========================================================
 */

class ApiService {

    /**
     * ------------------------------------------------------
     * Configuration
     * ------------------------------------------------------
     */

    static config = {
        baseURL: "",
        version: "1.0.1",
        timeout: 15000,
        debug: true,
        defaultHeaders: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    };

    /**
     * ------------------------------------------------------
     * Runtime Status
     * ------------------------------------------------------
     */

    static status = {
        initialized: false,
        online: navigator.onLine,
        lastRequest: null,
        lastResponse: null,
        requestCount: 0,
        errorCount: 0
    };

    /**
     * ------------------------------------------------------
     * Authentication State
     * ------------------------------------------------------
     */

    static auth = {
        accessToken: null,
        refreshToken: null,
        tokenType: "Bearer",
        authenticated: false
    };

    /**
     * ------------------------------------------------------
     * Queue & Performance State
     * ------------------------------------------------------
     */

    static queue = [];
    static activeRequests = new Set();
    static maxRetries = 3;
    static retryDelay = 1000;
    static queueStorageKey = "kuts_api_request_queue";

    static requestInterceptors = [];
    static responseInterceptors = [];

    static statistics = {
        startedAt: Date.now(),
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        uploadedFiles: 0,
        downloadedFiles: 0
    };

    /**
     * ------------------------------------------------------
     * Unified Initialization (Fixed: Method Collision)
     * ------------------------------------------------------
     */

    static initialize() {
        if (this.status.initialized) {
            return;
        }

        this.log("Initializing API Service...");
        
        // Configuration & Event Setup
        this.detectConfiguration();
        this.registerNetworkEvents();
        
        // Queue & Auth Restoration
        this.loadQueue();
        this.registerQueueEvents();
        
        if (this.auth.accessToken) {
            this.applyAuthorization();
        }

        this.status.initialized = true;
        this.log("API Service initialized and Ready.");
    }

    /**
     * ------------------------------------------------------
     * Detect Configuration
     * ------------------------------------------------------
     */

    static detectConfiguration() {
        if (typeof AppConfig !== "undefined") {
            if (AppConfig.API_BASE_URL) {
                this.config.baseURL = AppConfig.API_BASE_URL;
            }
            if (AppConfig.API_TIMEOUT) {
                this.config.timeout = AppConfig.API_TIMEOUT;
            }
            if (AppConfig.DEBUG_MODE === false) {
                this.config.debug = false;
            }
        }
    }

    /**
     * ------------------------------------------------------
     * Network Events
     * ------------------------------------------------------
     */

    static registerNetworkEvents() {
        window.addEventListener("online", () => {
            this.status.online = true;
            this.log("Network connected.");
        });

        window.addEventListener("offline", () => {
            this.status.online = false;
            this.warn("Network disconnected.");
            this.saveQueue();
        });
    }

    /**
     * ------------------------------------------------------
     * Header Management
     * ------------------------------------------------------
     */

    static getHeaders() {
        return {
            ...this.config.defaultHeaders
        };
    }

    static setHeader(name, value) {
        this.config.defaultHeaders[name] = value;
    }

    static removeHeader(name) {
        delete this.config.defaultHeaders[name];
    }

    /**
     * ------------------------------------------------------
     * Base URL & Timeout
     * ------------------------------------------------------
     */

    static setBaseURL(url) {
        this.config.baseURL = url;
    }

    static getBaseURL() {
        return this.config.baseURL;
    }

    static setTimeout(milliseconds) {
        this.config.timeout = milliseconds;
    }

    static getTimeout() {
        return this.config.timeout;
    }

    /**
     * ------------------------------------------------------
     * Status & Logging
     * ------------------------------------------------------
     */

    static isOnline() {
        return this.status.online;
    }

    static getStatus() {
        return structuredClone(this.status);
    }

    static log(message) {
        if (!this.config.debug) {
            return;
        }
        console.log("[API]", message);
    }

    static warn(message) {
        console.warn("[API]", message);
    }

    static error(message) {
        console.error("[API]", message);
    }

    /**
     * ------------------------------------------------------
     * Core Request Engine
     * ------------------------------------------------------
     */

    static async request(method, endpoint, data = null, options = {}) {
        if (!this.isOnline()) {
            throw new Error("No internet connection.");
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => {
            controller.abort();
        }, this.config.timeout);

        const requestOptions = {
            method,
            headers: {
                ...this.getHeaders(),
                ...(options.headers || {})
            },
            signal: controller.signal
        };

        if (data !== null) {
            requestOptions.body = JSON.stringify(data);
        }

        const url = this.config.baseURL + endpoint;
        this.status.lastRequest = {
            method,
            url,
            time: new Date().toISOString()
        };

        try {
            const response = await fetch(url, requestOptions);
            clearTimeout(timeout);
            this.status.requestCount++;
            this.status.lastResponse = {
                status: response.status,
                ok: response.ok,
                time: new Date().toISOString()
            };
            return response;
        }
        catch (error) {
            clearTimeout(timeout);
            this.status.errorCount++;
            this.error(error.message);
            throw error;
        }
    }

    /**
     * ------------------------------------------------------
     * HTTP Method Shortcuts
     * ------------------------------------------------------
     */

    static get(endpoint, options = {}) {
        return this.request("GET", endpoint, null, options);
    }

    static post(endpoint, data = {}, options = {}) {
        return this.request("POST", endpoint, data, options);
    }

    static put(endpoint, data = {}, options = {}) {
        return this.request("PUT", endpoint, data, options);
    }

    static patch(endpoint, data = {}, options = {}) {
        return this.request("PATCH", endpoint, data, options);
    }

    static delete(endpoint, options = {}) {
        return this.request("DELETE", endpoint, null, options);
    }

    /**
     * ------------------------------------------------------
     * Response Processing & Error Handling
     * ------------------------------------------------------
     */

    static async processResponse(response) {
        const contentType = response.headers.get("content-type") || "";
        let body = null;

        try {
            if (contentType.includes("application/json")) {
                body = await response.json();
            } else if (contentType.includes("text/")) {
                body = await response.text();
            } else {
                body = await response.blob();
            }
        }
        catch (error) {
            body = null;
        }

        if (!response.ok) {
            throw this.createError(response, body);
        }

        return body;
    }

    static createError(response, body) {
        const error = new Error(
            body?.message ||
            response.statusText ||
            "API request failed."
        );
        error.status = response.status;
        error.statusText = response.statusText;
        error.body = body;
        return error;
    }

    static async send(method, endpoint, data = null, options = {}) {
        const response = await this.request(method, endpoint, data, options);
        return this.processResponse(response);
    }

    static getJSON(endpoint, options = {}) {
        return this.send("GET", endpoint, null, options);
    }

    static postJSON(endpoint, data = {}, options = {}) {
        return this.send("POST", endpoint, data, options);
    }

    static putJSON(endpoint, data = {}, options = {}) {
        return this.send("PUT", endpoint, data, options);
    }

    static patchJSON(endpoint, data = {}, options = {}) {
        return this.send("PATCH", endpoint, data, options);
    }

    static deleteJSON(endpoint, options = {}) {
        return this.send("DELETE", endpoint, null, options);
    }

    static async ping() {
        try {
            await this.getJSON("/health");
            return true;
        }
        catch {
            return false;
        }
    }

    static getLastResponse() {
        return structuredClone(this.status.lastResponse);
    }

    /**
     * ------------------------------------------------------
     * Authentication & Authorization
     * ------------------------------------------------------
     */

    static setAccessToken(token) {
        this.auth.accessToken = token;
        this.auth.authenticated = !!token;
    }

    static setRefreshToken(token) {
        this.auth.refreshToken = token;
    }

    static getAccessToken() {
        return this.auth.accessToken;
    }

    static isAuthenticated() {
        return this.auth.authenticated;
    }

    static clearAuthentication() {
        this.auth.accessToken = null;
        this.auth.refreshToken = null;
        this.auth.authenticated = false;
        this.removeHeader("Authorization");
        this.log("Authentication cleared.");
    }

    static applyAuthorization() {
        if (!this.auth.accessToken) {
            this.removeHeader("Authorization");
            return;
        }
        this.setHeader(
            "Authorization",
            `${this.auth.tokenType} ${this.auth.accessToken}`
        );
    }

    static async login(credentials) {
        const result = await this.postJSON("/login", credentials);
        if (result?.accessToken) {
            this.setAccessToken(result.accessToken);
        }
        if (result?.refreshToken) {
            this.setRefreshToken(result.refreshToken);
        }
        this.applyAuthorization();
        this.log("Authentication successful.");
        return result;
    }

    static async logout() {
        try {
            if (this.isAuthenticated()) {
                await this.postJSON("/logout");
            }
        }
        catch (error) {
            this.warn("Logout request failed.");
        }
        this.clearAuthentication();
    }

    static async refreshAccessToken() {
        if (!this.auth.refreshToken) {
            throw new Error("Refresh token unavailable.");
        }
        const result = await this.postJSON("/refresh", {
            refreshToken: this.auth.refreshToken
        });
        if (result?.accessToken) {
            this.setAccessToken(result.accessToken);
            this.applyAuthorization();
        }
        return result;
    }

    static getAuthorizationHeader() {
        if (!this.auth.accessToken) {
            return null;
        }
        return {
            Authorization: `${this.auth.tokenType} ${this.auth.accessToken}`
        };
    }

    static getAuthentication() {
        return {
            authenticated: this.auth.authenticated,
            tokenType: this.auth.tokenType,
            hasAccessToken: !!this.auth.accessToken,
            hasRefreshToken: !!this.auth.refreshToken
        };
    }

    /**
     * ------------------------------------------------------
     * Interceptors & Session Recovery
     * ------------------------------------------------------
     */

    static addRequestInterceptor(callback) {
        if (typeof callback === "function") {
            this.requestInterceptors.push(callback);
        }
    }

    static addResponseInterceptor(callback) {
        if (typeof callback === "function") {
            this.responseInterceptors.push(callback);
        }
    }

    static async runRequestInterceptors(config) {
        let request = config;
        for (const interceptor of this.requestInterceptors) {
            request = await interceptor(request) || request;
        }
        return request;
    }

    static async runResponseInterceptors(response) {
        let result = response;
        for (const interceptor of this.responseInterceptors) {
            result = await interceptor(result) || result;
        }
        return result;
    }

    static async handleUnauthorized() {
        this.warn("Access token expired.");
        try {
            await this.refreshAccessToken();
            this.log("Access token refreshed.");
            return true;
        }
        catch (error) {
            this.warn("Refresh failed.");
            this.sessionExpired();
            return false;
        }
    }

    static sessionExpired() {
        this.clearAuthentication();
        document.dispatchEvent(new CustomEvent("api:sessionExpired"));
        this.warn("Session expired.");
    }

    static async retryRequest(method, endpoint, data = null, options = {}) {
        const response = await this.request(method, endpoint, data, options);
        if (response.status === 401) {
            const refreshed = await this.handleUnauthorized();
            if (refreshed) {
                return this.request(method, endpoint, data, options);
            }
        }
        return response;
    }

    static async authenticatedRequest(method, endpoint, data = null, options = {}) {
        this.applyAuthorization();
        let config = { method, endpoint, data, options };
        config = await this.runRequestInterceptors(config);
        
        let response = await this.retryRequest(
            config.method,
            config.endpoint,
            config.data,
            config.options
        );
        
        response = await this.runResponseInterceptors(response);
        return this.processResponse(response);
    }

    static getSessionInformation() {
        return {
            authenticated: this.auth.authenticated,
            accessToken: !!this.auth.accessToken,
            refreshToken: !!this.auth.refreshToken,
            online: this.status.online,
            requests: this.status.requestCount,
            errors: this.status.errorCount
        };
    }

    /**
     * ------------------------------------------------------
     * Request Queue & Offline Persistence Engine
     * ------------------------------------------------------
     */

    static enqueue(method, endpoint, data = null, options = {}) {
        this.queue.push({
            method,
            endpoint,
            data,
            options,
            retries: 0,
            createdAt: Date.now()
        });
        this.saveQueue();
        this.log(`Queued request: ${method} ${endpoint}`);
    }

    static getQueueSize() {
        return this.queue.length;
    }

    static clearQueue() {
        this.queue = [];
        this.clearSavedQueue();
        this.log("Request queue cleared.");
    }

    static createRequestKey(method, endpoint) {
        return `${method}:${endpoint}`;
    }

    static isRequestActive(method, endpoint) {
        return this.activeRequests.has(this.createRequestKey(method, endpoint));
    }

    static async executeQueuedRequest(item) {
        const key = this.createRequestKey(item.method, item.endpoint);
        if (this.activeRequests.has(key)) {
            return;
        }
        this.activeRequests.add(key);
        try {
            await this.authenticatedRequest(
                item.method,
                item.endpoint,
                item.data,
                item.options
            );
        }
        finally {
            this.activeRequests.delete(key);
        }
    }

    static async retry(item) {
        while (item.retries < this.maxRetries) {
            try {
                return await this.executeQueuedRequest(item);
            }
            catch (error) {
                item.retries++;
                this.warn(`Retry ${item.retries}/${this.maxRetries} : ${item.endpoint}`);
                if (item.retries >= this.maxRetries) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
            }
        }
    }

    static async processQueue() {
        if (!this.isOnline()) {
            this.warn("Offline. Queue paused.");
            return;
        }

        while (this.queue.length > 0) {
            const item = this.queue[0]; // Peek before processing
            try {
                await this.retry(item);
                this.queue.shift(); // Remove only on complete success
                this.saveQueue();
            }
            catch (error) {
                this.error(`Queue failed permanently: ${item.endpoint}`);
                this.queue.shift(); // Drop problematic payload to avoid infinite loops
                this.saveQueue();
            }
        }
    }

    static saveQueue() {
        try {
            localStorage.setItem(this.queueStorageKey, JSON.stringify(this.queue));
            this.log("Request queue saved.");
        }
        catch (error) {
            this.error("Unable to save request queue.");
        }
    }

    static loadQueue() {
        try {
            const data = localStorage.getItem(this.queueStorageKey);
            if (!data) {
                this.queue = [];
                return;
            }
            this.queue = JSON.parse(data);
            this.log(`${this.queue.length} queued request(s) restored.`);
        }
        catch (error) {
            this.queue = [];
            this.error("Unable to load request queue.");
        }
    }

    static enqueueOffline(method, endpoint, data = null, options = {}) {
        this.enqueue(method, endpoint, data, options);
    }

    static clearSavedQueue() {
        localStorage.removeItem(this.queueStorageKey);
    }

    static async synchronizeQueue() {
        if (!this.isOnline()) {
            this.warn("Offline. Synchronization skipped.");
            return;
        }
        this.loadQueue();
        await this.processQueue();
    }

    static registerQueueEvents() {
        window.addEventListener("online", async () => {
            this.log("Network restored.");
            await this.synchronizeQueue();
        });
    }

    static getQueueInformation() {
        return {
            pending: this.queue.length,
            active: this.activeRequests.size,
            maxRetries: this.maxRetries,
            retryDelay: this.retryDelay
        };
    }

    /**
     * ------------------------------------------------------
     * File Upload & Download Operations
     * ------------------------------------------------------
     */

    static uploadFile(endpoint, file, fieldName = "file", onProgress = null) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append(fieldName, file);

            xhr.open("POST", this.config.baseURL + endpoint, true);

            const headers = this.getHeaders();
            Object.keys(headers).forEach(key => {
                if (key.toLowerCase() !== "content-type") {
                    xhr.setRequestHeader(key, headers[key]);
                }
            });

            if (this.auth.accessToken) {
                xhr.setRequestHeader(
                    "Authorization",
                    `${this.auth.tokenType} ${this.auth.accessToken}`
                );
            }

            xhr.upload.addEventListener("progress", event => {
                if (event.lengthComputable && typeof onProgress === "function") {
                    onProgress({
                        loaded: event.loaded,
                        total: event.total,
                        percent: Math.round((event.loaded / event.total) * 100)
                    });
                }
            });

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        resolve(JSON.parse(xhr.responseText));
                    }
                    catch {
                        resolve(xhr.responseText);
                    }
                } else {
                    reject(new Error(`Upload failed (${xhr.status})`));
                }
            };

            xhr.onerror = () => {
                reject(new Error("Upload failed."));
            };

            xhr.send(formData);
        });
    }

    static async downloadFile(endpoint, filename = null) {
        const response = await fetch(this.config.baseURL + endpoint, {
            headers: { ...this.getHeaders() }
        });

        if (!response.ok) {
            throw new Error(`Download failed (${response.status})`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename || "download";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        return true;
    }

    /**
     * Fixed: Added response status validation and parsing
     */
    static async downloadJSON(endpoint) {
        const response = await this.get(endpoint);
        if (!response.ok) {
            throw new Error(`Download JSON failed (${response.status})`);
        }
        return response.json();
    }

    static async uploadJSON(endpoint, object, filename = "data.json") {
        const blob = new Blob([JSON.stringify(object, null, 2)], {
            type: "application/json"
        });
        const file = new File([blob], filename, {
            type: "application/json"
        });
        return this.uploadFile(endpoint, file, "file");
    }

    static getFileInformation(file) {
        return {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
        };
    }

    static validateFile(file, maxSize = 10 * 1024 * 1024) {
        if (!(file instanceof File)) {
            throw new Error("Invalid file.");
        }
        if (file.size > maxSize) {
            throw new Error("File exceeds maximum size.");
        }
        return true;
    }

    /**
     * ------------------------------------------------------
     * Diagnostics & Statistics
     * ------------------------------------------------------
     */

    static getUptime() {
        return Date.now() - this.statistics.startedAt;
    }

    static getHealthReport() {
        return {
            online: this.isOnline(),
            authenticated: this.isAuthenticated(),
            queue: this.getQueueInformation(),
            session: this.getSessionInformation(),
            statistics: structuredClone(this.statistics),
            uptime: this.getUptime()
        };
    }

    static exportDiagnostics() {
        return {
            config: structuredClone(this.config),
            status: structuredClone(this.status),
            authentication: this.getAuthentication(),
            queue: this.getQueueInformation(),
            statistics: structuredClone(this.statistics),
            health: this.getHealthReport()
        };
    }

    static printDiagnostics() {
        console.group("API Diagnostics");
        console.table(this.exportDiagnostics());
        console.groupEnd();
    }

    static resetStatistics() {
        this.statistics.totalRequests = 0;
        this.statistics.successfulRequests = 0;
        this.statistics.failedRequests = 0;
        this.statistics.uploadedFiles = 0;
        this.statistics.downloadedFiles = 0;
        this.statistics.startedAt = Date.now();
    }

    static getVersion() {
        return this.config.version || "1.0.1";
    }
}

/**
 * ==========================================================
 * AUTOMATIC STARTUP
 * ==========================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    ApiService.initialize();
});