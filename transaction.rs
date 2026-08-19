// KPE - ledger/transaction.rs
// Defines the minimum KPE transaction record model for the Global Resource Ledger

use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct KpeTransactionRecord {
    pub transaction_id: String,           // Cryptographic identifier
    pub kuts_serial: String,              // KUTS serial string binding
    pub originating_node_id: String,      // Originating Anchor/Edge Node ID
    pub producer_identity: String,        // Producer / user reference
    pub resource_class: String,           // Energy, Distance, Labor, etc.
    pub raw_quantity: f64,                // Raw measured value
    pub valuation_profile_id: String,     // Valuation profile version/ID
    pub gross_kine: f64,                  // Calculated gross Kine amount
    pub flux_precision_units: u64,        // Flux precision units
    pub kinetic_reward: f64,              // 98% split
    pub infrastructure_tax: f64,          // 1% TDS split
    pub regenerative_tax: f64,            // 1% RSP split
    pub audit_status: String,             // SAP audit pass/fail status
    pub timestamp: i64,                   // Creation Unix timestamp
}