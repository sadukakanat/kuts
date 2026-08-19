function fetchMasterFiscalTelemetry() {
    // Pulls data from local storage or P2P mesh gossips
    let walletState = JSON.parse(localStorage.getItem('kuts_wallet_state') || '{"balance": 0, "transactions": []}');
    
    let totalTdsCollected = walletState.transactions
        .filter(tx => tx.memo && tx.memo.includes('TDS'))
        .reduce((acc, tx) => acc + tx.amount, 0);

    document.getElementById('master-tds-pool').innerText = totalTdsCollected.toFixed(4) + " Ꝃ";
}