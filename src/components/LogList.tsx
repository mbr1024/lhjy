import LogItem from './LogItem';
import { getCacheData } from '@/lib/store';
import { checkAndTriggerUpdate } from '@/lib/crawler';

export default async function LogList() {
    // 1. Read from Cache (Instant)
    const { items, lastUpdated } = await getCacheData();

    // 2. Trigger Background Update if stale (Lazy)
    // Next.js Server Components run on server, so we can call this directly.
    // It is "fire and forget" inside the function.
    await checkAndTriggerUpdate();

    const lastUpdateTime = lastUpdated > 0
        ? new Date(lastUpdated).toLocaleTimeString('zh-CN')
        : 'Never';

    return (
        <div className="w-full max-w-4xl mx-auto font-mono text-sm sm:text-base">
            <div className="py-4 px-2 border-b border-vscode-selection mb-4 flex justify-between items-end">
                <h1 className="text-xl font-bold text-vscode-blue">
                    ~/news/aggregator.log
                </h1>
                <div className="text-xs text-vscode-gray flex gap-4">
                    <span>Data Source: V2EX Hot (Cached)</span>
                    <span>Last Update: {lastUpdateTime}</span>
                </div>
            </div>

            <div className="space-y-0">
                {items.length > 0 ? (
                    items.map((item) => (
                        <LogItem
                            key={item.id}
                            item={item}
                        />
                    ))
                ) : (
                    <div className="p-4 text-vscode-gray">
                        Processing data in background... Please refresh in a few seconds.
                    </div>
                )}
            </div>

            <div className="mt-8 px-2 text-vscode-gray animate-pulse">
                _
            </div>
        </div>
    );
}
