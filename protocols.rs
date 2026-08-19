// KPE - ingest/protocols.rs
// Implements industrial protocol and telemetry stream adapters (MQTT / IoT)

use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TelemetryPacket {
    pub protocol_type: String, // e.g., "MQTT", "HTTP_REST", "MODBUS"
    pub payload_bytes: Vec<u8>,
    pub source_endpoint: String,
}

pub struct ProtocolAdapter;

impl ProtocolAdapter {
    /// Decodes incoming telemetry packets from industrial meters or edge devices
    pub fn decode_telemetry(packet: &TelemetryPacket) -> Result<String, &'static str> {
        match packet.protocol_type.as_str() {
            "MQTT" | "HTTP_REST" | "MODBUS" => {
                let decoded_str = String::from_utf8(packet.payload_bytes.clone())
                    .map_err(|_| "Protocol error: Failed to parse UTF-8 payload")?;
                Ok(decoded_str)
            }
            _ => Err("Protocol error: Unsupported telemetry protocol"),
        }
    }
}