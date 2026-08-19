/**
 * KUTS Currency Conversion Engine (Layer 07 - High Efficiency)
 * Translates standard financial denominations into native Kine units.
 */

const KUTS_CURRENCY = {
    // Dynamic exchange variables matching economic production parameters
    rates: {
        INR_TO_KINE: 0.125, // e.g., 8 INR = 1 Kine baseline unit
        USD_TO_KINE: 10.50  // e.g., 1 USD = 10.50 Kine baseline units
    },

    /**
     * Converts fiat currencies into system metrics and dispatches an audit log
     */
    convertAndLog(amount, currencyType, nodeAddress = "NODE-FX-CONVERTER") {
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) return null;

        let calculatedKine = 0;
        let description = "";

        if (currencyType.toUpperCase() === "INR") {
            calculatedKine = val * this.rates.INR_TO_KINE;
            description = `Financial Ingestion: Converted ₹${val.toFixed(2)} INR into system yield.`;
        } else if (currencyType.toUpperCase() === "USD") {
            calculatedKine = val * this.rates.USD_TO_KINE;
            description = `Financial Ingestion: Converted $${val.toFixed(2)} USD into system yield.`;
        } else {
            return null;
        }

        // Round cleanly to 4 decimal places to match validator requirements
        calculatedKine = Math.round(calculatedKine * 10000) / 10000;

        // Dispatch transaction block directly to the central ledger via the bridge
        if (typeof KUTS_BRIDGE !== 'undefined') {
            return KUTS_BRIDGE.executeTransaction(nodeAddress, "NODE-USR-TCR-884", calculatedKine, description);
        }
        return null;
    }
};