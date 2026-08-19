// KPE - valuation/valuator.rs
// Implements Kine valuation profiles, unit precision (Flux/Kine/Dyne), and triple-split settlement

use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum ResourceClass {
    Energy,    // kWh
    Distance,  // km (Logistics)
    Labor,     // Hours
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ProductionInput {
    pub resource_class: ResourceClass,
    pub raw_quantity: f64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SettlementResult {
    pub gross_kine: f64,
    pub flux_units: u64,
    pub kinetic_reward: f64, // 98%
    pub infrastructure_tax: f64, // 1% (TDS)
    pub regenerative_tax: f64, // 1% (RSP)
}

pub struct Valuator;

impl Valuator {
    /// Evaluates raw resource measurements into gross Kine based on documented profiles
    pub fn calculate_gross_kine(input: &ProductionInput) -> Result<f64, &'static str> {
        let gross = match input.resource_class {
            ResourceClass::Energy => input.raw_quantity / 10.0,     // 10 kWh -> 1 Kine
            ResourceClass::Distance => input.raw_quantity / 100.0,  // 100 km -> 1 Kine
            ResourceClass::Labor => input.raw_quantity / 8.0,       // 8 hours -> 1 Kine
        };

        if gross < 0.0 {
            return Err("Invalid negative resource quantity");
        }

        Ok(gross)
    }

    /// Handles precision conversion: 100 Flux = 1 Kine, 100 Kine = 1 Dyne
    pub fn to_flux_precision(kine_amount: f64) -> u64 {
        (kine_amount * 100.0).round() as u64
    }

    /// Executes the MDI6000 Triple-Split Settlement rule (98% / 1% / 1%)
    pub fn settle_triple_split(gross_kine: f64) -> SettlementResult {
        let kinetic_reward = gross_kine * 0.98;
        let infrastructure_tax = gross_kine * 0.01;
        let regenerative_tax = gross_kine * 0.01;
        let flux_units = Self::to_flux_precision(gross_kine);

        SettlementResult {
            gross_kine,
            flux_units,
            kinetic_reward,
            infrastructure_tax,
            regenerative_tax,
        }
    }
}