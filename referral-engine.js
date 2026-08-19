// core/referral-engine.js
window.KUTS_REFERRAL_ENGINE = {
    triggerReward: function(workerId, milestoneType, baseBounty) {
        // Find if this worker was referred by someone
        const registry = JSON.parse(localStorage.getItem('kuts_master_entity_registry') || '[]');
        // Alternatively, check local worker referral records
        const referralMap = JSON.parse(localStorage.getItem('kuts_referral_relationships') || '{}');
        
        const referrerId = referralMap[workerId];
        if (!referrerId) return; // No referrer found

        // Calculate reward value based on milestone
        let rewardGross = milestoneType === 'ENROLLMENT' ? 10.00 : baseBounty * 0.05; // 5% task commission
        
        // Category 12 Split Calculations
        const tds = rewardGross * 0.01;
        const rsp = rewardGross * 0.01;
        const netRealized = rewardGross * 0.98;

        // Log transaction to referrer's wallet state
        let walletState = JSON.parse(localStorage.getItem('kuts_wallet_state') || '{"balance": 0, "transactions": []}');
        walletState.balance += netRealized;
        walletState.transactions.unshift({
            timestamp: "(+00):0130.05.26.04.12.00.00.00",
            hash: "REF-REW-" + Math.floor(1000 + Math.random() * 9000),
            memo: `Referral Commission from ${workerId}`,
            counterparty: workerId,
            type: "credit",
            amount: netRealized
        });
        localStorage.setItem('kuts_wallet_state', JSON.stringify(walletState));
    }
};