// KPE - api/routes.rs
// Defines versioned REST and WebSocket routing for the KPE service

use axum::{
    routing::{get, post},
    Router,
};
use std::sync::Arc;
use crate::AppState;

pub fn create_router(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/api/v1/ingest", post(crate::api::browser_bridge::handle_resource_ingest))
        .route("/api/v1/ledger/status", get(crate::api::browser_bridge::get_ledger_status))
        .with_state(state)
}