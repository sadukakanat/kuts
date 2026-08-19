"use strict";

/**
 * ==========================================================
 * KUTS ECOSYSTEM
 * USER INTERFACE MANAGER
 * ----------------------------------------------------------
 * Version : 1.0.0
 * Purpose : Central UI management layer
 * ==========================================================
 */

class UI {

    /**
     * ------------------------------------------------------
     * Configuration
     * ------------------------------------------------------
     */

    static config = {

        version: "1.0.0",

        debug: true,

        animationDuration: 300,

        defaultTheme: "dark"

    };

    /**
     * ------------------------------------------------------
     * Runtime State
     * ------------------------------------------------------
     */

    static status = {

        initialized: false,

        theme: "dark",

        activePage: "",

        registeredElements: 0

    };

    /**
     * ------------------------------------------------------
     * Cached Elements
     * ------------------------------------------------------
     */

    static elements = new Map();

    /**
     * ------------------------------------------------------
     * Initialize UI
     * ------------------------------------------------------
     */

    static initialize() {

        if (this.status.initialized) {

            return;

        }

        this.log("Initializing UI...");

        this.detectPage();

        this.cacheElements();

        this.initializeTheme();

        this.status.initialized = true;

        this.log("UI initialized.");

    }

    /**
     * ------------------------------------------------------
     * Detect Current Page
     * ------------------------------------------------------
     */

    static detectPage() {

        this.status.activePage =
            window.location.pathname
                .split("/")
                .pop() || "index.html";

    }

    /**
     * ------------------------------------------------------
     * Cache Elements
     * ------------------------------------------------------
     */

    static cacheElements() {

        document.querySelectorAll("[id]").forEach(element => {

            this.elements.set(

                element.id,

                element

            );

        });

        this.status.registeredElements =
            this.elements.size;

    }

    /**
     * ------------------------------------------------------
     * Get Element
     * ------------------------------------------------------
     */

    static get(id) {

        if (this.elements.has(id)) {

            return this.elements.get(id);

        }

        const element =
            document.getElementById(id);

        if (element) {

            this.elements.set(id, element);

        }

        return element;

    }

    /**
     * ------------------------------------------------------
     * Register Element
     * ------------------------------------------------------
     */

    static register(id, element) {

        if (!id || !element) {

            return;

        }

        this.elements.set(id, element);

        this.status.registeredElements =
            this.elements.size;

    }

    /**
     * ------------------------------------------------------
     * Remove Element
     * ------------------------------------------------------
     */

    static unregister(id) {

        this.elements.delete(id);

        this.status.registeredElements =
            this.elements.size;

    }

    /**
     * ------------------------------------------------------
     * Element Exists
     * ------------------------------------------------------
     */

    static has(id) {

        return this.elements.has(id);

    }

    /**
     * ------------------------------------------------------
     * Query Selector
     * ------------------------------------------------------
     */

    static query(selector) {

        return document.querySelector(selector);

    }

    /**
     * ------------------------------------------------------
     * Query Selector All
     * ------------------------------------------------------
     */

    static queryAll(selector) {

        return Array.from(

            document.querySelectorAll(selector)

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

        console.log("[UI]", message);

    }

    static warn(message) {

        console.warn("[UI]", message);

    }

    static error(message) {

        console.error("[UI]", message);

    }

    /**
     * ------------------------------------------------------
     * Status
     * ------------------------------------------------------
     */

    static getStatus() {

        return structuredClone(this.status);

    }

    /**
     * ------------------------------------------------------
     * Version
     * ------------------------------------------------------
     */

    static getVersion() {

        return this.config.version;

    }

}
/**
 * ==========================================================
 * PART 2
 * DOM UTILITIES & ELEMENT MANIPULATION
 * ==========================================================
 */

/**
 * ------------------------------------------------------
 * Show Element
 * ------------------------------------------------------
 */

UI.show = function (id) {

    const element = this.get(id);

    if (!element) return false;

    element.hidden = false;
    element.style.display = "";

    return true;

};

/**
 * ------------------------------------------------------
 * Hide Element
 * ------------------------------------------------------
 */

UI.hide = function (id) {

    const element = this.get(id);

    if (!element) return false;

    element.hidden = true;
    element.style.display = "none";

    return true;

};

/**
 * ------------------------------------------------------
 * Toggle Visibility
 * ------------------------------------------------------
 */

UI.toggle = function (id) {

    const element = this.get(id);

    if (!element) return false;

    if (

        element.hidden ||

        getComputedStyle(element).display === "none"

    ) {

        this.show(id);

    }

    else {

        this.hide(id);

    }

};

/**
 * ------------------------------------------------------
 * Set Text
 * ------------------------------------------------------
 */

UI.setText = function (

    id,

    value = ""

) {

    const element = this.get(id);

    if (!element) return false;

    element.textContent = value;

    return true;

};

/**
 * ------------------------------------------------------
 * Set HTML
 * ------------------------------------------------------
 */

UI.setHTML = function (

    id,

    html = ""

) {

    const element = this.get(id);

    if (!element) return false;

    element.innerHTML = html;

    return true;

};

/**
 * ------------------------------------------------------
 * Get Text
 * ------------------------------------------------------
 */

UI.getText = function (id) {

    const element = this.get(id);

    return element

        ? element.textContent

        : null;

};

/**
 * ------------------------------------------------------
 * Add Class
 * ------------------------------------------------------
 */

UI.addClass = function (

    id,

    className

) {

    const element = this.get(id);

    if (!element) return false;

    element.classList.add(className);

    return true;

};

/**
 * ------------------------------------------------------
 * Remove Class
 * ------------------------------------------------------
 */

UI.removeClass = function (

    id,

    className

) {

    const element = this.get(id);

    if (!element) return false;

    element.classList.remove(className);

    return true;

};

/**
 * ------------------------------------------------------
 * Toggle Class
 * ------------------------------------------------------
 */

UI.toggleClass = function (

    id,

    className

) {

    const element = this.get(id);

    if (!element) return false;

    element.classList.toggle(className);

    return true;

};

/**
 * ------------------------------------------------------
 * Has Class
 * ------------------------------------------------------
 */

UI.hasClass = function (

    id,

    className

) {

    const element = this.get(id);

    if (!element) return false;

    return element.classList.contains(

        className

    );

};

/**
 * ------------------------------------------------------
 * Enable Element
 * ------------------------------------------------------
 */

UI.enable = function (id) {

    const element = this.get(id);

    if (!element) return false;

    element.disabled = false;

    return true;

};

/**
 * ------------------------------------------------------
 * Disable Element
 * ------------------------------------------------------
 */

UI.disable = function (id) {

    const element = this.get(id);

    if (!element) return false;

    element.disabled = true;

    return true;

};

/**
 * ------------------------------------------------------
 * Set Attribute
 * ------------------------------------------------------
 */

UI.setAttribute = function (

    id,

    name,

    value

) {

    const element = this.get(id);

    if (!element) return false;

    element.setAttribute(

        name,

        value

    );

    return true;

};

/**
 * ------------------------------------------------------
 * Get Attribute
 * ------------------------------------------------------
 */

UI.getAttribute = function (

    id,

    name

) {

    const element = this.get(id);

    if (!element) return null;

    return element.getAttribute(name);

};

/**
 * ------------------------------------------------------
 * Remove Attribute
 * ------------------------------------------------------
 */

UI.removeAttribute = function (

    id,

    name

) {

    const element = this.get(id);

    if (!element) return false;

    element.removeAttribute(name);

    return true;

};

/**
 * ------------------------------------------------------
 * Focus Element
 * ------------------------------------------------------
 */

UI.focus = function (id) {

    const element = this.get(id);

    if (!element) return false;

    element.focus();

    return true;

};

/**
 * ------------------------------------------------------
 * Blur Element
 * ------------------------------------------------------
 */

UI.blur = function (id) {

    const element = this.get(id);

    if (!element) return false;

    element.blur();

    return true;

};
/**
 * ==========================================================
 * PART 2A
 * TOASTS • ALERTS • MODAL MANAGER
 * ==========================================================
 */

/**
 * ------------------------------------------------------
 * UI State
 * ------------------------------------------------------
 */

UI.notifications = [];

UI.activeModal = null;

/**
 * ------------------------------------------------------
 * Show Toast
 * ------------------------------------------------------
 */

UI.showToast = function (

    message,

    type = "info",

    duration = 3000

) {

    const toast = document.createElement("div");

    toast.className = `ui-toast ui-toast-${type}`;

    toast.textContent = message;

    document.body.appendChild(toast);

    this.notifications.push(toast);

    requestAnimationFrame(() => {

        toast.classList.add("visible");

    });

    setTimeout(() => {

        toast.classList.remove("visible");

        setTimeout(() => {

            toast.remove();

            this.notifications =

                this.notifications.filter(

                    item => item !== toast

                );

        }, 300);

    }, duration);

};

/**
 * ------------------------------------------------------
 * Success Toast
 * ------------------------------------------------------
 */

UI.success = function (

    message,

    duration = 3000

) {

    this.showToast(

        message,

        "success",

        duration

    );

};

/**
 * ------------------------------------------------------
 * Error Toast
 * ------------------------------------------------------
 */

UI.errorToast = function (

    message,

    duration = 4000

) {

    this.showToast(

        message,

        "error",

        duration

    );

};

/**
 * ------------------------------------------------------
 * Warning Toast
 * ------------------------------------------------------
 */

UI.warning = function (

    message,

    duration = 3500

) {

    this.showToast(

        message,

        "warning",

        duration

    );

};

/**
 * ------------------------------------------------------
 * Information Toast
 * ------------------------------------------------------
 */

UI.info = function (

    message,

    duration = 3000

) {

    this.showToast(

        message,

        "info",

        duration

    );

};

/**
 * ------------------------------------------------------
 * Clear Toasts
 * ------------------------------------------------------
 */

UI.clearToasts = function () {

    this.notifications.forEach(toast => {

        toast.remove();

    });

    this.notifications = [];

};

/**
 * ------------------------------------------------------
 * Alert Dialog
 * ------------------------------------------------------
 */

UI.alert = function (

    message,

    title = "Alert"

) {

    window.alert(

        `${title}\n\n${message}`

    );

};

/**
 * ------------------------------------------------------
 * Confirmation Dialog
 * ------------------------------------------------------
 */

UI.confirm = function (

    message,

    onConfirm,

    onCancel = null

) {

    if (window.confirm(message)) {

        if (typeof onConfirm === "function") {

            onConfirm();

        }

    }

    else if (

        typeof onCancel === "function"

    ) {

        onCancel();

    }

};

/**
 * ------------------------------------------------------
 * Open Modal
 * ------------------------------------------------------
 */

UI.openModal = function (

    id

) {

    const modal = this.get(id);

    if (!modal) {

        return false;

    }

    modal.hidden = false;

    modal.classList.add("open");

    this.activeModal = id;

    document.body.classList.add(

        "modal-open"

    );

    return true;

};

/**
 * ------------------------------------------------------
 * Close Modal
 * ------------------------------------------------------
 */

UI.closeModal = function (

    id = this.activeModal

) {

    const modal = this.get(id);

    if (!modal) {

        return false;

    }

    modal.classList.remove("open");

    modal.hidden = true;

    document.body.classList.remove(

        "modal-open"

    );

    this.activeModal = null;

    return true;

};

/**
 * ------------------------------------------------------
 * Modal Status
 * ------------------------------------------------------
 */

UI.isModalOpen = function () {

    return this.activeModal !== null;

};

/**
 * ------------------------------------------------------
 * Toggle Modal
 * ------------------------------------------------------
 */

UI.toggleModal = function (

    id

) {

    if (

        this.activeModal === id

    ) {

        this.closeModal(id);

    }

    else {

        this.openModal(id);

    }

};

/**
 * ------------------------------------------------------
 * Close Active Modal (ESC)
 * ------------------------------------------------------
 */

document.addEventListener(

    "keydown",

    event => {

        if (

            event.key === "Escape" &&

            UI.isModalOpen()

        ) {

            UI.closeModal();

        }

    }

);
/**
 * ==========================================================
 * PART 2B
 * LOADING & PROGRESS MANAGER
 * ==========================================================
 */

/**
 * ------------------------------------------------------
 * Loading State
 * ------------------------------------------------------
 */

UI.loading = {

    active: false,

    overlay: null,

    progress: 0

};

/**
 * ------------------------------------------------------
 * Show Loading Overlay
 * ------------------------------------------------------
 */

UI.showLoader = function (message = "Loading...") {

    if (this.loading.overlay) {

        this.setLoaderMessage(message);

        return;

    }

    const overlay = document.createElement("div");

    overlay.className = "ui-loader-overlay";

    overlay.innerHTML = `
        <div class="ui-loader-box">
            <div class="ui-loader-spinner"></div>
            <div class="ui-loader-message">${message}</div>
        </div>
    `;

    document.body.appendChild(overlay);

    this.loading.overlay = overlay;

    this.loading.active = true;

};

/**
 * ------------------------------------------------------
 * Hide Loading Overlay
 * ------------------------------------------------------
 */

UI.hideLoader = function () {

    if (!this.loading.overlay) {

        return;

    }

    this.loading.overlay.remove();

    this.loading.overlay = null;

    this.loading.active = false;

};

/**
 * ------------------------------------------------------
 * Update Loader Message
 * ------------------------------------------------------
 */

UI.setLoaderMessage = function (message) {

    if (!this.loading.overlay) {

        return;

    }

    const label =

        this.loading.overlay.querySelector(

            ".ui-loader-message"

        );

    if (label) {

        label.textContent = message;

    }

};

/**
 * ------------------------------------------------------
 * Loading Status
 * ------------------------------------------------------
 */

UI.isLoading = function () {

    return this.loading.active;

};

/**
 * ------------------------------------------------------
 * Button Loading
 * ------------------------------------------------------
 */

UI.startButtonLoading = function (

    id,

    text = "Loading..."

) {

    const button = this.get(id);

    if (!button) {

        return false;

    }

    button.dataset.originalText =

        button.innerHTML;

    button.disabled = true;

    button.innerHTML =

        `<span class="ui-button-spinner"></span> ${text}`;

    return true;

};

/**
 * ------------------------------------------------------
 * Stop Button Loading
 * ------------------------------------------------------
 */

UI.stopButtonLoading = function (id) {

    const button = this.get(id);

    if (!button) {

        return false;

    }

    button.disabled = false;

    if (button.dataset.originalText) {

        button.innerHTML =

            button.dataset.originalText;

    }

    return true;

};

/**
 * ------------------------------------------------------
 * Create Progress Bar
 * ------------------------------------------------------
 */

UI.createProgressBar = function (id) {

    const container = this.get(id);

    if (!container) {

        return false;

    }

    container.innerHTML =

        `<div class="ui-progress">
            <div class="ui-progress-bar"></div>
        </div>`;

    return true;

};

/**
 * ------------------------------------------------------
 * Update Progress
 * ------------------------------------------------------
 */

UI.setProgress = function (

    id,

    value

) {

    const container = this.get(id);

    if (!container) {

        return false;

    }

    const bar =

        container.querySelector(

            ".ui-progress-bar"

        );

    if (!bar) {

        return false;

    }

    value = Math.max(

        0,

        Math.min(100, value)

    );

    bar.style.width = `${value}%`;

    this.loading.progress = value;

    return true;

};

/**
 * ------------------------------------------------------
 * Reset Progress
 * ------------------------------------------------------
 */

UI.resetProgress = function (id) {

    return this.setProgress(id, 0);

};

/**
 * ------------------------------------------------------
 * Complete Progress
 * ------------------------------------------------------
 */

UI.completeProgress = function (id) {

    return this.setProgress(id, 100);

};

/**
 * ------------------------------------------------------
 * Get Loading Information
 * ------------------------------------------------------
 */

UI.getLoadingInformation = function () {

    return {

        active: this.loading.active,

        progress: this.loading.progress

    };

};
/**
 * ==========================================================
 * PART 2C
 * FORMS • VALIDATION • USER FEEDBACK
 * ==========================================================
 */

/**
 * ------------------------------------------------------
 * Get Form Data
 * ------------------------------------------------------
 */

UI.getFormData = function (formId) {

    const form = this.get(formId);

    if (!form) {

        return null;

    }

    const formData = new FormData(form);

    return Object.fromEntries(formData.entries());

};

/**
 * ------------------------------------------------------
 * Fill Form
 * ------------------------------------------------------
 */

UI.fillForm = function (formId, data = {}) {

    const form = this.get(formId);

    if (!form) {

        return false;

    }

    Object.entries(data).forEach(([name, value]) => {

        const field = form.elements[name];

        if (!field) {

            return;

        }

        if (

            field.type === "checkbox"

        ) {

            field.checked = Boolean(value);

        }

        else if (

            field.type === "radio"

        ) {

            if (field.value == value) {

                field.checked = true;

            }

        }

        else {

            field.value = value;

        }

    });

    return true;

};

/**
 * ------------------------------------------------------
 * Reset Form
 * ------------------------------------------------------
 */

UI.resetForm = function (formId) {

    const form = this.get(formId);

    if (!form) {

        return false;

    }

    form.reset();

    this.clearValidation(formId);

    return true;

};

/**
 * ------------------------------------------------------
 * Validate Required Fields
 * ------------------------------------------------------
 */

UI.validateRequired = function (formId) {

    const form = this.get(formId);

    if (!form) {

        return false;

    }

    let valid = true;

    form.querySelectorAll("[required]").forEach(field => {

        if (

            String(field.value).trim() === ""

        ) {

            field.classList.add("ui-invalid");

            valid = false;

        }

        else {

            field.classList.remove("ui-invalid");

        }

    });

    return valid;

};

/**
 * ------------------------------------------------------
 * Show Field Error
 * ------------------------------------------------------
 */

UI.showFieldError = function (

    fieldId,

    message

) {

    const field = this.get(fieldId);

    if (!field) {

        return false;

    }

    field.classList.add("ui-invalid");

    field.setAttribute(

        "data-error",

        message

    );

    return true;

};

/**
 * ------------------------------------------------------
 * Clear Field Error
 * ------------------------------------------------------
 */

UI.clearFieldError = function (

    fieldId

) {

    const field = this.get(fieldId);

    if (!field) {

        return false;

    }

    field.classList.remove("ui-invalid");

    field.removeAttribute("data-error");

    return true;

};

/**
 * ------------------------------------------------------
 * Clear Validation
 * ------------------------------------------------------
 */

UI.clearValidation = function (

    formId

) {

    const form = this.get(formId);

    if (!form) {

        return false;

    }

    form.querySelectorAll(".ui-invalid").forEach(field => {

        field.classList.remove("ui-invalid");

        field.removeAttribute("data-error");

    });

    return true;

};

/**
 * ------------------------------------------------------
 * Enable Form
 * ------------------------------------------------------
 */

UI.enableForm = function (

    formId

) {

    const form = this.get(formId);

    if (!form) {

        return false;

    }

    Array.from(form.elements).forEach(element => {

        element.disabled = false;

    });

    return true;

};

/**
 * ------------------------------------------------------
 * Disable Form
 * ------------------------------------------------------
 */

UI.disableForm = function (

    formId

) {

    const form = this.get(formId);

    if (!form) {

        return false;

    }

    Array.from(form.elements).forEach(element => {

        element.disabled = true;

    });

    return true;

};

/**
 * ------------------------------------------------------
 * Focus First Invalid Field
 * ------------------------------------------------------
 */

UI.focusFirstInvalid = function (

    formId

) {

    const form = this.get(formId);

    if (!form) {

        return false;

    }

    const field = form.querySelector(

        ".ui-invalid"

    );

    if (field) {

        field.focus();

    }

};

/**
 * ------------------------------------------------------
 * Character Counter
 * ------------------------------------------------------
 */

UI.bindCharacterCounter = function (

    inputId,

    counterId,

    maxLength = null

) {

    const input = this.get(inputId);

    const counter = this.get(counterId);

    if (!input || !counter) {

        return false;

    }

    const update = () => {

        const length = input.value.length;

        counter.textContent = maxLength

            ? `${length}/${maxLength}`

            : length;

    };

    input.addEventListener(

        "input",

        update

    );

    update();

    return true;

};

/**
 * ------------------------------------------------------
 * Flash Element
 * ------------------------------------------------------
 */

UI.flash = function (

    id,

    className = "ui-flash",

    duration = 800

) {

    const element = this.get(id);

    if (!element) {

        return false;

    }

    element.classList.add(className);

    setTimeout(() => {

        element.classList.remove(className);

    }, duration);

    return true;

};

/**
 * ------------------------------------------------------
 * Scroll To Element
 * ------------------------------------------------------
 */

UI.scrollTo = function (

    id,

    behavior = "smooth"

) {

    const element = this.get(id);

    if (!element) {

        return false;

    }

    element.scrollIntoView({

        behavior,

        block: "center"

    });

    return true;

};
/**
 * ==========================================================
 * PART 3
 * DASHBOARD WIDGETS & LIVE UI UPDATES
 * ==========================================================
 */

/**
 * ------------------------------------------------------
 * Widget Registry
 * ------------------------------------------------------
 */

UI.widgets = new Map();

/**
 * ------------------------------------------------------
 * Register Widget
 * ------------------------------------------------------
 */

UI.registerWidget = function (

    name,

    widget

) {

    if (!name || typeof name !== "string") {

        this.warn("Invalid widget name.");

        return false;

    }

    this.widgets.set(name, {

        name,

        instance: widget,

        registeredAt: new Date().toISOString()

    });

    this.log(`Widget registered: ${name}`);

    return true;

};

/**
 * ------------------------------------------------------
 * Get Widget
 * ------------------------------------------------------
 */

UI.getWidget = function (name) {

    const widget = this.widgets.get(name);

    return widget ? widget.instance : null;

};

/**
 * ------------------------------------------------------
 * Remove Widget
 * ------------------------------------------------------
 */

UI.unregisterWidget = function (name) {

    return this.widgets.delete(name);

};

/**
 * ------------------------------------------------------
 * List Widgets
 * ------------------------------------------------------
 */

UI.listWidgets = function () {

    return Array.from(this.widgets.keys());

};

/**
 * ------------------------------------------------------
 * Update Counter
 * ------------------------------------------------------
 */

UI.updateCounter = function (

    id,

    value

) {

    const element = this.get(id);

    if (!element) {

        return false;

    }

    element.textContent = Number(value).toLocaleString();

    return true;

};

/**
 * ------------------------------------------------------
 * Update Status Badge
 * ------------------------------------------------------
 */

UI.setStatus = function (

    id,

    text,

    type = "default"

) {

    const element = this.get(id);

    if (!element) {

        return false;

    }

    element.textContent = text;

    element.className = `ui-status ui-status-${type}`;

    return true;

};

/**
 * ------------------------------------------------------
 * Update Timestamp
 * ------------------------------------------------------
 */

UI.updateTimestamp = function (

    id,

    date = new Date()

) {

    const element = this.get(id);

    if (!element) {

        return false;

    }

    element.textContent =

        date.toLocaleString();

    return true;

};

/**
 * ------------------------------------------------------
 * Update Dashboard Card
 * ------------------------------------------------------
 */

UI.updateCard = function (

    id,

    {

        title,

        value,

        subtitle

    } = {}

) {

    const card = this.get(id);

    if (!card) {

        return false;

    }

    const titleElement =
        card.querySelector(".ui-card-title");

    const valueElement =
        card.querySelector(".ui-card-value");

    const subtitleElement =
        card.querySelector(".ui-card-subtitle");

    if (titleElement && title !== undefined) {

        titleElement.textContent = title;

    }

    if (valueElement && value !== undefined) {

        valueElement.textContent = value;

    }

    if (

        subtitleElement &&

        subtitle !== undefined

    ) {

        subtitleElement.textContent = subtitle;

    }

    return true;

};

/**
 * ------------------------------------------------------
 * Refresh Widget
 * ------------------------------------------------------
 */

UI.refreshWidget = function (

    name

) {

    const widget = this.getWidget(name);

    if (!widget) {

        return false;

    }

    if (

        typeof widget.refresh === "function"

    ) {

        widget.refresh();

    }

    return true;

};

/**
 * ------------------------------------------------------
 * Refresh All Widgets
 * ------------------------------------------------------
 */

UI.refreshWidgets = function () {

    this.widgets.forEach(entry => {

        const widget = entry.instance;

        if (

            widget &&

            typeof widget.refresh === "function"

        ) {

            widget.refresh();

        }

    });

};

/**
 * ------------------------------------------------------
 * Dashboard Summary
 * ------------------------------------------------------
 */

UI.getDashboardInformation = function () {

    return {

        widgets:

            this.widgets.size,

        registered:

            this.listWidgets(),

        initialized:

            this.status.initialized,

        page:

            this.status.activePage

    };

};
/**
 * ==========================================================
 * PART 3A
 * THEME MANAGER & APPEARANCE
 * ==========================================================
 */

/**
 * ------------------------------------------------------
 * Theme Configuration
 * ------------------------------------------------------
 */

UI.theme = {

    current: "dark",

    storageKey: "kuts_ui_theme",

    supported: [

        "light",

        "dark",

        "system"

    ]

};

/**
 * ------------------------------------------------------
 * Apply Theme
 * ------------------------------------------------------
 */

UI.applyTheme = function (theme) {

    if (

        !this.theme.supported.includes(theme)

    ) {

        this.warn(`Unsupported theme: ${theme}`);

        return false;

    }

    let activeTheme = theme;

    if (theme === "system") {

        activeTheme =

            window.matchMedia(

                "(prefers-color-scheme: dark)"

            ).matches

                ? "dark"

                : "light";

    }

    document.documentElement.setAttribute(

        "data-theme",

        activeTheme

    );

    this.theme.current = theme;

    this.status.theme = activeTheme;

    this.saveTheme();

    this.log(`Theme applied: ${activeTheme}`);

    return true;

};

/**
 * ------------------------------------------------------
 * Save Theme
 * ------------------------------------------------------
 */

UI.saveTheme = function () {

    try {

        localStorage.setItem(

            this.theme.storageKey,

            this.theme.current

        );

    }

    catch (error) {

        this.warn("Unable to save theme.");

    }

};

/**
 * ------------------------------------------------------
 * Load Theme
 * ------------------------------------------------------
 */

UI.loadTheme = function () {

    try {

        const saved = localStorage.getItem(

            this.theme.storageKey

        );

        if (

            saved &&

            this.theme.supported.includes(saved)

        ) {

            this.applyTheme(saved);

        }

        else {

            this.applyTheme(

                this.config.defaultTheme

            );

        }

    }

    catch (error) {

        this.applyTheme(

            this.config.defaultTheme

        );

    }

};

/**
 * ------------------------------------------------------
 * Toggle Theme
 * ------------------------------------------------------
 */

UI.toggleTheme = function () {

    const next =

        this.status.theme === "dark"

            ? "light"

            : "dark";

    this.applyTheme(next);

};

/**
 * ------------------------------------------------------
 * Current Theme
 * ------------------------------------------------------
 */

UI.getTheme = function () {

    return this.theme.current;

};

/**
 * ------------------------------------------------------
 * System Theme Listener
 * ------------------------------------------------------
 */

UI.registerThemeListener = function () {

    const media = window.matchMedia(

        "(prefers-color-scheme: dark)"

    );

    media.addEventListener(

        "change",

        () => {

            if (

                this.theme.current === "system"

            ) {

                this.applyTheme("system");

            }

        }

    );

};

/**
 * ------------------------------------------------------
 * Theme Information
 * ------------------------------------------------------
 */

UI.getThemeInformation = function () {

    return {

        current:

            this.theme.current,

        active:

            this.status.theme,

        supported:

            [...this.theme.supported]

    };

};

/**
 * ------------------------------------------------------
 * Initialize Theme Manager
 * ------------------------------------------------------
 */

UI.initializeTheme = function () {

    this.loadTheme();

    this.registerThemeListener();

    this.log("Theme manager initialized.");

};
/**
 * ==========================================================
 * PART 3B
 * ANIMATIONS • TRANSITIONS • VISUAL EFFECTS
 * ==========================================================
 */

/**
 * ------------------------------------------------------
 * Animation Configuration
 * ------------------------------------------------------
 */

UI.animations = {

    enabled: true,

    duration: 300,

    easing: "ease"

};

/**
 * ------------------------------------------------------
 * Animate Element
 * ------------------------------------------------------
 */

UI.animate = function (

    id,

    animation,

    duration = this.animations.duration

) {

    const element = this.get(id);

    if (!element || !this.animations.enabled) {

        return false;

    }

    element.style.animationDuration = `${duration}ms`;

    element.classList.add(animation);

    const cleanup = () => {

        element.classList.remove(animation);

        element.removeEventListener(

            "animationend",

            cleanup

        );

    };

    element.addEventListener(

        "animationend",

        cleanup

    );

    return true;

};

/**
 * ------------------------------------------------------
 * Fade In
 * ------------------------------------------------------
 */

UI.fadeIn = function (

    id,

    duration = this.animations.duration

) {

    this.show(id);

    return this.animate(

        id,

        "ui-fade-in",

        duration

    );

};

/**
 * ------------------------------------------------------
 * Fade Out
 * ------------------------------------------------------
 */

UI.fadeOut = function (

    id,

    duration = this.animations.duration

) {

    const element = this.get(id);

    if (!element) {

        return false;

    }

    this.animate(

        id,

        "ui-fade-out",

        duration

    );

    setTimeout(() => {

        this.hide(id);

    }, duration);

    return true;

};

/**
 * ------------------------------------------------------
 * Slide Down
 * ------------------------------------------------------
 */

UI.slideDown = function (

    id,

    duration = this.animations.duration

) {

    this.show(id);

    return this.animate(

        id,

        "ui-slide-down",

        duration

    );

};

/**
 * ------------------------------------------------------
 * Slide Up
 * ------------------------------------------------------
 */

UI.slideUp = function (

    id,

    duration = this.animations.duration

) {

    const element = this.get(id);

    if (!element) {

        return false;

    }

    this.animate(

        id,

        "ui-slide-up",

        duration

    );

    setTimeout(() => {

        this.hide(id);

    }, duration);

    return true;

};

/**
 * ------------------------------------------------------
 * Pulse
 * ------------------------------------------------------
 */

UI.pulse = function (

    id

) {

    return this.animate(

        id,

        "ui-pulse"

    );

};

/**
 * ------------------------------------------------------
 * Shake
 * ------------------------------------------------------
 */

UI.shake = function (

    id

) {

    return this.animate(

        id,

        "ui-shake"

    );

};

/**
 * ------------------------------------------------------
 * Bounce
 * ------------------------------------------------------
 */

UI.bounce = function (

    id

) {

    return this.animate(

        id,

        "ui-bounce"

    );

};

/**
 * ------------------------------------------------------
 * Highlight
 * ------------------------------------------------------
 */

UI.highlight = function (

    id

) {

    return this.animate(

        id,

        "ui-highlight"

    );

};

/**
 * ------------------------------------------------------
 * Page Transition
 * ------------------------------------------------------
 */

UI.transitionPage = function (

    callback,

    duration = this.animations.duration

) {

    document.body.classList.add(

        "ui-page-transition"

    );

    setTimeout(() => {

        if (typeof callback === "function") {

            callback();

        }

        document.body.classList.remove(

            "ui-page-transition"

        );

    }, duration);

};

/**
 * ------------------------------------------------------
 * Enable Animations
 * ------------------------------------------------------
 */

UI.enableAnimations = function () {

    this.animations.enabled = true;

};

/**
 * ------------------------------------------------------
 * Disable Animations
 * ------------------------------------------------------
 */

UI.disableAnimations = function () {

    this.animations.enabled = false;

};

/**
 * ------------------------------------------------------
 * Animation Status
 * ------------------------------------------------------
 */

UI.getAnimationInformation = function () {

    return {

        enabled: this.animations.enabled,

        duration: this.animations.duration,

        easing: this.animations.easing

    };

};
/**
 * ==========================================================
 * PART 3C
 * DIAGNOSTICS • DEVELOPER TOOLS • INITIALIZATION
 * ==========================================================
 */

/**
 * ------------------------------------------------------
 * Runtime Statistics
 * ------------------------------------------------------
 */

UI.runtime = {

    startedAt: Date.now(),

    initializedAt: null,

    initialized: false,

    interactionCount: 0,

    activeModals: 0,

    animationsExecuted: 0

};

/**
 * ------------------------------------------------------
 * Record Interaction
 * ------------------------------------------------------
 */

UI.recordInteraction = function () {

    this.runtime.interactionCount++;

};

/**
 * ------------------------------------------------------
 * Record Animation
 * ------------------------------------------------------
 */

UI.recordAnimation = function () {

    this.runtime.animationsExecuted++;

};

/**
 * ------------------------------------------------------
 * Record Modal Open
 * ------------------------------------------------------
 */

UI.recordModalOpen = function () {

    this.runtime.activeModals++;

};

/**
 * ------------------------------------------------------
 * Record Modal Close
 * ------------------------------------------------------
 */

UI.recordModalClose = function () {

    if (this.runtime.activeModals > 0) {

        this.runtime.activeModals--;

    }

};

/**
 * ------------------------------------------------------
 * Uptime
 * ------------------------------------------------------
 */

UI.getUptime = function () {

    return Date.now() - this.runtime.startedAt;

};

/**
 * ------------------------------------------------------
 * Health Report
 * ------------------------------------------------------
 */

UI.getHealthReport = function () {

    return {

        initialized:

            this.status.initialized,

        page:

            this.status.activePage,

        theme:

            this.getTheme(),

        widgets:

            this.widgets.size,

        cachedElements:

            this.elements.size,

        loading:

            this.loading.active,

        activeModal:

            this.activeModal,

        uptime:

            this.getUptime()

    };

};

/**
 * ------------------------------------------------------
 * Export Diagnostics
 * ------------------------------------------------------
 */

UI.exportDiagnostics = function () {

    return {

        config:

            structuredClone(this.config),

        status:

            this.getStatus(),

        runtime:

            structuredClone(this.runtime),

        health:

            this.getHealthReport(),

        theme:

            this.getThemeInformation(),

        dashboard:

            this.getDashboardInformation(),

        animations:

            this.getAnimationInformation(),

        loading:

            this.getLoadingInformation()

    };

};

/**
 * ------------------------------------------------------
 * Print Diagnostics
 * ------------------------------------------------------
 */

UI.printDiagnostics = function () {

    console.group("KUTS UI Diagnostics");

    console.table(this.exportDiagnostics());

    console.groupEnd();

};

/**
 * ------------------------------------------------------
 * Reset Runtime Statistics
 * ------------------------------------------------------
 */

UI.resetRuntime = function () {

    this.runtime.startedAt = Date.now();

    this.runtime.interactionCount = 0;

    this.runtime.activeModals = 0;

    this.runtime.animationsExecuted = 0;

};

/**
 * ------------------------------------------------------
 * Version
 * ------------------------------------------------------
 */

UI.getVersion = function () {

    return this.config.version;

};

/**
 * ------------------------------------------------------
 * Final Initialization
 * ------------------------------------------------------
 */

UI.initializeRuntime = function () {

    this.runtime.initialized = true;

    this.runtime.initializedAt =

        new Date().toISOString();

    this.log("UI runtime initialized.");

};

/**
 * ------------------------------------------------------
 * Automatic Startup
 * ------------------------------------------------------
 */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        UI.initialize();

        UI.initializeRuntime();

    }

);
