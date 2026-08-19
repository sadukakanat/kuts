// KPE - ledger/store.rs
// Manages local SQLite transactional storage for the KPE edge node

use sqlx::{SqlitePool, Row};
use crate::ledger::transaction::KpeTransactionRecord;

pub struct SqliteStore {
    pool: SqlitePool,
}

impl SqliteStore {
    /// Connects to the local SQLite edge store
    pub async fn new(database_url: &str) -> Result<Self, sqlx::Error> {
        let connection_str = format!("sqlite:{}?mode=rwc", database_url);
        let pool = SqlitePool::connect(&connection_str).await?;
        Ok(Self { pool })
    }

    /// Initializes the database table schema for KPE transactions
    pub async fn run_migrations(&self) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS kpe_transactions (
                transaction_id TEXT PRIMARY KEY,
                kuts_serial TEXT NOT NULL,
                originating_node_id TEXT NOT NULL,
                producer_identity TEXT NOT NULL,
                resource_class TEXT NOT NULL,
                raw_quantity REAL NOT NULL,
                valuation_profile_id TEXT NOT NULL,
                gross_kine REAL NOT NULL,
                flux_precision_units INTEGER NOT NULL,
                kinetic_reward REAL NOT NULL,
                infrastructure_tax REAL NOT NULL,
                regenerative_tax REAL NOT NULL,
                audit_status TEXT NOT NULL,
                timestamp INTEGER NOT NULL
            );
            "#,
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    /// Inserts a verified and settled transaction record into local edge storage
    pub async fn save_transaction(&self, tx: &KpeTransactionRecord) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            INSERT INTO kpe_transactions (
                transaction_id, kuts_serial, originating_node_id, producer_identity,
                resource_class, raw_quantity, valuation_profile_id, gross_kine,
                flux_precision_units, kinetic_reward, infrastructure_tax, regenerative_tax,
                audit_status, timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&tx.transaction_id)
        .bind(&tx.kuts_serial)
        .bind(&tx.originating_node_id)
        .bind(&tx.producer_identity)
        .bind(&tx.resource_class)
        .bind(tx.raw_quantity)
        .bind(&tx.valuation_profile_id)
        .bind(tx.gross_kine)
        .bind(tx.flux_precision_units as i64)
        .bind(tx.kinetic_reward)
        .bind(tx.infrastructure_tax)
        .bind(tx.regenerative_tax)
        .bind(&tx.audit_status)
        .bind(tx.timestamp)
        .execute(&self.pool)
        .await?;

        Ok(())
    }
}