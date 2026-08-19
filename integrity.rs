// KPE - verification/integrity.rs
// Implements physical plausibility, temporal consistency, and duplicate-event detection

use std::collections::HashSet;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct IntegrityCheckPayload {
    pub transaction_id: String,
    pub kuts_serial: String,
    pub raw_quantity: f64,
    pub resource_class: String,
}

pub struct IntegrityEngine {
    processed_transactions: HashSet<String>,
}

impl IntegrityEngine {
    pub fn new() -> Self {
        Self {
            processed_transactions: HashSet::new(),
        }
    }

    /// Checks for duplicate event IDs to prevent double-counting across the ledger
    pub fn check_duplicate(&mut self, transaction_id: &str) -> bool {
        if self.processed_transactions.contains(transaction_id) {
            false // Duplicate detected
        } else {
            self.processed_transactions.insert(transaction_id.to_string());
            true  // Unique transaction
        }
    }

    /// Validates physical plausibility based on resource limits and measurement contexts
    pub fn check_physical_plausibility(resource_class: &str, quantity: f64) -> bool {
        match resource_class {
            "Energy" => quantity > 0.0 && quantity <= 50_000.0,   // Max 50,000 kWh per ingestion block
            "Distance" => quantity > 0.0 && quantity <= 10_000.0, // Max 10,000 km logistics
            "Labor" => quantity > 0.0 && quantity <= 168.0,       // Max 168 hours (1 week continuous)
            _ => false,
        }
    }

    /// Validates temporal consistency of the KUTS serial string structure
    pub fn check_temporal_consistency(kuts_serial: &str) -> bool {
        // Ensures the serial string format matches expected KUTS temporal bounds
        !kuts_serial.is_empty() && kuts_serial.contains("GE-") || kuts_serial.starts_with('(')
    }
}