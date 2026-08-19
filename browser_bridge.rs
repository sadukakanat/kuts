// KPE - api/browser_bridge.rs
// Bridges backend KPE valuation/verification data with the Genesis Browser interface

use axum::{
    extract::State,
    http::StatusCode,
    Json,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use crate::AppState;
use crate::verification::sap_engine::{SapEngine, ProductionEventPayload};
use crate::valuation::valuator::Valuator;
use crate::ledger::transaction::KpeTransactionRecord;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct IngestRequest {
    pub node_id: String,
    pub session_token: String,
    pub producer_identity: String,
    pub resource_class: String, // Energy, Distance, Labor
    pub raw_quantity: f64,
    pub kuts_serial: String,
    pub event_hash: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct IngestResponse {
    pub status: String,
    pub audit_status: String,
    pub gross_kine: f64,
    pub kinetic_reward: f64,
    pub infrastructure_tax: f64,
    pub regenerative_tax: f64,
}

/// Handles incoming resource ingest requests from the Genesis Browser interface
pub async fn handle_resource_ingest(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<IngestRequest>,
) -> Result<Json<IngestResponse>, StatusCode> {
    // 1. Map to SAP verification payload
    let sap_payload = ProductionEventPayload {
        node_id: payload.node_id.clone(),
        session_token: payload.session_token.clone(),
        resource_class: payload.resource_class.clone(),
        raw_quantity: payload.raw_quantity,
        timestamp_serial: payload.kuts_serial.clone(),
        event_hash: payload.event_hash.clone(),
    };

    // 2. Run Security Audit Protocol (SAP) verification
    let verification = SapEngine::verify_event(&sap_payload);
    if !verification.is_valid {
        return Ok(Json(IngestResponse {
            status: "REJECTED".to_string(),
            audit_status: verification.audit_status,
            gross_kine: 0.0,
            kinetic_reward: 0.0,
            infrastructure_tax: 0.0,
            regenerative_tax: 0.0,
        }));
    }

    // 3. Evaluate Gross Kine via Valuator
    let resource_class_enum = match payload.resource_class.as_str() {
        "Distance" => crate::valuation::valuator::ResourceClass::Distance,
        "Labor" => crate::valuation::valuator::ResourceClass::Labor,
        _ => crate::valuation::valuator::ResourceClass::Energy,
    };

    let prod_input = crate::valuation::valuator::ProductionInput {
        resource_class: resource_class_enum,
        raw_quantity: payload.raw_quantity,
    };

    let gross_kine = Valuator::calculate_gross_kine(&prod_input).unwrap_or(0.0);
    let split = Valuator::settle_triple_split(gross_kine);

    // 4. Construct Transaction Record and store locally
    let tx_id = format!("KPE-TX-{}", uuid::Uuid::new_v4());
    let record = KpeTransactionRecord {
        transaction_id: tx_id.clone(),
        kuts_serial: payload.kuts_serial,
        originating_node_id: payload.node_id,
        producer_identity: payload.producer_identity,
        resource_class: payload.resource_class,
        raw_quantity: payload.raw_quantity,
        valuation_profile_id: "V1.0-DEFAULT".to_string(),
        gross_kine,
        flux_precision_units: split.flux_units,
        kinetic_reward: split.kinetic_reward,
        infrastructure_tax: split.infrastructure_tax,
        regenerative_tax: split.regenerative_tax,
        audit_status: verification.audit_status.clone(),
        timestamp: chrono::Utc::now().timestamp(),
    };

    let db = state.store.lock().await;
    let _ = db.save_transaction(&record).await;

    Ok(Json(IngestResponse {
        status: "SUCCESS_SETTLED".to_string(),
        audit_status: verification.audit_status,
        gross_kine,
        kinetic_reward: split.kinetic_reward,
        infrastructure_tax: split.infrastructure_tax,
        regenerative_tax: split.regenerative_tax,
    }))
}

/// Exposes engine and ledger status to the browser interface
pub async fn get_ledger_status(
    State(state): State<Arc<AppState>>,
) -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "node_id": state.settings.node_id,
        "master_anchor": state.settings.master_origin_node,
        "status": "ONLINE_ACTIVE",
        "mesh_protocol": "P2P_GOSSIP_V1"
    }))
}