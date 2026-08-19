// /core/auth-bridge.js

/**
 * Validates session; redirects to sign-in if no valid session is found.
 */
function validateSession() {
    const sessionRaw = localStorage.getItem('kuts_active_session');
    if (!sessionRaw) {
        window.location.href = './sign-in.html';
        return null;
    }
    const session = JSON.parse(sessionRaw);
    if (Date.now() > session.expiry) {
        secureLogout();
        return null;
    }
    return session;
}

/**
 * Purges session and redirects to sign-in.
 */
function secureLogout() {
    localStorage.removeItem('kuts_active_session');
    window.location.href = './sign-in.html';
}

/**
 * Injects UI elements based on auth state.
 */
function updateAuthUI() {
    const nav = document.getElementById('nav-auth');
    if (!nav) return;

    if (localStorage.getItem('kuts_active_session')) {
        nav.innerHTML = `
            <a href="index.html" class="text-slate-400 text-[0.65rem] uppercase font-mono hover:text-white">Gateway</a>
            <button onclick="secureLogout()" class="bg-red-950 hover:bg-red-900 text-red-400 font-mono text-[0.65rem] px-3 py-1.5 rounded border border-red-900 uppercase tracking-widest">
                [X] DISCONNECT
            </button>`;
    } else {
        nav.innerHTML = `
            <a href="sign-in.html" class="bg-blue-900 hover:bg-blue-800 text-white font-mono text-[0.65rem] px-3 py-1.5 rounded uppercase tracking-widest">
                SIGN IN
            </a>`;
    }
}