'use client';

import { useState } from 'react';
import type { NewsItem } from '@/types';

interface LogItemProps {
    item: NewsItem;
}

export default function LogItem({ item }: LogItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggle = () => {
        setIsExpanded(!isExpanded);
    };

    const getSourceColor = (source: string) => {
        // V2EX/Weibo -> Blue, HN/GitHub -> Red/Orange
        if (['V2EX', '微博', 'Juejin'].includes(source)) {
            return 'text-vscode-blue';
        }
        return 'text-vscode-red';
    };

    return (
        <div className="mb-1">
            <div
                className="cursor-pointer hover:bg-white/5 py-0.5 px-2 flex items-center select-none"
                onClick={toggle}
            >
                {/* Source */}
                <span className={`w-16 shrink-0 font-bold ${getSourceColor(item.source)}`}>
                    [{item.source}]
                </span>

                {/* Time */}
                <span className="w-16 shrink-0 text-vscode-gray mr-2">
                    {item.time}
                </span>

                {/* Separator */}
                <span className="text-vscode-gray mr-2">|</span>

                {/* Title */}
                <span className="text-vscode-text hover:underline truncate">
                    {item.title}
                </span>
            </div>

            {/* Expanded Summary */}
            {isExpanded && (
                <div className="pl-20 pr-4 py-2 text-sm text-vscode-gray">
                    <div className="border-l-2 border-vscode-selection pl-3 py-1 bg-white/5">
                        <div className="font-bold mb-1 text-vscode-blue"> &gt; 摘要：</div>
                        <ol className="list-decimal list-inside space-y-0.5">
                            {item.summary.map((point, idx) => (
                                <li key={idx}>
                                    {point}
                                </li>
                            ))}
                        </ol>
                        <div className="mt-2 text-xs">
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-vscode-selection hover:text-vscode-blue underline">
                                [View Original]
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
