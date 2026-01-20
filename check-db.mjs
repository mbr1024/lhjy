import { createClient } from '@libsql/client';

const turso = createClient({
    url: 'libsql://hot-ppppm.aws-ap-northeast-1.turso.io',
    authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njg4NzcyMDEsImlkIjoiMDc2NDRhYmYtMDYyMS00YjhjLWJlN2QtYWNkMzBlZDNjNjlkIiwicmlkIjoiODVlOThiYjQtYjU4NC00YWUzLWExMGUtZWQxNDk3MjczMTYxIn0.Jo0UG_sdNL-NoE8cBGzfLaFAb_lfbWZ9xk34VySTgzOfpAMYNCxWcAgDmYZdbw9UV7ybZT8SVAgwxsWcrQdvBw',
});

async function checkDatabase() {
    try {
        console.log('Checking database...\n');

        // Check metadata
        const metaResult = await turso.execute(
            'SELECT * FROM cache_metadata'
        );
        console.log('Metadata:', metaResult.rows);

        // Check news items count
        const countResult = await turso.execute(
            'SELECT COUNT(*) as count FROM news_items'
        );
        console.log('\nNews items count:', countResult.rows[0]);

        // Check first few items
        const itemsResult = await turso.execute(
            'SELECT id, title, source FROM news_items LIMIT 5'
        );
        console.log('\nFirst 5 items:');
        itemsResult.rows.forEach(row => {
            console.log(`- [${row.id}] ${row.title}`);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

checkDatabase();
