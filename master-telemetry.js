const MASTER_REGIONAL_GRIDS = [
    { code: "THRINC000", name: "Master Origin (Thrissur)", status: "OPTIMAL", load: "14.2%" },
    { code: "APAC-30", name: "Asia-Pacific Subgrid", status: "OPTIMAL", load: "68.4%" },
    { code: "EURO-24", name: "Europe & Central Asia", status: "STABLE", load: "45.1%" },
    { code: "AFR-15", name: "Africa Resource Corridor", status: "OPTIMAL", load: "32.0%" }
];

function renderRegionalGridStatus() {
    const gridContainer = document.getElementById('regional-grid-container');
    gridContainer.innerHTML = "";
    
    MASTER_REGIONAL_GRIDS.forEach(node => {
        gridContainer.innerHTML += `
            <div class="bg-slate-900/60 border border-slate-800 p-4 rounded-xl font-mono text-xs">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-blue-400 font-bold">${node.code}</span>
                    <span class="text-emerald-400 animate-pulse">● ${node.status}</span>
                </div>
                <div class="text-slate-300 font-sans text-sm font-semibold mb-1">${node.name}</div>
                <div class="flex justify-between text-slate-500 text-[0.65rem]">
                    <span>Compute Load:</span>
                    <span class="text-slate-200 font-bold">${node.load}</span>
                </div>
            </div>
        `;
    });
}