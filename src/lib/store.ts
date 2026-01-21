import { NewsItem } from '@/types';
import turso from './turso';

export interface CacheData {
    lastUpdated: number;
    items: NewsItem[];
}

export async function getCacheData(): Promise<CacheData> {
    try {
        // Return empty data if client not available (build time)
        if (!turso) {
            return { lastUpdated: 0, items: [] };
        }

        // Get metadata
        const metaResult = await turso.execute(
            'SELECT last_updated FROM cache_metadata WHERE key = ?',
            ['news_cache']
        );

        const lastUpdated = metaResult.rows[0]?.last_updated as number || 0;

        // Get news items
        const itemsResult = await turso.execute(
            'SELECT id, title, source, time, link, summary, rank FROM news_items ORDER BY rank ASC, id DESC'
        );

        const items: NewsItem[] = itemsResult.rows.map(row => ({
            id: row.id as number,
            title: row.title as string,
            source: row.source as string,
            time: row.time as string,
            link: row.link as string,
            summary: JSON.parse(row.summary as string)
        }));

        return { lastUpdated, items };
    } catch (error) {
        console.error('Turso getCacheData error:', error);
        return { lastUpdated: 0, items: [] };
    }
}

// Ensure schema has rank column
export async function ensureSchema(): Promise<void> {
    try {
        if (!turso) return;
        // Try to add rank column. Ignored if exists (sort of, we catch error)
        // Turso/SQLite might throw if column exists.
        try {
            await turso.execute('ALTER TABLE news_items ADD COLUMN rank INTEGER DEFAULT 9999');
            console.log('[Turso] Added rank column');
        } catch (e) {
            // Ignore error if column likely exists
        }
    } catch (error) {
        console.error('Turso ensureSchema error:', error);
    }
}

export async function cleanupCache(validIds: number[]): Promise<void> {
    try {
        if (!turso || validIds.length === 0) return;

        const placeholders = validIds.map(() => '?').join(',');
        const rs = await turso.execute(
            `DELETE FROM news_items WHERE id NOT IN (${placeholders})`,
            validIds
        );
        console.log(`[Turso] Cleaned up ${rs.rowsAffected} stale items`);
    } catch (error) {
        console.error('Turso cleanupCache error:', error);
    }
}

export async function saveCacheData(items: NewsItem[]): Promise<void> {
    try {
        console.log(`[Turso] Saving ${items.length} items to database...`);

        // Update metadata
        await turso.execute(
            'UPDATE cache_metadata SET last_updated = ? WHERE key = ?',
            [Date.now(), 'news_cache']
        );
        console.log('[Turso] Metadata updated');

        // Clear old items
        await turso.execute('DELETE FROM news_items');
        console.log('[Turso] Old items cleared');

        // Insert new items
        for (const item of items) {
            await turso.execute(
                'INSERT INTO news_items (id, title, source, time, link, summary) VALUES (?, ?, ?, ?, ?, ?)',
                [
                    item.id,
                    item.title,
                    item.source,
                    item.time,
                    item.link,
                    JSON.stringify(item.summary)
                ]
            );
        }
        console.log(`[Turso] Successfully saved ${items.length} items`);
    } catch (error) {
        console.error('Turso saveCacheData error:', error);
        throw error;
    }
}

// 单条记录增量更新（分析完一个入库一个）
export async function upsertItem(item: NewsItem): Promise<void> {
    try {
        if (!turso) return;

        // 使用 INSERT OR REPLACE 实现 upsert
        await turso.execute(
            `INSERT OR REPLACE INTO news_items (id, title, source, time, link, summary, rank) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                item.id,
                item.title,
                item.source,
                item.time,
                item.link,
                JSON.stringify(item.summary),
                item.rank ?? 9999
            ]
        );

        // 更新时间戳
        await turso.execute(
            'UPDATE cache_metadata SET last_updated = ? WHERE key = ?',
            [Date.now(), 'news_cache']
        );

        console.log(`[Turso] Saved item: ${item.title.substring(0, 30)}... (Rank: ${item.rank})`);
    } catch (error) {
        console.error('Turso upsertItem error:', error);
        throw error;
    }
}
