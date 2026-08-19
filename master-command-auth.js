// Master Node Initialization & Authentication Check
window.addEventListener('DOMContentLoaded', () => {
    const session = JSON.parse(localStorage.getItem('kuts_active_session') || '{}');
    
    // Ensure the session is anchored to the Master Origin Node
    if (!session.nodeId || !session.nodeId.includes('THRINC000')) {
        console.warn("WARNING: Unauthorized access attempt to Master Command Center. Redirecting to Gateway.");
        window.location.href = 'index.html'; // Enforce security by redirecting to Gateway/Sign-in
        return; // Halt further execution
    }
    
    // Initialize master telemetry only if authorization passes
    if (typeof initializeMasterTelemetryStream === 'function') {
        initializeMasterTelemetryStream();
    }
});