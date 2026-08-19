// core/auth-injector.js

(function() {
    // 1. Determine relative path adjustment if files are in subfolders
    const isSubfolder = window.location.pathname.includes('/modules/') || window.location.pathname.split('/').length > 2;
    const prefix = isSubfolder ? '../' : '';

    // 2. Enforce Session Check (Skip if on the sign-in page)
    if (!window.location.pathname.includes('sign-in.html')) {
        const session = localStorage.getItem('kuts_active_session');
        if (!session) {
            window.location.href = prefix + 'sign-in.html';
            return;
        }
    }

    // 3. Inject the Global Header & Footer automatically on load
    window.addEventListener('DOMContentLoaded', () => {
        // Inject Header if it doesn't exist
        if (!document.getElementById('kuts-global-header')) {
            const headerHTML = `
                <header id="kuts-global-header" class="w-full max-w-7xl mx-auto p-6 flex justify-between items-center border-b border-slate-800 bg-[#030712] text-slate-200">
                    <div class="text-blue-400 font-mono font-bold tracking-widest text-sm">
                        KUTS_MESH_OPERATIONS // MDI6000
                    </div>
                    <nav id="nav-auth" class="flex gap-4 items-center font-mono">
                        <!-- Injected dynamically -->
                    </nav>
                </header>`;
            document.body.insertAdjacentHTML('afterbegin', headerHTML);
        }

        // Inject Footer Gateway Return Link if it doesn't exist
        if (!document.getElementById('kuts-global-footer') && !window.location.pathname.includes('index.html')) {
            const footerHTML = `
                <footer id="kuts-global-footer" class="max-w-7xl mx-auto mt-auto py-8 border-t border-slate-800 text-center w-full">
                    <a href="${prefix}index.html" class="inline-flex items-center gap-2 text-[0.7rem] text-slate-500 hover:text-blue-400 font-mono uppercase tracking-widest transition-all">
                        <span class="text-lg">←</span> RETURN TO UNIVERSAL GATEWAY
                    </a>
                </footer>`;
            document.body.insertAdjacentHTML('beforeend', footerHTML);
        }

        updateAuthUI(prefix);
    });

    // 4. Update Header Buttons based on Session Status
    window.updateAuthUI = function(pathPrefix = '') {
        const nav = document.getElementById('nav-auth');
        if (!nav) return;
        
        const session = localStorage.getItem('kuts_active_session');

        if (session) {
            nav.innerHTML = `
                <a href="${pathPrefix}index.html" class="text-slate-400 text-[0.65rem] uppercase font-mono hover:text-white">Gateway</a>
                <button onclick="secureLogout('${pathPrefix}')" class="bg-red-950 hover:bg-red-900 text-red-400 font-mono text-[0.65rem] px-3 py-1.5 rounded border border-red-900 uppercase tracking-widest cursor-pointer">
                    [X] DISCONNECT
                </button>`;
        } else {
            nav.innerHTML = `
                <a href="${pathPrefix}sign-in.html" class="bg-blue-900 hover:bg-blue-800 text-white font-mono text-[0.65rem] px-3 py-1.5 rounded uppercase tracking-widest">
                    SIGN IN
                </a>`;
        }
    };

    // 5. Logout Handler
    window.secureLogout = function(pathPrefix = '') {
        localStorage.removeItem('kuts_active_session');
        window.location.href = pathPrefix + 'sign-in.html';
    };
})();