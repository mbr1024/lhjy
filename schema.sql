-- D1 Database Schema for News Aggregator

CREATE TABLE IF NOT EXISTS news_items (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    source TEXT NOT NULL,
    time TEXT NOT NULL,
    link TEXT NOT NULL,
    summary TEXT NOT NULL, -- JSON array stored as text
    created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS cache_metadata (
    key TEXT PRIMARY KEY,
    last_updated INTEGER NOT NULL
);

-- Insert initial metadata
INSERT OR REPLACE INTO cache_metadata (key, last_updated) VALUES ('news_cache', 0);
