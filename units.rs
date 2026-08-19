// KPE - valuation/units.rs
// Manages precise unit conversions across Flux, Kine, and Dyne

pub struct UnitPrecision;

impl UnitPrecision {
    /// Converts Kine into the smallest transactional unit (Flux) where 100 Flux = 1 Kine
    pub fn kine_to_flux(kine: f64) -> u64 {
        (kine * 100.0).round() as u64
    }

    /// Converts Flux back into Kine representation
    pub fn flux_to_kine(flux: u64) -> f64 {
        flux as f64 / 100.0
    }

    /// Converts Kine into Dyne where 100 Kine = 1 Dyne
    pub fn kine_to_dyne(kine: f64) -> f64 {
        kine / 100.0
    }

    /// Converts Dyne into Kine
    pub fn dyne_to_kine(dyne: f64) -> f64 {
        dyne * 100.0
    }
}