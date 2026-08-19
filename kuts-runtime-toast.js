// Intercept all form submissions globally to provide instant visual notification toasts
document.addEventListener('submit', function(event) {
    const formId = event.target.id || 'Unknown Form';
    
    // Create a non-invasive floating UI toast element dynamically
    showToastNotification(`System synchronized: Form [${formId}] successfully executed.`);
}, true);

function showToastNotification(message) {
    let toast = document.getElementById('kuts-runtime-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'kuts-runtime-toast';
        toast.style.cssText = "position:fixed; bottom:20px; right:20px; background:#0f172a; color:#34d399; border:1px solid #059669; padding:10px 15px; border-radius:8px; font-family:monospace; font-size:12px; z-index:99999; box-shadow:0 4px 12px rgba(0,0,0,0.5);";
        document.body.appendChild(toast);
    }
    toast.innerText = message;
    setTimeout(() => { toast.remove(); }, 4000);
}