(() => {
    "use strict";

    /* =========================================================
       KUTS GLOBAL HUB
       hub.js
       ---------------------------------------------------------
       Responsibilities:
       - Read platform data from platforms.js
       - Render platform categories
       - Search name, description, category and keywords
       - Filter platforms in real time
       - Hide empty categories
       - Show result counts
       - Show no-results state
       - Open external platforms safely
       ========================================================= */


    /* =========================================================
       CONFIGURATION
       ========================================================= */

    const CONFIG = {
        gridId: "hub-grid",
        searchId: "hub-search",

        categories: [
            "AI Platforms",
            "Search Engines",
            "Social & Code"
        ],

        noResultsText: "No platforms found."
    };


    /* =========================================================
       DOM REFERENCES
       ========================================================= */

    let grid = null;
    let searchInput = null;


    /* =========================================================
       UTILITY FUNCTIONS
       ========================================================= */

    function normalize(value) {
        return String(value ?? "")
            .trim()
            .toLowerCase();
    }


    /*
     * Creates one searchable text string from the complete
     * platform record.
     *
     * This is the important improvement:
     *
     * name
     * description
     * category
     * keywords
     *
     * are all searchable.
     */

    function getSearchText(platform) {
        const keywords = Array.isArray(platform.keywords)
            ? platform.keywords
            : [];

        return [
            platform.name,
            platform.description,
            platform.category,
            ...keywords
        ]
            .map(normalize)
            .join(" ");
    }


    function isValidHttpUrl(value) {
        try {
            const url = new URL(value);

            return (
                url.protocol === "http:" ||
                url.protocol === "https:"
            );

        } catch {
            return false;
        }
    }


    /*
     * Read and validate the platform registry.
     */

    function getPlatforms() {

        if (!Array.isArray(window.platforms)) {

            console.error(
                "KUTS Global Hub: platforms.js did not provide " +
                "a valid window.platforms array."
            );

            return [];
        }


        return window.platforms.filter(platform => {

            return (
                platform &&
                typeof platform.id === "string" &&
                typeof platform.name === "string" &&
                typeof platform.url === "string" &&
                typeof platform.category === "string" &&
                isValidHttpUrl(platform.url)
            );

        });
    }


    /* =========================================================
       PLATFORM CARD
       ========================================================= */

    function createPlatformCard(platform) {

        const link = document.createElement("a");

        link.href = platform.url;

        link.target = "_blank";

        link.rel = "noopener noreferrer";

        link.className =
            "block bg-black/40 " +
            "hover:bg-blue-950/30 " +
            "border border-slate-800 " +
            "hover:border-blue-800 " +
            "p-3 rounded transition-all " +
            "flex justify-between " +
            "items-center group";


        /*
         * Store the platform ID on the element.
         * This allows us to identify the original record later.
         */

        link.dataset.platformId = platform.id;


        /* -----------------------------------------------------
           Left side
           ----------------------------------------------------- */

        const left = document.createElement("div");

        left.className = "min-w-0";


        /* Platform name */

        const name = document.createElement("span");

        name.className =
            "text-slate-200 " +
            "font-bold block truncate";

        name.textContent = platform.name;


        /* Description */

        left.appendChild(name);


        if (platform.description) {

            const description =
                document.createElement("span");

            description.className =
                "text-slate-500 " +
                "text-[0.6rem] " +
                "block mt-1 truncate";

            description.textContent =
                platform.description;

            left.appendChild(description);
        }


        /* -----------------------------------------------------
           Right side
           ----------------------------------------------------- */

        const action = document.createElement("span");

        action.className =
            "text-blue-400 " +
            "text-[0.6rem] " +
            "ml-3 " +
            "shrink-0 " +
            "group-hover:translate-x-1 " +
            "transition-transform";

        action.textContent =
            platform.action || "OPEN →";


        link.appendChild(left);

        link.appendChild(action);


        return link;
    }


    /* =========================================================
       CATEGORY
       ========================================================= */

    function createCategory(
        categoryName,
        categoryPlatforms
    ) {

        const categoryCard =
            document.createElement("section");

        categoryCard.className =
            "bg-slate-900/30 " +
            "border border-slate-800 " +
            "rounded-xl " +
            "p-4 " +
            "space-y-3 " +
            "hub-category";

        categoryCard.dataset.category =
            categoryName;


        /* -----------------------------------------------------
           Header
           ----------------------------------------------------- */

        const header =
            document.createElement("h2");

        header.className =
            "text-blue-400 " +
            "font-bold " +
            "uppercase " +
            "tracking-widest " +
            "border-b " +
            "border-slate-800 " +
            "pb-2 " +
            "flex " +
            "justify-between " +
            "items-center " +
            "gap-2";


        const title =
            document.createElement("span");

        title.textContent =
            categoryName;


        const count =
            document.createElement("span");

        count.className =
            "text-slate-500 " +
            "text-[0.6rem] " +
            "font-normal";

        count.dataset.categoryCount =
            categoryName;

        count.textContent =
            categoryPlatforms.length;


        header.appendChild(title);

        header.appendChild(count);


        /* -----------------------------------------------------
           Platform links
           ----------------------------------------------------- */

        const linksContainer =
            document.createElement("div");

        linksContainer.className =
            "space-y-2";


        categoryPlatforms.forEach(platform => {

            linksContainer.appendChild(
                createPlatformCard(platform)
            );

        });


        categoryCard.appendChild(header);

        categoryCard.appendChild(linksContainer);


        return categoryCard;
    }


    /* =========================================================
       RENDER HUB
       ========================================================= */

    function renderHub() {

        const data = getPlatforms();


        /* Clear existing content */

        grid.innerHTML = "";


        /*
         * Render the three primary categories
         * in their defined order.
         */

        CONFIG.categories.forEach(categoryName => {

            const categoryPlatforms =
                data.filter(platform =>
                    platform.category === categoryName
                );


            if (categoryPlatforms.length === 0) {
                return;
            }


            grid.appendChild(
                createCategory(
                    categoryName,
                    categoryPlatforms
                )
            );

        });


        /*
         * Future-proofing:
         *
         * If another category is added to platforms.js,
         * render it automatically after the three primary
         * categories.
         */

        const additionalCategories = [
            ...new Set(
                data
                    .map(platform => platform.category)
                    .filter(category =>
                        !CONFIG.categories.includes(category)
                    )
            )
        ];


        additionalCategories.forEach(categoryName => {

            const categoryPlatforms =
                data.filter(platform =>
                    platform.category === categoryName
                );


            grid.appendChild(
                createCategory(
                    categoryName,
                    categoryPlatforms
                )
            );

        });


        updateResultCount(data.length);

        updateNoResultsState(false);
    }


    /* =========================================================
       SEARCH / FILTER
       ========================================================= */

    function filterHub() {

        const query =
            normalize(searchInput.value);


        const categories =
            grid.querySelectorAll(
                ".hub-category"
            );


        let visiblePlatforms = 0;


        categories.forEach(category => {

            const cards =
                category.querySelectorAll(
                    "a[data-platform-id]"
                );


            let visibleInCategory = 0;


            cards.forEach(card => {

                const platformId =
                    card.dataset.platformId;


                /*
                 * Retrieve the original platform record.
                 */

                const platform =
                    window.platforms.find(
                        item =>
                            item.id === platformId
                    );


                if (!platform) {

                    card.style.display = "none";

                    return;
                }


                /*
                 * Search the COMPLETE platform record.
                 *
                 * This is the major improvement.
                 */

                const searchableText =
                    getSearchText(platform);


                const matches =
                    query === "" ||
                    searchableText.includes(query);


                card.style.display =
                    matches ? "flex" : "none";


                if (matches) {

                    visibleInCategory++;

                    visiblePlatforms++;
                }

            });


            /*
             * Hide the entire category if nothing
             * inside that category matches.
             */

            category.style.display =
                visibleInCategory > 0
                    ? ""
                    : "none";


            /*
             * Update category count.
             */

            const categoryCount =
                category.querySelector(
                    "[data-category-count]"
                );


            if (categoryCount) {

                const total =
                    cards.length;


                categoryCount.textContent =
                    query === ""
                        ? total
                        : `${visibleInCategory}/${total}`;
            }

        });


        updateResultCount(
            visiblePlatforms
        );


        updateNoResultsState(
            visiblePlatforms === 0
        );
    }


    /* =========================================================
       RESULT COUNT
       ========================================================= */

    function updateResultCount(count) {

        let resultCounter =
            document.getElementById(
                "hub-result-count"
            );


        if (!resultCounter) {

            resultCounter =
                document.createElement("span");

            resultCounter.id =
                "hub-result-count";

            resultCounter.className =
                "font-mono " +
                "text-[0.6rem] " +
                "text-slate-500 " +
                "ml-auto";


            const searchBar =
                searchInput?.parentElement;


            if (searchBar) {
                searchBar.appendChild(
                    resultCounter
                );
            }
        }


        resultCounter.textContent =
            `${count} platform` +
            `${count === 1 ? "" : "s"} found`;
    }


    /* =========================================================
       NO RESULTS
       ========================================================= */

    function updateNoResultsState(show) {

        let message =
            document.getElementById(
                "hub-no-results"
            );


        if (show) {

            if (!message) {

                message =
                    document.createElement("div");

                message.id =
                    "hub-no-results";

                message.className =
                    "col-span-full " +
                    "text-center " +
                    "py-12 " +
                    "font-mono " +
                    "text-xs " +
                    "text-slate-500";

                message.textContent =
                    CONFIG.noResultsText;

                grid.appendChild(message);
            }

        } else if (message) {

            message.remove();
        }
    }


    /* =========================================================
       KEYBOARD SHORTCUTS
       ========================================================= */

    function handleKeyboard(event) {

        /*
         * Press "/" anywhere on the page to focus search.
         */

        if (
            event.key === "/" &&
            !["INPUT", "TEXTAREA"].includes(
                document.activeElement?.tagName
            ) &&
            !document.activeElement?.isContentEditable
        ) {

            event.preventDefault();

            searchInput.focus();
        }


        /*
         * Press Escape while searching to clear.
         */

        if (
            event.key === "Escape" &&
            document.activeElement === searchInput
        ) {

            searchInput.value = "";

            filterHub();

            searchInput.blur();
        }
    }


    /* =========================================================
       INITIALIZATION
       ========================================================= */

    function initializeHub() {

        grid =
            document.getElementById(
                CONFIG.gridId
            );


        searchInput =
            document.getElementById(
                CONFIG.searchId
            );


        if (!grid) {

            console.error(
                `KUTS Global Hub: ` +
                `#${CONFIG.gridId} was not found.`
            );

            return;
        }


        if (!searchInput) {

            console.error(
                `KUTS Global Hub: ` +
                `#${CONFIG.searchId} was not found.`
            );

            return;
        }


        /*
         * Initial render.
         */

        renderHub();


        /*
         * Modern input event:
         * works for typing, paste, mobile input, etc.
         */

        searchInput.addEventListener(
            "input",
            filterHub
        );


        /*
         * Keyboard shortcuts.
         */

        document.addEventListener(
            "keydown",
            handleKeyboard
        );


        /*
         * Backward compatibility with the original
         * HTML implementation.
         */

        window.filterHub =
            filterHub;
    }


    /* =========================================================
       START
       ========================================================= */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeHub
        );

    } else {

        initializeHub();
    }

})();