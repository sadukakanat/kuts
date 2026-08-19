/**
 * KUTS Data Exporter Engine (Layer 04 - Data Portability Core)
 * Handles backup snapshot generation, CSV transformation, and local file restoration.
 */

const KUTS_EXPORTER = {
    // Collect all system keys from browser localStorage and compile into a single structured object
    createSystemSnapshot() {
        const snapshot = {
            metadata: {
                system: "KUTS_EXECUTION_GRID",
                layer: "04_SCALE_OUT",
                compiledAt: new Date().toISOString(),
                schemaVersion: "2.0.0"
            },
            storageData: {
                wallet: JSON.parse(localStorage.getItem('kuts_directory_wallet')) || null,
                auditLogs: JSON.parse(localStorage.getItem('kuts_directory_audit_logs')) || [],
                entities: JSON.parse(localStorage.getItem('kuts_directory_entities')) || []
            }
        };
        return snapshot;
    },

    // Download the compiled system data snapshot as a formatted JSON file
    exportToJSON() {
        const snapshot = this.createSystemSnapshot();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snapshot, null, 4));
        const downloadAnchor = document.createElement('a');
        
        const now = new Date();
        const fileTimestamp = `${now.getFullYear()}${((now.getMonth()+1)).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}`;
        
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `KUTS_SYSTEM_SNAPSHOT_${fileTimestamp}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    },

    // Transform the live transaction stream logs into a clean comma-separated values (CSV) matrix
    exportLedgerToCSV() {
        const logs = JSON.parse(localStorage.getItem('kuts_directory_audit_logs')) || [];
        if (logs.length === 0) {
            alert("Exporter Alert: The active transaction audit log stream contains no items to compile.");
            return;
        }

        // Define clean standard header parameters matching KUTS ledger matrices
        let csvContent = "Audit Key,Timestamp Signature,Source Route ID,Target Destination,Gross Block (Kine),1% TDS Sweep (Kine),Architect Royalty (Kine),Net Settled (Kine),Manifest Description\n";

        logs.forEach(log => {
            // Sanitize description text string to prevent CSV layout breaks
            const safeDesc = log.desc ? log.desc.replace(/"/g, '""') : "";
            
            csvContent += `"${log.id}","${log.timestamp}","${log.source}","${log.target}",${log.gross},${log.tds},${log.royalty || 0.00},${log.net},"${safeDesc}"\n`;
        });

        const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
        const downloadAnchor = document.createElement('a');
        
        const now = new Date();
        const fileTimestamp = `${now.getFullYear()}${((now.getMonth()+1)).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}`;

        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `KUTS_LEDGER_EXPORT_${fileTimestamp}.csv`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    },

    // Ingest a valid system JSON backup packet and reconstruct browser local memory components accurately
    importSystemSnapshot(jsonString) {
        try {
            const parsedData = JSON.parse(jsonString);
            
            // Structural integrity check to guard baseline runtime attributes
            if (!parsedData.storageData || !parsedData.metadata || parsedData.metadata.system !== "KUTS_EXECUTION_GRID") {
                throw new Error("Invalid system signature detected in backup package metadata parameters.");
            }

            const data = parsedData.storageData;
            
            if (data.wallet) localStorage.setItem('kuts_directory_wallet', JSON.stringify(data.wallet));
            if (data.auditLogs) localStorage.setItem('kuts_directory_audit_logs', JSON.stringify(data.auditLogs));
            if (data.entities) localStorage.setItem('kuts_directory_entities', JSON.stringify(data.entities));

            // Broadcast storage change notice to sync up all active window views immediately
            window.dispatchEvent(new Event('storage'));
            return true;
        } catch (error) {
            console.error("Critical Import Defect:", error);
            alert(`State Restructure Aborted: ${error.message}`);
            return false;
        }
    }
};