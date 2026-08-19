// Inside core/auth-bridge.js or a dedicated initialization script
window.addEventListener('DOMContentLoaded', () => {
    const targetList = document.querySelector('#moduleGrid ul');
    if (targetList && !window.location.pathname.includes('some-page.html')) {
        // Example of dynamically appending a new module link
        // targetList.insertAdjacentHTML('beforeend', '<li><a href="your-module.html">→ Your Module Name</a></li>');
    }
});