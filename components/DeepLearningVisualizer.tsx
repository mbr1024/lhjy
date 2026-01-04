import React, { useState, useEffect } from 'react';
import { SparklesIcon } from '@heroicons/react/24/solid';

interface Props {
  winRate: number;
  riskRatio: number;
}

const DeepLearningVisualizer: React.FC<Props> = ({ winRate, riskRatio }) => {
  const [pulse, setPulse] = useState(false);
  const [pivotOffset, setPivotOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // 模拟决策平衡点的偏移
    const offset = (winRate - 60) * 2 - (1.5 - riskRatio) * 50;
    setPivotOffset(Math.max(-100, Math.min(100, offset)));
  }, [winRate, riskRatio]);

  return (
    <div className="p-8 flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <SparklesIcon className="w-5 h-5 text-blue-500" />
          <h3 className="text-sm font-bold tracking-[0.1em] uppercase">深度学习平衡决策引擎</h3>
        </div>
        <div className={`w-2 h-2 rounded-full ${pulse ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]' : 'bg-muted'} transition-all duration-1000`}></div>
      </div>

      {/* Balance Slider Visual */}
      <div className="h-24 bg-secondary/30 rounded-xl border border-border flex items-center justify-center relative px-8 mb-8 overflow-hidden shadow-inner">
         <div className="absolute w-[80%] h-px bg-border"></div>
         
         <div 
            className="absolute transition-transform duration-1000 ease-in-out"
            style={{ transform: `translateX(${pivotOffset}px)` }}
         >
            <div className="w-1.5 h-10 bg-foreground rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)] relative">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Adaptive_Pivot</div>
            </div>
         </div>

         <div className="absolute left-6 flex flex-col items-center">
            <span className="text-[10px] text-muted-foreground uppercase font-black mb-1">稳健胜率</span>
            <span className="text-xl font-mono font-bold text-green-500">{winRate}%</span>
         </div>
         <div className="absolute right-6 flex flex-col items-center">
            <span className="text-[10px] text-muted-foreground uppercase font-black mb-1">扩张收益</span>
            <span className="text-xl font-mono font-bold text-blue-500">{(1/riskRatio).toFixed(2)}x</span>
         </div>
      </div>

      <div className="space-y-6">
        <div className="flex gap-4">
            <div className="flex flex-col gap-1 mt-1.5">
                <div className="w-1 h-3 bg-blue-500 rounded-full"></div>
                <div className="w-1 h-3 bg-muted rounded-full"></div>
                <div className="w-1 h-3 bg-muted rounded-full"></div>
            </div>
            <div className="flex-1">
                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-3 tracking-widest">当前 AI 权重分配策略</h4>
                <div className="flex flex-wrap gap-2.5">
                    <span className="text-[11px] font-bold px-2 py-1 bg-secondary rounded-md border border-border">高频纠偏: ON</span>
                    <span className="text-[11px] font-bold px-2 py-1 bg-secondary rounded-md border border-border">中性策略: ACTIVE</span>
                    <span className="text-[11px] font-bold px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20">波动补偿: +0.02</span>
                </div>
            </div>
        </div>
        
        <div className="text-xs text-muted-foreground leading-relaxed p-4 bg-secondary/20 rounded-xl border border-border italic font-medium">
          <span className="text-blue-500 mr-2">●</span>
          AI 分析提示：当前 1min 周期波动率呈收敛态势。决策引擎已自动切换至“风险中性”模式，优先维持账户 alpha 稳定性，自愈模块已完成同步。
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border flex justify-between items-center">
        <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Adaptation Score</span>
            <span className="text-base font-bold text-foreground">98.2 / 100</span>
        </div>
        <div className="flex flex-col text-right">
            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Learning Rate</span>
            <span className="text-base font-mono font-bold text-foreground">0.00042</span>
        </div>
      </div>
    </div>
  );
};

export default DeepLearningVisualizer;