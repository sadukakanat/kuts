"use strict";

/**
 * ==========================================================
 * KUTS ECOSYSTEM
 * Storage Engine
 * ----------------------------------------------------------
 * Version : 1.0.0
 * Purpose : Local storage management
 * ==========================================================
 */

class StorageEngine {

    /**
     * ------------------------------------------------------
     * Configuration
     * ------------------------------------------------------
     */

    static VERSION = "1.0.0";
    static PREFIX = "KUTS_";
    static initialized = false;
    static available = false;

    static events = new Map();
    static cache = new Map();

    static metadata = {
        version: "1.0.0",
        lastBackup: null,
        backupKey: "__kuts_backup__"
    };

    static runtime = {
        initialized: false,
        initializedAt: null,
        reads: 0,
        writes: 0,
        deletes: 0,
        errors: 0
    };

    /**
     * ------------------------------------------------------
     * Initialize Storage
     * ------------------------------------------------------
     */

    static initialize() {

        if (this.initialized) {

            return;

        }

        this.available = this.checkAvailability();
        this.initialized = true;

        this.runtime.initialized = true;
        this.runtime.initializedAt = new Date().toISOString();

        this.log("Storage initialized.");

    }

    /**
     * ------------------------------------------------------
     * Check Local Storage
     * ------------------------------------------------------
     */

    static checkAvailability() {

        try {

            const key = "__kuts_test__";

            localStorage.setItem(key, "OK");

            localStorage.removeItem(key);

            return true;

        }

        catch (error) {

            this.recordError();

            console.error(error);

            return false;

        }

    }

    /**
     * ------------------------------------------------------
     * Build Storage Key
     * ------------------------------------------------------
     */

    static key(name) {

        return this.PREFIX + name;

    }

    /**
     * ------------------------------------------------------
     * Save Value
     * ------------------------------------------------------
     */

    static set(name, value) {

        if (!this.available) {

            return false;

        }

        try {

            localStorage.setItem(

                this.key(name),

                JSON.stringify(value)

            );

            this.recordWrite();

            this.notifyChange(name);

            return true;

        }

        catch (error) {

            this.recordError();

            console.error(error);

            return false;

        }

    }

    /**
     * ------------------------------------------------------
     * Load Value
     * ------------------------------------------------------
     */

    static get(name, defaultValue = null) {

        if (!this.available) {

            return defaultValue;

        }

        try {

            this.recordRead();

            const data = localStorage.getItem(

                this.key(name)

            );

            if (data === null) {

                return defaultValue;

            }

            return JSON.parse(data);

        }

        catch (error) {

            this.recordError();

            console.error(error);

            return defaultValue;

        }

    }

    /**
     * ------------------------------------------------------
     * Remove Value
     * ------------------------------------------------------
     */

    static remove(name) {

        if (!this.available) {

            return false;

        }

        localStorage.removeItem(

            this.key(name)

        );

        this.recordDelete();

        this.notifyChange(name);

        return true;

    }

    /**
     * ------------------------------------------------------
     * Check Key Exists
     * ------------------------------------------------------
     */

    static has(name) {

        this.recordRead();

        return (

            localStorage.getItem(

                this.key(name)

            ) !== null

        );

    }

    /**
     * ------------------------------------------------------
     * Clear KUTS Storage
     * ------------------------------------------------------
     */

    static clear() {

        const keys = [];

        for (let i = 0; i < localStorage.length; i++) {

            const key = localStorage.key(i);

            if (key && key.startsWith(this.PREFIX)) {

                keys.push(key);

            }

        }

        keys.forEach(key => {

            localStorage.removeItem(key);

        });

        this.recordDelete();

    }

    /**
     * ------------------------------------------------------
     * Logging
     * ------------------------------------------------------
     */

    static log(message) {

        console.log("[Storage]", message);

    }

    /**
     * ------------------------------------------------------
     * Runtime and Metrics Tracking
     * ------------------------------------------------------
     */

    static recordRead() {
        this.runtime.reads++;
    }

    static recordWrite() {
        this.runtime.writes++;
    }

    static recordDelete() {
        this.runtime.deletes++;
    }

    static recordError() {
        this.runtime.errors++;
    }

    static getRuntimeStatistics() {
        return { ...this.runtime };
    }

    static resetCounters() {
        this.runtime.reads = 0;
        this.runtime.writes = 0;
        this.runtime.deletes = 0;
        this.runtime.errors = 0;
    }

    /**
     * ------------------------------------------------------
     * Event System
     * ------------------------------------------------------
     */

    static subscribe(eventName, callback) {

        if (typeof callback !== "function") {

            throw new Error("Storage subscriber must be a function.");

        }

        if (!this.events.has(eventName)) {

            this.events.set(eventName, []);

        }

        this.events.get(eventName).push(callback);

    }

    static unsubscribe(eventName, callback) {

        if (!this.events.has(eventName)) {

            return;

        }

        const listeners = this.events.get(eventName);

        this.events.set(

            eventName,

            listeners.filter(fn => fn !== callback)

        );

    }

    static publish(eventName, payload = {}) {

        if (!this.events.has(eventName)) {

            return;

        }

        this.events.get(eventName).forEach(listener => {

            try {

                listener(payload);

            }

            catch (error) {

                console.error(error);

            }

        });

    }

    static notifyChange(key) {

        this.publish("storage.changed", {

            key,

            timestamp: new Date().toISOString()

        });

    }

    static listEvents() {

        return Array.from(this.events.keys());

    }

    static clearEvents() {

        this.events.clear();

    }

    static printEvents() {

        console.group("Storage Events");

        console.table(

            this.listEvents().map(event => ({

                Event: event,

                Subscribers: this.events.get(event).length

            }))

        );

        console.groupEnd();

    }

    /**
     * ------------------------------------------------------
     * Cache Management
     * ------------------------------------------------------
     */

    static cacheValue(key, value) {

        this.cache.set(key, {

            value,

            timestamp: Date.now()

        });

    }

    static getCachedValue(key) {

        const item = this.cache.get(key);

        return item ? item.value : null;

    }

    static removeCachedValue(key) {

        this.cache.delete(key);

    }

    static clearCache() {

        this.cache.clear();

    }

    static cacheSize() {

        return this.cache.size;

    }

    /**
     * ------------------------------------------------------
     * Integrity & Diagnostics
     * ------------------------------------------------------
     */

    static verifyIntegrity() {

        const report = {

            valid: true,

            errors: []

        };

        try {

            for (let i = 0; i < localStorage.length; i++) {

                const key = localStorage.key(i);

                if (!key || !key.startsWith(this.PREFIX)) {

                    continue;

                }

                const value = localStorage.getItem(key);

                if (value !== null) {

                    JSON.parse(value);

                }

            }

        }

        catch (error) {

            report.valid = false;

            report.errors.push(error.message);

        }

        return report;

    }

    static repair() {

        let repaired = 0;

        const damaged = [];

        for (let i = 0; i < localStorage.length; i++) {

            const key = localStorage.key(i);

            if (!key || !key.startsWith(this.PREFIX)) {

                continue;

            }

            try {

                const val = localStorage.getItem(key);

                if (val !== null) {

                    JSON.parse(val);

                }

            }

            catch (error) {

                damaged.push(key);

            }

        }

        damaged.forEach(key => {

            localStorage.removeItem(key);

            repaired++;

        });

        return repaired;

    }

    static getUsage() {

        let bytes = 0;

        for (let i = 0; i < localStorage.length; i++) {

            const key = localStorage.key(i);

            if (key) {

                const value = localStorage.getItem(key);

                bytes += key.length + (value ? value.length : 0);

            }

        }

        return {

            bytes,

            kilobytes: (bytes / 1024).toFixed(2),

            items: localStorage.length

        };

    }

    static getPerformanceReport() {

        return {

            runtime: this.getRuntimeStatistics(),

            usage: this.getUsage(),

            cacheItems: this.cacheSize(),

            backupVersion: this.getVersion(),

            integrity: this.verifyIntegrity()

        };

    }

    static printStorageReport() {

        console.group("Storage Report");

        console.table({

            CacheItems: this.cacheSize(),

            UsageKB: this.getUsage().kilobytes,

            StorageItems: this.getUsage().items,

            Integrity: this.verifyIntegrity().valid

        });

        console.groupEnd();

    }

    /**
     * ------------------------------------------------------
     * Backup, Versioning & Recovery
     * ------------------------------------------------------
     */

    static createBackup() {

        const backup = {

            version: this.metadata.version,

            timestamp: new Date().toISOString(),

            data: {}

        };

        for (let i = 0; i < localStorage.length; i++) {

            const key = localStorage.key(i);

            if (key && key.startsWith(this.PREFIX)) {

                backup.data[key] = localStorage.getItem(key);

            }

        }

        localStorage.setItem(

            this.metadata.backupKey,

            JSON.stringify(backup)

        );

        this.metadata.lastBackup = backup.timestamp;

        return backup;

    }

    static restoreBackup() {

        const raw = localStorage.getItem(

            this.metadata.backupKey

        );

        if (!raw) {

            return false;

        }

        const backup = JSON.parse(raw);

        Object.entries(backup.data).forEach(

            ([key, value]) => {

                localStorage.setItem(key, value);

            }

        );

        return true;

    }

    static deleteBackup() {

        localStorage.removeItem(

            this.metadata.backupKey

        );

        this.metadata.lastBackup = null;

    }

    static exportStorage() {

        return JSON.stringify(

            this.createBackup(),

            null,

            2

        );

    }

    static importStorage(json) {

        try {

            const backup = JSON.parse(json);

            if (!backup.data) {

                return false;

            }

            Object.entries(backup.data).forEach(

                ([key, value]) => {

                    localStorage.setItem(key, value);

                }

            );

            return true;

        }

        catch (error) {

            console.error(error);

            return false;

        }

    }

    static getVersion() {

        return this.metadata.version;

    }

    static setVersion(version) {

        this.metadata.version = version;

    }

    static migrate(targetVersion, callback) {

        const current = this.getVersion();

        if (current === targetVersion) {

            return false;

        }

        if (typeof callback === "function") {

            callback(current, targetVersion);

        }

        this.setVersion(targetVersion);

        return true;

    }

    static reset() {

        this.clear();

        this.clearCache();

        this.clearEvents();

    }

    static getRecoveryReport() {

        return {

            version: this.getVersion(),

            lastBackup: this.metadata.lastBackup,

            cacheItems: this.cacheSize(),

            integrity: this.verifyIntegrity(),

            usage: this.getUsage()

        };

    }

    static printRecoveryReport() {

        console.group("Storage Recovery");

        console.table(this.getRecoveryReport());

        console.groupEnd();

    }

    static printDiagnostics() {

        console.group("KUTS Storage Diagnostics");

        this.printStorageReport();

        this.printRecoveryReport();

        this.printEvents();

        console.group("Storage Runtime");

        console.table(this.getRuntimeStatistics());

        console.groupEnd();

        console.groupEnd();

    }

}

/**
 * ==========================================================
 * Automatic Startup Setup
 * ==========================================================
 */

window.StorageEngine = StorageEngine;

window.addEventListener("storage", event => {

    StorageEngine.publish("storage.sync", {

        key: event.key,

        oldValue: event.oldValue,

        newValue: event.newValue

    });

});

document.addEventListener("DOMContentLoaded", () => {

    StorageEngine.initialize();

});


/**
 * ==========================================================
 * PART 2: BASE REPOSITORY CLASS
 * ==========================================================
 * Encapsulates all common CRUD, query, indexing, and management operations.
 */

class BaseRepository {

    static KEY = "";

    static initialize() {

        if (!StorageEngine.has(this.KEY)) {

            StorageEngine.set(this.KEY, []);

        }

    }

    static getAll() {

        return StorageEngine.get(this.KEY, []);

    }

    static saveAll(records) {

        StorageEngine.set(this.KEY, records);

    }

    static findById(id) {

        return this.getAll().find(item => item.id === id) || null;

    }

    static exists(id) {

        return this.findById(id) !== null;

    }

    static update(id, updates) {

        const records = this.getAll();

        const index = records.findIndex(item => item.id === id);

        if (index === -1) {

            return false;

        }

        records[index] = {

            ...records[index],

            ...updates,

            updatedAt: new Date().toISOString()

        };

        this.saveAll(records);

        return true;

    }

    static delete(id) {

        const records = this.getAll();

        const filtered = records.filter(item => item.id !== id);

        if (filtered.length === records.length) {

            return false;

        }

        this.saveAll(filtered);

        return true;

    }

    static count() {

        return this.getAll().length;

    }

    static find(callback) {

        return this.getAll().find(callback) || null;

    }

    static filter(callback) {

        return this.getAll().filter(callback);

    }

    static replace(records) {

        this.saveAll(records);

    }

    static clear() {

        this.saveAll([]);

    }

    static generateId(prefix = "ID") {

        return (

            prefix +

            "_" +

            Date.now() +

            "_" +

            Math.random()

                .toString(36)

                .substring(2, 8)

        );

    }

    static insert(record) {

        const records = this.getAll();

        if (!record.id) {

            record.id = this.generateId();

        }

        if (this.exists(record.id)) {

            throw new Error(

                `Duplicate ID: ${record.id}`

            );

        }

        const now = new Date().toISOString();

        record.createdAt = now;

        record.updatedAt = now;

        records.push(record);

        this.saveAll(records);

        return record;

    }

    static add(record) {
        return this.insert(record);
    }

    static export() {

        return JSON.stringify(

            this.getAll(),

            null,

            2

        );

    }

    static import(json) {

        try {

            const records = JSON.parse(json);

            if (!Array.isArray(records)) {

                return false;

            }

            this.saveAll(records);

            return true;

        }

        catch (error) {

            console.error(error);

            return false;

        }

    }

    static backup() {

        return {

            timestamp: new Date().toISOString(),

            total: this.count(),

            data: this.getAll()

        };

    }

    static restore(backup) {

        if (!backup || !Array.isArray(backup.data)) {

            return false;

        }

        this.saveAll(backup.data);

        return true;

    }

    static search(field, value) {

        return this.getAll().filter(record =>

            record[field] === value

        );

    }

    static sortBy(field, ascending = true) {

        return [...this.getAll()].sort((a, b) => {

            if (a[field] < b[field]) {

                return ascending ? -1 : 1;

            }

            if (a[field] > b[field]) {

                return ascending ? 1 : -1;

            }

            return 0;

        });

    }

    static paginate(page = 1, pageSize = 10) {

        const records = this.getAll();

        const start = (page - 1) * pageSize;

        return {

            page,

            pageSize,

            total: records.length,

            totalPages: Math.ceil(records.length / pageSize),

            records: records.slice(start, start + pageSize)

        };

    }

    static validate(record) {

        return (

            record &&

            typeof record === "object"

        );

    }

    static statistics() {

        const records = this.getAll();

        return {

            total: records.length,

            firstRecord:

                records.length > 0

                    ? records[0]

                    : null,

            lastRecord:

                records.length > 0

                    ? records[records.length - 1]

                    : null

        };

    }

    static lastUpdated() {

        const records = this.getAll();

        if (records.length === 0) {

            return null;

        }

        return records.reduce((latest, record) => {

            if (!record.updatedAt) {

                return latest;

            }

            return (!latest || record.updatedAt > latest)

                ? record.updatedAt

                : latest;

        }, null);

    }

    static compact() {

        const cleaned = this.getAll().filter(record =>

            record !== null &&

            record !== undefined

        );

        this.saveAll(cleaned);

        return cleaned.length;

    }

}


/**
 * ==========================================================
 * PART 3: STORAGE MANAGERS (EXTENDING BASE REPOSITORY)
 * ==========================================================
 */

class UserStorage extends BaseRepository {
    static KEY = "users";
}

class WalletStorage extends BaseRepository {
    static KEY = "wallets";
}

class SubscriptionStorage extends BaseRepository {
    static KEY = "subscriptions";
}

class ReferralStorage extends BaseRepository {
    static KEY = "referrals";
}

/**
 * ==========================================================
 * INITIALIZE STORAGE MANAGERS
 * ==========================================================
 */

document.addEventListener("DOMContentLoaded", () => {

    UserStorage.initialize();

    WalletStorage.initialize();

    SubscriptionStorage.initialize();

    ReferralStorage.initialize();

});