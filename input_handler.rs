// KPE - ingest/input_handler.rs
// Manages incoming physical and resource measurement inputs

use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RawResourceInput {
    pub device_id: String,
    pub resource_class: String, // Energy, Distance, Labor, etc.
    pub measured_value: f64,
    pub unit: String,
    pub timestamp_utc: i64,
}

pub struct InputHandler;

impl InputHandler {
    /// Validates basic structural integrity of raw incoming resource data
    pub fn validate_raw_input(input: &RawResourceInput) -> Result<(), &'static str> {
        if input.device_id.is_empty() {
            return Err("Ingest error: Missing device identifier");
        }
        if input.measured_value < 0.0 {
            return Err("Ingest error: Negative measurement values are invalid");
        }
        if input.resource_class.is_empty() {
            return Err("Ingest error: Missing resource class specification");
        }
        Ok(())
    }
}