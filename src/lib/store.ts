import { NewsItem } from '@/types';
import { getCacheData as getD1CacheData, saveCacheData as saveD1CacheData } from './d1-store';

export interface CacheData {
    lastUpdated: number;
    items: NewsItem[];
}

// Get D1 database from Cloudflare binding
function getDB() {
    try {
        // Try to get from request context (runtime)
        const { getRequestContext } = require('@cloudflare/next-on-pages');
        const context = getRequestContext();
        return context?.env?.DB;
    } catch (error) {
        console.error('Failed to get D1 database:', error);
        throw new Error('D1 database not available. Make sure you are running with Wrangler.');
    }
}

export async function getCacheData(): Promise<CacheData> {
    const db = getDB();
    return await getD1CacheData(db);
}

export async function saveCacheData(items: NewsItem[]): Promise<void> {
    const db = getDB();
    return await saveD1CacheData(db, items);
}
