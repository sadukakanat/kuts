"use strict";

/**
 * ==========================================================
 * KUTS ECOSYSTEM
 * Authentication Service
 * ----------------------------------------------------------
 * Version : 1.0.0
 * Purpose : Core Authentication Controller & Security Engine
 * ==========================================================
 */

class AuthService {

    /**
     * ------------------------------------------------------
     * Runtime State & Configuration
     * ------------------------------------------------------
     */

    static session = {
        authenticated: false,
        user: null,
        token: null,
        loginTime: null
    };

    static runtime = {
        initialized: false,
        initializedAt: null,
        version: "1.0.0",
        environment: "development"
    };

    static history = [];
    static failedAttempts = new Map();

    /**
     * ------------------------------------------------------
     * Initialization & Session Management
     * ------------------------------------------------------
     */

    static initialize() {
        if (this.runtime.initialized) {
            return;
        }

        this.restoreSession();

        this.runtime.initialized = true;
        this.runtime.initializedAt = new Date().toISOString();
        
        this.recordEvent("AUTH_INITIALIZED");
        console.log("[Auth] Initialized.");
    }

    static saveSession(user) {
        if (!user) return false;

        this.session = {
            authenticated: true,
            user,
            token: crypto.randomUUID(),
            loginTime: new Date().toISOString()
        };

        localStorage.setItem(
            "kuts_auth_session",
            JSON.stringify(this.session)
        );

        return true;
    }

    static restoreSession() {
        try {
            const stored = localStorage.getItem("kuts_auth_session");
            if (!stored) return false;

            this.session = JSON.parse(stored);
            return this.session.authenticated;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    static logout() {
        this.recordLogout();
        this.session = {
            authenticated: false,
            user: null,
            token: null,
            loginTime: null
        };
        localStorage.removeItem("kuts_auth_session");
    }

    static invalidateSession() {
        this.logout();
        return true;
    }

    /**
     * ------------------------------------------------------
     * Login & Credentials Engine
     * ------------------------------------------------------
     */

    static login(username, password) {
        if (!username || !password) {
            return {
                success: false,
                message: "Username and password are required."
            };
        }

        if (typeof UserStorage === "undefined") {
            return {
                success: false,
                message: "User storage unavailable."
            };
        }

        let user = null;

        try {
            if (typeof UserStorage.findUser === "function") {
                user = UserStorage.findUser(username);
            } else if (typeof UserStorage.getUser === "function") {
                user = UserStorage.getUser(username);
            } else if (typeof UserStorage.getUsers === "function") {
                const users = UserStorage.getUsers();
                user = users.find(u =>
                    u.username === username ||
                    u.email === username
                );
            }
        } catch (error) {
            console.error(error);
        }

        if (!user) {
            this.recordFailedLogin(username);
            return {
                success: false,
                message: "User not found."
            };
        }

        if (this.isLocked(user.username)) {
            return {
                success: false,
                message: "Account is temporarily locked due to failed attempts."
            };
        }

        if (!this.verifyPassword(password, user.password)) {
            this.recordFailedLogin(user.username);
            return {
                success: false,
                message: "Incorrect password."
            };
        }

        this.clearFailedAttempts(user.username);
        this.saveSession(user);
        this.recordLogin(user);

        return {
            success: true,
            message: "Login successful.",
            user
        };
    }

    static loginWithEmail(email, password) {
        return this.login(email, password);
    }

    static verifyPassword(inputPassword, storedPassword) {
        if (!storedPassword) {
            return false;
        }
        return inputPassword === storedPassword;
    }

    static validateCredentials(username, password) {
        return this.login(username, password).success;
    }

    static refreshSession() {
        if (!this.isAuthenticated()) {
            return false;
        }

        this.session.loginTime = new Date().toISOString();
        localStorage.setItem(
            "kuts_auth_session",
            JSON.stringify(this.session)
        );

        return true;
    }

    /**
     * ------------------------------------------------------
     * Registration Integration
     * ------------------------------------------------------
     */

    static register(userData) {
        if (!userData || typeof userData !== "object") {
            return {
                success: false,
                message: "Invalid registration data."
            };
        }

        if (typeof UserStorage === "undefined") {
            return {
                success: false,
                message: "User storage unavailable."
            };
        }

        const validation = this.validateRegistration(userData);
        if (!validation.success) {
            return validation;
        }

        const existing = this.findUser(
            userData.username,
            userData.email
        );

        if (existing) {
            return {
                success: false,
                message: "User already exists."
            };
        }

        const user = {
            id: crypto.randomUUID(),
            username: userData.username.trim(),
            email: userData.email.trim().toLowerCase(),
            password: userData.password,
            role: userData.role || "student",
            active: true,
            createdAt: new Date().toISOString()
        };

        try {
            if (typeof UserStorage.addUser === "function") {
                UserStorage.addUser(user);
            } else if (typeof UserStorage.saveUser === "function") {
                UserStorage.saveUser(user);
            } else {
                return {
                    success: false,
                    message: "No supported storage method found."
                };
            }
        } catch (error) {
            console.error(error);
            return {
                success: false,
                message: "Registration failed."
            };
        }

        this.saveSession(user);

        return {
            success: true,
            message: "Registration successful.",
            user
        };
    }

    static validateRegistration(user) {
        if (!user.username || user.username.length < 3) {
            return { success: false, message: "Username is too short." };
        }
        if (!user.email || !user.email.includes("@")) {
            return { success: false, message: "Invalid email." };
        }
        if (!user.password || user.password.length < 6) {
            return { success: false, message: "Password must contain at least 6 characters." };
        }
        return { success: true };
    }

    static findUser(username, email) {
        if (typeof UserStorage === "undefined") {
            return null;
        }
        try {
            if (typeof UserStorage.getUsers === "function") {
                const users = UserStorage.getUsers();
                return users.find(u =>
                    u.username === username ||
                    u.email === email
                ) || null;
            }
        } catch (error) {
            console.error(error);
        }
        return null;
    }

    /**
     * ------------------------------------------------------
     * Authorization & Role Checks
     * ------------------------------------------------------
     */

    static isAuthenticated() {
        return this.session.authenticated;
    }

    static getCurrentUser() {
        return this.session.user;
    }

    static getToken() {
        return this.session.token;
    }

    static assignRole(user, role) {
        if (!user) return false;
        user.role = role;
        return true;
    }

    static isAdmin() {
        return this.session.user && this.session.user.role === "admin";
    }

    static isStudent() {
        return this.session.user && this.session.user.role === "student";
    }

    static hasRole(role) {
        if (!this.session.user) return false;
        return this.session.user.role === role;
    }

    static authorize(roles = []) {
        if (!this.isAuthenticated()) return false;
        if (!Array.isArray(roles) || roles.length === 0) return true;
        return roles.includes(this.session.user.role);
    }

    static protect(roles = []) {
        if (!this.authorize(roles)) {
            window.location.href = "academy-login.html";
            return false;
        }
        return true;
    }

    static hasSessionExpired(maxHours = 8) {
        if (!this.session.loginTime) return true;
        const loginTime = new Date(this.session.loginTime);
        const now = new Date();
        const elapsedHours = (now - loginTime) / (1000 * 60 * 60);
        return elapsedHours >= maxHours;
    }

    static validateSession() {
        if (!this.isAuthenticated()) return false;
        if (this.hasSessionExpired()) {
            this.logout();
            return false;
        }
        return true;
    }

    static requireLogin() {
        if (!this.validateSession()) {
            window.location.href = "academy-login.html";
            return false;
        }
        return true;
    }

    static redirectAfterLogin() {
        if (!this.isAuthenticated()) return;

        switch (this.session.user.role) {
            case "admin":
                window.location.href = "admin-dashboard.html";
                break;
            case "merchant":
                window.location.href = "merchant-dashboard.html";
                break;
            case "worker":
                window.location.href = "worker-dashboard.html";
                break;
            case "student":
            default:
                window.location.href = "academy-dashboard.html";
        }
    }

    static redirectIfAuthenticated() {
        if (this.validateSession()) {
            this.redirectAfterLogin();
        }
    }

    /**
     * ------------------------------------------------------
     * Password Management & Security
     * ------------------------------------------------------
     */

    static changePassword(currentPassword, newPassword) {
        if (!this.isAuthenticated()) {
            return { success: false, message: "User is not authenticated." };
        }

        const user = this.session.user;
        if (!this.verifyPassword(currentPassword, user.password)) {
            return { success: false, message: "Current password is incorrect." };
        }

        const strength = this.checkPasswordStrength(newPassword);
        if (!strength.valid) {
            return { success: false, message: strength.message };
        }

        user.password = newPassword;

        if (typeof UserStorage !== "undefined" && typeof UserStorage.updateUser === "function") {
            UserStorage.updateUser(user);
        }

        this.saveSession(user);
        return { success: true, message: "Password changed successfully." };
    }

    static checkPasswordStrength(password) {
        if (!password || password.length < 8) {
            return { valid: false, message: "Password must contain at least 8 characters." };
        }
        if (!/[A-Z]/.test(password)) {
            return { valid: false, message: "Password must contain an uppercase letter." };
        }
        if (!/[a-z]/.test(password)) {
            return { valid: false, message: "Password must contain a lowercase letter." };
        }
        if (!/[0-9]/.test(password)) {
            return { valid: false, message: "Password must contain a number." };
        }
        return { valid: true, message: "Strong password." };
    }

    static generateResetToken() {
        return crypto.randomUUID();
    }

    static requestPasswordReset(email) {
        const user = this.findUser(null, email);
        if (!user) {
            return { success: false, message: "Email not found." };
        }

        user.resetToken = this.generateResetToken();
        user.resetRequested = new Date().toISOString();

        if (typeof UserStorage !== "undefined" && typeof UserStorage.updateUser === "function") {
            UserStorage.updateUser(user);
        }

        return {
            success: true,
            token: user.resetToken,
            message: "Password reset token generated."
        };
    }

    static resetPassword(token, newPassword) {
        if (typeof UserStorage === "undefined" || typeof UserStorage.getUsers !== "function") {
            return { success: false, message: "User storage unavailable." };
        }

        const users = UserStorage.getUsers();
        const user = users.find(u => u.resetToken === token);

        if (!user) {
            return { success: false, message: "Invalid reset token." };
        }

        const strength = this.checkPasswordStrength(newPassword);
        if (!strength.valid) {
            return { success: false, message: strength.message };
        }

        user.password = newPassword;
        delete user.resetToken;
        delete user.resetRequested;

        if (typeof UserStorage.updateUser === "function") {
            UserStorage.updateUser(user);
        }

        return { success: true, message: "Password successfully reset." };
    }

    /**
     * ------------------------------------------------------
     * Audit & Event System
     * ------------------------------------------------------
     */

    static recordEvent(type, details = {}) {
        const event = {
            id: crypto.randomUUID(),
            type,
            timestamp: new Date().toISOString(),
            user: this.session.user ? this.session.user.username : null,
            details
        };

        this.history.push(event);
        if (this.history.length > 500) {
            this.history.shift();
        }
        return event;
    }

    static recordFailedLogin(username) {
        const count = (this.failedAttempts.get(username) || 0) + 1;
        this.failedAttempts.set(username, count);
        this.recordEvent("LOGIN_FAILED", { username, attempts: count });
    }

    static clearFailedAttempts(username) {
        this.failedAttempts.delete(username);
    }

    static getFailedAttempts(username) {
        return this.failedAttempts.get(username) || 0;
    }

    static isLocked(username, limit = 5) {
        return this.getFailedAttempts(username) >= limit;
    }

    static recordLogin(user) {
        this.clearFailedAttempts(user.username);
        this.recordEvent("LOGIN_SUCCESS", { username: user.username, role: user.role });
    }

    static recordLogout() {
        this.recordEvent("LOGOUT");
    }

    static getHistory() {
        return [...this.history];
    }

    static clearHistory() {
        this.history.length = 0;
    }

    static getStatistics() {
        return {
            authenticated: this.isAuthenticated(),
            historyEntries: this.history.length,
            failedUsers: this.failedAttempts.size,
            activeUser: this.session.user ? this.session.user.username : null
        };
    }

    static printHistory() {
        console.group("Authentication History");
        console.table(this.history);
        console.groupEnd();
    }

    static printStatistics() {
        console.group("Authentication Statistics");
        console.table(this.getStatistics());
        console.groupEnd();
    }

    /**
     * ------------------------------------------------------
     * Diagnostics & Developer Tools
     * ------------------------------------------------------
     */

    static getRuntimeInformation() {
        return {
            version: this.runtime.version,
            environment: this.runtime.environment,
            initialized: this.runtime.initialized,
            initializedAt: this.runtime.initializedAt,
            authenticated: this.isAuthenticated(),
            currentUser: this.getCurrentUser(),
            session: structuredClone(this.session),
            statistics: this.getStatistics()
        };
    }

    static exportDiagnostics() {
        return {
            runtime: this.getRuntimeInformation(),
            history: this.getHistory(),
            session: structuredClone(this.session),
            failedAttempts: Object.fromEntries(this.failedAttempts.entries())
        };
    }

    static printRuntime() {
        console.group("Auth Runtime");
        console.table(this.getRuntimeInformation());
        console.groupEnd();
    }

    static printDiagnostics() {
        console.group("Authentication Diagnostics");
        this.printRuntime();
        this.printStatistics();
        this.printHistory();
        console.groupEnd();
    }

    static reset() {
        this.logout();
        this.clearHistory();
        this.failedAttempts.clear();
        this.runtime.initialized = false;
        this.runtime.initializedAt = null;
        console.log("[Auth] Reset complete.");
    }

    static getVersion() {
        return this.runtime.version;
    }
}

/**
 * ==========================================================
 * EXPORT
 * ==========================================================
 */

window.AuthService = AuthService;