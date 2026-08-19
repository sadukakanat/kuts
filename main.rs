// Kine Production Engine (KPE) - main.rs
// Project: KUTS / MDI6000

use std::net::SocketAddr;
use std::sync::Arc;
use tokio::sync::Mutex;

// Placeholder modules representing the KPE architecture
mod config;
mod db;
mod api;
mod verification;
mod valuation;
mod ledger;

use config::Settings;
use db::SqliteStore;

pub struct AppState {
    pub settings: Settings,
    pub store: Arc<Mutex<SqliteStore>>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // 1. Initialize configuration and environment settings
    let settings = Settings::load().unwrap_or_else(|_| {
        println!("Failed to load configuration. Falling back to default edge settings.");
        Settings::default()
    });

    println!("Starting KPE Edge Node: [{}]", settings.node_id);
    println!("Master Anchor Context: {}", settings.master_origin_node);

    // 2. Initialize local edge storage (SQLite transaction store)
    let db_path = &settings.database_url;
    let store = Arc::new(Mutex::new(SqliteStore::new(db_path).await?));
    {
        let mut db = store.lock().await;
        db.run_migrations().await?;
    }
    println!("Local transactional store initialized successfully at {}", db_path);

    // 3. Set up shared application state
    let state = Arc::new(AppState {
        settings: settings.clone(),
        store: clone_store_ref(&store), // Helper or direct sharing
    });

    // 4. Configure API routes and Genesis Browser bridge endpoints
    let app_router = api::create_router(state);

    // 5. Bind server address and start listener
    let addr: SocketAddr = format!("{}:{}", settings.host, settings.port).parse()?;
    println!("KPE Core service listening on http://{}", addr);

    // 6. Launch background worker for ledger sync / P2P queue
    tokio::spawn(async move {
        ledger::start_sync_worker().await;
    });

    // Start HTTP server (using Axum or similar lightweight async framework)
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app_router).await?;

    Ok(())
}

fn clone_store_ref(store: &Arc<Mutex<SqliteStore>>) -> Arc<Mutex<SqliteStore>> {
    Arc::clone(store)
}