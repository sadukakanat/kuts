/**
 * ============================================================
 * KUTS Ecosystem
 * Module : Signup Validator
 * File   : signup-validator.js
 * Purpose: Validate signup form data
 * Version: 0.0.1
 * ============================================================
 */

class SignupValidator {

    /**
     * Validate complete signup form
     * @param {Object} formData
     * @returns {{valid:boolean, errors:string[]}}
     */
    static validate(formData) {

        const errors = [];

        // First Name
        if (!this.isRequired(formData.firstName)) {
            errors.push("First name is required.");
        }

        // Last Name
        if (!this.isRequired(formData.lastName)) {
            errors.push("Last name is required.");
        }

        // Email
        if (!this.isRequired(formData.email)) {
            errors.push("Email is required.");
        }
        else if (!this.isValidEmail(formData.email)) {
            errors.push("Invalid email address.");
        }

        // Phone
        if (!this.isRequired(formData.phone)) {
            errors.push("Phone number is required.");
        }
        else if (!this.isValidPhone(formData.phone)) {
            errors.push("Invalid phone number.");
        }

        // Password
        if (!this.isRequired(formData.password)) {
            errors.push("Password is required.");
        }
        else if (!this.isStrongPassword(formData.password)) {
            errors.push(
                "Password must contain at least 8 characters, one uppercase letter, one lowercase letter and one number."
            );
        }

        // Confirm Password
        if (formData.password !== formData.confirmPassword) {
            errors.push("Passwords do not match.");
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Required field
     */
    static isRequired(value) {
        return value !== undefined &&
               value !== null &&
               String(value).trim() !== "";
    }

    /**
     * Email validation
     */
    static isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    /**
     * Phone validation
     * Allows 10–15 digits with optional +
     */
    static isValidPhone(phone) {
        const regex = /^\+?[0-9]{10,15}$/;
        return regex.test(phone);
    }

    /**
     * Password strength
     */
    static isStrongPassword(password) {
        const regex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

        return regex.test(password);
    }

}