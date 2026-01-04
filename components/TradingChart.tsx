import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { MarketData, Trade } from '../types';

interface TradingChartProps {
  data: MarketData[];
  trades: Trade[];
}

const TradingChart: React.FC<TradingChartProps> = ({ data, trades }) => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center py-4 px-6 border-b border-border bg-secondary/5">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">燃油主力合约 (FU2405) / 实时分时</h3>
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></span>
          <span className="text-xs font-bold tracking-widest uppercase">Live Feed</span>
        </div>
      </div>
      <div className="flex-1 p-4 pt-8">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="4 4" stroke="hsl(240 3.7% 15.9%)" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="hsl(240 5% 64.9%)" 
              tick={{fontSize: 11, fontWeight: 600}} 
              interval={Math.floor(data.length / 5)}
              axisLine={false}
              tickLine={false}
              dy={15}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              stroke="hsl(240 5% 64.9%)" 
              tick={{fontSize: 11, fontWeight: 600}} 
              width={50}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              cursor={{ stroke: 'hsl(240 5% 64.9%)', strokeWidth: 1.5 }}
              contentStyle={{ 
                backgroundColor: 'hsl(240 10% 3.9%)', 
                border: '1px solid hsl(240 3.7% 15.9%)', 
                borderRadius: '12px',
                padding: '12px 16px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)'
              }}
              labelStyle={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'hsl(240 5% 64.9%)' }}
              itemStyle={{ fontSize: '13px', fontWeight: 800, padding: 0 }}
              formatter={(value: any) => [`¥${value}`, '实时价格']}
              labelFormatter={(label) => `监控时间: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#3b82f6" 
              strokeWidth={3} 
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
              animationDuration={0}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TradingChart;