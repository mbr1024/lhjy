
export enum OrderType {
  LONG = '做多',
  SHORT = '做空',
  CLOSE = '平仓'
}

export interface Trade {
  id: string;
  timestamp: number;
  type: OrderType;
  price: number;
  amount: number;
  profit?: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
}

export interface MarketData {
  time: string;
  price: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' | 'REPAIR';
  module: 'CORE' | 'AI_OPTIMIZER' | 'RISK_MGR' | 'SYSTEM';
  message: string;
}

export interface SystemStats {
  winRate: number;
  dailyPnL: number;
  tradeCount: number;
  aiConfidence: number;
  serverStatus: 'ONLINE' | 'MAINTENANCE' | 'ERROR_RECOVERY' | 'REPAIRING';
  healingCount: number;
  riskRewardRatio: number;
  adaptationScore: number;
  // Fix: Added currentVersion property to SystemStats interface
  currentVersion: string;
}