// KPE - config.rs
// Manages node configuration and environment settings

use std::env;

#[derive(Clone, Debug)]
pub struct Settings {
    pub node_id: String,
    pub master_origin_node: String,
    pub database_url: String,
    pub host: String,
    pub port: u16,
}

impl Settings {
    pub fn load() -> Result<Self, &'static str> {
        // Load configurations from environment variables or fall back to edge defaults
        let node_id = env::var("KPE_NODE_ID").unwrap_or_else(|_| "THRINU000-EDGE".to_string());
        let master_origin_node = env::var("KUTS_MASTER_ANCHOR").unwrap_or_else(|_| "THRINC000".to_string());
        let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| "kpe_local_store.db".to_string());
        let host = env::var("KPE_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
        let port = env::var("KPE_PORT")
            .unwrap_or_else(|_| "8080".to_string())
            .parse::<u16>()
            .map_err(|_| "Invalid port number specification")?;

        Ok(Settings {
            node_id,
            master_origin_node,
            database_url,
            host,
            port,
        })
    }
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            node_id: "THRINU000-EDGE".to_string(),
            master_origin_node: "THRINC000".to_string(),
            database_url: "kpe_local_store.db".to_string(),
            host: "127.0.0.1".to_string(),
            port: 8080,
        }
    }
}