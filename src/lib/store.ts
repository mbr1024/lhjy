import fs from 'fs/promises';
import path from 'path';
import { NewsItem } from '@/types';

const CACHE_FILE = path.join('/tmp', 'cache.json');

export interface CacheData {
    lastUpdated: number;
    items: NewsItem[];
}

export async function getCacheData(): Promise<CacheData> {
    try {
        const data = await fs.readFile(CACHE_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // If file missing or error, return empty
        return { lastUpdated: 0, items: [] };
    }
}

export async function saveCacheData(items: NewsItem[]): Promise<void> {
    const data: CacheData = {
        lastUpdated: Date.now(),
        items,
    };
    await fs.writeFile(CACHE_FILE, JSON.stringify(data, null, 2), 'utf-8');
}
