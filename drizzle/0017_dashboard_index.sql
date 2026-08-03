-- The dashboard KPIs and spend charts all filter insights_daily by entity_type
-- ('campaign' / 'account') and aggregate by date. A composite index on
-- (entity_type, date) serves those scans far better than the single-column
-- indexes alone.
--
-- Note: on a very large, live table, create this CONCURRENTLY out-of-band
-- instead (it cannot run inside the migration transaction).
CREATE INDEX IF NOT EXISTS insights_daily_entity_type_date_idx
  ON insights_daily (entity_type, date);
