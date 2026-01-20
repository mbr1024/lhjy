import { createClient } from '@libsql/client';

const turso = createClient({
    url: 'libsql://hot-ppppm.aws-ap-northeast-1.turso.io',
    authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njg4NzcyMDEsImlkIjoiMDc2NDRhYmYtMDYyMS00YjhjLWJlN2QtYWNkMzBlZDNjNjlkIiwicmlkIjoiODVlOThiYjQtYjU4NC00YWUzLWExMGUtZWQxNDk3MjczMTYxIn0.Jo0UG_sdNL-NoE8cBGzfLaFAb_lfbWZ9xk34VySTgzOfpAMYNCxWcAgDmYZdbw9UV7ybZT8SVAgwxsWcrQdvBw',
});

async function initDatabase() {
    try {
        console.log('Creating tables...');

        await turso.execute(`
            CREATE TABLE IF NOT EXISTS news_items (
                id INTEGER PRIMARY KEY,
                title TEXT NOT NULL,
                source TEXT NOT NULL,
                time TEXT NOT NULL,
                link TEXT NOT NULL,
                summary TEXT NOT NULL,
                created_at INTEGER DEFAULT (unixepoch())
            )
        `);

        await turso.execute(`
            CREATE TABLE IF NOT EXISTS cache_metadata (
                key TEXT PRIMARY KEY,
                last_updated INTEGER NOT NULL
            )
        `);

        console.log('Inserting initial metadata...');
        await turso.execute(`
            INSERT OR REPLACE INTO cache_metadata (key, last_updated) 
            VALUES ('news_cache', 0)
        `);

        console.log('✅ Database initialized successfully!');
    } catch (error) {
        console.error('❌ Failed to initialize database:', error);
    }
}

initDatabase();
