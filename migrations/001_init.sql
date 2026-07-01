CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY,
    data BLOB,
    filename VARCHAR(255),
    created_at INTEGER NOT NULL DEFAULT 0,
    expires_at INTEGER NOT NULL DEFAULT 0
);
