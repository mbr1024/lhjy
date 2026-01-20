import type { D1Database } from '@cloudflare/workers-types';
import { NewsItem } from '@/types';

export interface CacheData {
    lastUpdated: number;
    items: NewsItem[];
}

// Type for Cloudflare D1 binding
export interface Env {
    DB: D1Database;
}

export async function getCacheData(db: D1Database): Promise<CacheData> {
    try {
        // Get metadata
        const metaResult = await db.prepare(
            'SELECT last_updated FROM cache_metadata WHERE key = ?'
        ).bind('news_cache').first<{ last_updated: number }>();

        const lastUpdated = metaResult?.last_updated || 0;

        // Get news items
        const itemsResult = await db.prepare(
            'SELECT id, title, source, time, link, summary FROM news_items ORDER BY id DESC'
        ).all<{
            id: number;
            title: string;
            source: string;
            time: string;
            link: string;
            summary: string;
        }>();

        const items: NewsItem[] = (itemsResult.results || []).map(row => ({
            ...row,
            summary: JSON.parse(row.summary)
        }));

        return { lastUpdated, items };
    } catch (error) {
        console.error('D1 getCacheData error:', error);
        return { lastUpdated: 0, items: [] };
    }
}

export async function saveCacheData(db: D1Database, items: NewsItem[]): Promise<void> {
    try {
        // Start a batch operation
        const statements = [];

        // Update metadata
        statements.push(
            db.prepare('UPDATE cache_metadata SET last_updated = ? WHERE key = ?')
                .bind(Date.now(), 'news_cache')
        );

        // Clear old items
        statements.push(db.prepare('DELETE FROM news_items'));

        // Insert new items
        for (const item of items) {
            statements.push(
                db.prepare(
                    'INSERT INTO news_items (id, title, source, time, link, summary) VALUES (?, ?, ?, ?, ?, ?)'
                ).bind(
                    item.id,
                    item.title,
                    item.source,
                    item.time,
                    item.link,
                    JSON.stringify(item.summary)
                )
            );
        }

        // Execute all statements in a batch
        await db.batch(statements);
    } catch (error) {
        console.error('D1 saveCacheData error:', error);
        throw error;
    }
}
