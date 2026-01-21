import { getCacheData, upsertItem } from './store';
import { summarizeContent } from './ai';
import { NewsItem } from '@/types';

// Lock mechanism to prevent concurrent updates in the same process
let isUpdating = false;

export async function updateData(): Promise<boolean> {
    if (isUpdating) {
        console.log('Update already in progress, skipping...');
        return false;
    }

    isUpdating = true;
    console.log('Starting background data update...');

    try {
        // 1. Fetch V2EX via proxy
        const res = await fetch('https://suyl.website', {
            cache: 'no-store', // Ensure fresh data
        });

        if (!res.ok) throw new Error('Failed to fetch from V2EX');

        const data = await res.json() as Array<{
            id: number;
            title: string;
            content: string;
            url: string;
            created: number;
        }>;

        // Process all items from API
        const topItems = data;

        // 2. Process items (Sequentially for AI)
        for (const item of topItems) {
            const date = new Date(item.created * 1000);
            const timeStr = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });


            // 每次都重新分析（评论会实时更新）
            let summary: string[] = [];
            try {
                console.log(`Fetching replies for: ${item.title}`);
                // Fetch replies via CF proxy (same domain as hot topics)
                const repliesRes = await fetch(`https://suyl.website/replies?topic_id=${item.id}`, { cache: 'no-store' });
                let repliesText = "暂无评论";

                if (repliesRes.ok) {
                    const replies = await repliesRes.json();
                    // Extract ALL replies with floor numbers for comprehensive analysis
                    const totalCount = Array.isArray(replies) ? replies.length : 0;
                    repliesText = Array.isArray(replies) && replies.length > 0
                        ? `【共 ${totalCount} 条评论】\n` +
                        replies.map((r: { member: { username: string }; content: string }, i: number) =>
                            `#${i + 1} @${r.member.username}: ${r.content}`
                        ).join('\n')
                        : "暂无评论";
                    console.log(`Fetched ${totalCount} replies for topic ${item.id}`);
                }

                console.log(`Analyzing: ${item.title}`);
                // Delay 1s
                await new Promise(r => setTimeout(r, 1000));

                summary = await summarizeContent(item.title, item.content, repliesText);

            } catch (e) {
                console.error(`AI Error for ${item.id}`, e);
                summary = [item.content.substring(0, 100).replace(/\n/g, ' ') + '...'];
            }

            if (summary.length === 0) {
                summary = [item.content.substring(0, 100).replace(/\n/g, ' ') + '...'];
            }

            // 分析完一个就入库一个
            await upsertItem({
                id: item.id,
                title: item.title,
                source: 'V2EX',
                time: timeStr,
                link: item.url,
                summary: summary,
            });
        }

        console.log('Data update complete.');
        return true;

    } catch (error) {
        console.error('Update failed:', error);
        return false;
    } finally {
        isUpdating = false;
    }
}

export async function checkAndTriggerUpdate() {
    const { lastUpdated } = await getCacheData();
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;

    if (now - lastUpdated > ONE_HOUR) {
        console.log('Cache stale (1h), triggering background update...');
        // Fire and forget - do NOT await
        updateData().catch(e => console.error('Background update crashed', e));
    }
}
