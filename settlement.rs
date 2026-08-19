// KPE - valuation/settlement.rs
// Implements the MDI6000 operational triple-split settlement rules

use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SplitSettlement {
    pub gross_kine: f64,
    pub kinetic_reward_98: f64,      // 98% active node-user
    pub infrastructure_tax_1: f64,   // 1% TDS / infrastructure
    pub regenerative_tax_1: f64,     // 1% RSP / regenerative
}

pub struct SettlementEngine;

impl SettlementEngine {
    /// Executes the MDI6000 98/1/1 triple-split distribution for verified transactions
    pub fn execute_split(gross_kine: f64) -> SplitSettlement {
        let kinetic_reward_98 = gross_kine * 0.98;
        let infrastructure_tax_1 = gross_kine * 0.01;
        let regenerative_tax_1 = gross_kine * 0.01;

        SplitSettlement {
            gross_kine,
            kinetic_reward_98,
            infrastructure_tax_1,
            regenerative_tax_1,
        }
    }
}