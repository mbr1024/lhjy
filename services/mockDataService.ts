import { MarketData, Trade, OrderType, LogEntry } from '../types';

let currentPrice = 3200; // 燃料油基准价格
let timeCounter = 0;

export const generateNextPrice = (): MarketData => {
  const volatility = 5;
  const change = (Math.random() - 0.5) * volatility;
  currentPrice += change;
  
  const now = new Date();
  now.setSeconds(now.getSeconds() + timeCounter * 5); // 增加时间
  timeCounter++;

  return {
    time: now.toLocaleTimeString('zh-CN', { hour12: false }),
    price: parseFloat(currentPrice.toFixed(2)),
  };
};

export const generateInitialData = (count: number): MarketData[] => {
  const data: MarketData[] = [];
  for (let i = 0; i < count; i++) {
    data.push(generateNextPrice());
  }
  return data;
};

export const generateMockLog = (): LogEntry | null => {
  const rand = Math.random();
  const timestamp = new Date().toLocaleTimeString('zh-CN');
  
  if (rand > 0.95) {
    return {
      id: Math.random().toString(36).substr(2, 9),
      timestamp,
      level: 'WARN',
      module: 'RISK_MGR',
      message: '检测到波动性激增。正在调整止损方差阈值。',
    };
  } else if (rand > 0.90) {
    return {
      id: Math.random().toString(36).substr(2, 9),
      timestamp,
      level: 'SUCCESS',
      module: 'AI_OPTIMIZER',
      message: '模型权重已更新。胜率预测提升 0.02%。',
    };
  } else if (rand > 0.98) {
    // 模拟错误
    return {
      id: Math.random().toString(36).substr(2, 9),
      timestamp,
      level: 'ERROR',
      module: 'SYSTEM',
      message: '检测到连续数据丢包。正在切换至备用数据源。',
    };
  }
  return null;
};
