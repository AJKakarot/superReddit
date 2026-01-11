-- Database optimization script to reduce CPU usage
-- Run this script on your PostgreSQL database

-- 1. Analyze current table sizes and performance
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE tablename IN ('keywords', 'mentions', 'posts', 'clients')
ORDER BY tablename, attname;

-- 2. Create optimized indexes for keywords table
-- This will significantly reduce the CPU usage of keyword queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_keywords_active_nextscan 
ON keywords (is_active, nextScanAt) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_keywords_client_active 
ON keywords (clientId, is_active, lastScannedAt);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_keywords_term_client_unique 
ON keywords (term, clientId) 
WHERE is_active = true;

-- 3. Create optimized indexes for mentions table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mentions_client_found 
ON mentions (clientId, found_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mentions_keyword_found 
ON mentions (keywordId, found_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mentions_source_url_hash 
ON mentions USING hash (source_url);

-- 4. Create optimized indexes for posts table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_client_status 
ON posts (clientId, status, createdAt DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_reddit_account 
ON posts (redditAccountId, createdAt DESC);

-- 5. Create optimized indexes for clients table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_created 
ON clients (createdAt DESC);

-- 6. Analyze table statistics for better query planning
ANALYZE keywords;
ANALYZE mentions;
ANALYZE posts;
ANALYZE clients;

-- 7. Set table-level optimizations
-- Reduce autovacuum frequency for tables that don't change often
ALTER TABLE keywords SET (
    autovacuum_vacuum_scale_factor = 0.1,
    autovacuum_analyze_scale_factor = 0.05
);

ALTER TABLE mentions SET (
    autovacuum_vacuum_scale_factor = 0.2,
    autovacuum_analyze_scale_factor = 0.1
);

-- 8. Create partial indexes for active records only
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_keywords_active_only 
ON keywords (nextScanAt, clientId) 
WHERE is_active = true;

-- 9. Create covering indexes to reduce table lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_keywords_covering 
ON keywords (id, term, clientId, is_active, nextScanAt, lastScannedAt) 
WHERE is_active = true;

-- 10. Optimize the mentions table for sentiment analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mentions_sentiment_time 
ON mentions (sentiment, found_at DESC, clientId);

-- 11. Set work_mem for better sort performance (adjust based on your server)
-- This should be set in postgresql.conf, but you can test here:
-- SET work_mem = '256MB';

-- 12. Monitor index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE tablename IN ('keywords', 'mentions', 'posts', 'clients')
ORDER BY idx_scan DESC;

-- 13. Check for unused indexes that can be dropped
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan
FROM pg_stat_user_indexes 
WHERE idx_scan = 0 
AND tablename IN ('keywords', 'mentions', 'posts', 'clients');

-- 14. Vacuum and reindex for optimal performance
VACUUM ANALYZE keywords;
VACUUM ANALYZE mentions;
VACUUM ANALYZE posts;
VACUUM ANALYZE clients;

-- 15. Check current database performance
SELECT 
    datname,
    numbackends,
    xact_commit,
    xact_rollback,
    blks_read,
    blks_hit,
    tup_returned,
    tup_fetched,
    tup_inserted,
    tup_updated,
    tup_deleted
FROM pg_stat_database 
WHERE datname = current_database();

-- 16. Monitor slow queries (if you have pg_stat_statements enabled)
-- SELECT query, calls, total_time, mean_time, rows
-- FROM pg_stat_statements 
-- WHERE mean_time > 100
-- ORDER BY mean_time DESC
-- LIMIT 10;
