import React, { useState, useEffect } from 'react';
import { MarketData, Trade, OrderType, LogEntry, SystemStats } from './types';
import { generateInitialData, generateNextPrice, generateMockLog } from './services/mockDataService';
import TradingChart from './components/TradingChart';
import LogPanel from './components/LogPanel';
import DeepLearningVisualizer from './components/DeepLearningVisualizer';
import WeChatPreview from './components/WeChatPreview';
import { generateDailyReport } from './services/geminiService';
import { 
    Cog6ToothIcon, 
    ArrowPathIcon, 
    ShieldCheckIcon, 
    PresentationChartLineIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    BoltIcon,
    HeartIcon,
    SunIcon,
    MoonIcon
} from '@heroicons/react/24/outline';

function App() {
  const [activeView, setActiveView] = useState<'trading' | 'risk'>('trading');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // 从 localStorage 读取主题偏好，默认为黑暗模式
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    winRate: 68.5,
    dailyPnL: 12450.00,
    tradeCount: 42,
    aiConfidence: 89.2,
    serverStatus: 'ONLINE',
    healingCount: 14,
    riskRewardRatio: 1.5,
    adaptationScore: 98.2,
    // Fix: Initializing currentVersion
    currentVersion: 'v4.2.0-PRO'
  });
  const [aiReport, setAiReport] = useState<string>("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [repairing, setRepairing] = useState(false);

  // 主题切换效果
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    setMarketData(generateInitialData(50));
    addLog({
      id: 'init',
      timestamp: new Date().toLocaleTimeString('zh-CN'),
      level: 'SUCCESS',
      module: 'SYSTEM',
      message: '深度学习交易核心已连接。自动纠错引擎状态：全时就绪。'
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (repairing) return;

      const nextPoint = generateNextPrice();
      setMarketData(prev => [...prev.slice(1), nextPoint]);

      if (Math.random() > 0.9) {
          setStats(s => {
              const wrChange = (Math.random() - 0.4);
              const newWR = parseFloat((s.winRate + wrChange).toFixed(1));
              const newRR = parseFloat((s.riskRewardRatio + (wrChange > 0 ? -0.01 : 0.02)).toFixed(2));
              return { ...s, winRate: newWR, riskRewardRatio: newRR };
          });
      }

      if (Math.random() > 0.95) {
        const isLong = Math.random() > 0.5;
        const newTrade: Trade = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            type: isLong ? OrderType.LONG : OrderType.SHORT,
            price: nextPoint.price,
            amount: 10,
            status: 'SUCCESS'
        };
        setTrades(prev => [...prev, newTrade]);
        setStats(prev => ({
            ...prev,
            tradeCount: prev.tradeCount + 1,
            dailyPnL: prev.dailyPnL + (Math.random() * 500 - 150)
        }));
        
        addLog({
            id: Date.now().toString(),
            timestamp: nextPoint.time,
            level: 'INFO',
            module: 'CORE',
            message: `自动触发交易：${newTrade.type} @ ${newTrade.price}。`
        });
      }

      const mockLog = generateMockLog();
      if (mockLog && mockLog.level === 'ERROR') {
        triggerAutoRepair(mockLog);
      } else if (mockLog) {
        addLog(mockLog);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [repairing]);

  const triggerAutoRepair = (errorLog: LogEntry) => {
    setRepairing(true);
    setStats(s => ({ ...s, serverStatus: 'REPAIRING' }));
    addLog(errorLog);
    
    const steps = [
        { msg: '纠错引擎介入：正在隔离异常模块...', delay: 800 },
        { msg: '正在对比历史稳定状态，计算回滚路径...', delay: 1600 },
        { msg: '执行自修复指令：清理内存并重启解析器...', delay: 2400 },
        { msg: '状态对齐完成。偏差已自动归零。', delay: 3200 }
    ];

    steps.forEach((step, index) => {
        setTimeout(() => {
            addLog({
                id: `repair-${index}-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString('zh-CN'),
                level: 'REPAIR',
                module: 'SYSTEM',
                message: step.msg
            });
            if (index === steps.length - 1) {
                setRepairing(false);
                setStats(s => ({ ...s, serverStatus: 'ONLINE', healingCount: s.healingCount + 1 }));
            }
        }, step.delay);
    });
  };

  const addLog = (log: LogEntry) => {
      setLogs(prev => [...prev.slice(-49), log]);
  };

  const handleGenerateReport = async () => {
      setIsGeneratingReport(true);
      const report = await generateDailyReport(stats, trades);
      setAiReport(report);
      setIsGeneratingReport(false);
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans relative">
      {repairing && (
        <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-[4px] flex items-center justify-center">
            <div className="bg-card border border-border p-10 rounded-2xl text-center shadow-xl max-w-md">
                <div className="relative mb-8">
                    <ExclamationTriangleIcon className="w-16 h-16 text-destructive mx-auto animate-pulse" />
                </div>
                <h2 className="text-xl font-bold mb-3 tracking-tight">系统正在自我修复</h2>
                <p className="text-base text-muted-foreground mb-6 leading-relaxed">自动纠错模块已拦截逻辑异常。正在根据历史最优快照执行热修复逻辑，请稍候。</p>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div className="bg-foreground h-full animate-[loading_2s_linear_infinite]"></div>
                </div>
            </div>
        </div>
      )}

      {/* Navigation Sidebar */}
      <aside className="w-[72px] border-r border-border flex flex-col items-center py-8 gap-8 z-10 shrink-0">
        <div className="w-12 h-12 bg-foreground rounded-xl flex items-center justify-center text-background mb-4 transition-transform active:scale-95 cursor-pointer">
            <BoltIcon className="w-7 h-7" />
        </div>
        
        <nav className="flex flex-col gap-5 w-full items-center">
            <button 
                onClick={() => setActiveView('trading')}
                className={`p-3 rounded-lg transition-colors ${activeView === 'trading' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}
            >
                <PresentationChartLineIcon className="w-6 h-6" />
            </button>
            <button 
                onClick={() => setActiveView('risk')}
                className={`p-3 rounded-lg transition-colors ${activeView === 'risk' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}
            >
                <ShieldCheckIcon className="w-6 h-6" />
            </button>
        </nav>
        <div className="mt-auto flex flex-col gap-5 w-full items-center">
            <button 
              onClick={toggleTheme}
              className="p-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all active:scale-95"
              title={isDarkMode ? '切换到明亮模式' : '切换到黑暗模式'}
            >
              {isDarkMode ? (
                <SunIcon className="w-6 h-6" />
              ) : (
                <MoonIcon className="w-6 h-6" />
              )}
            </button>
            <button className="p-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
              <Cog6ToothIcon className="w-6 h-6" />
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-background/50 backdrop-blur-md sticky top-0 z-20 shrink-0">
            <div className="flex items-center gap-6">
                <h1 className="text-lg font-bold tracking-tight">{activeView === 'trading' ? '燃油主力 AI 交易终端' : '风险策略管理系统'}</h1>
                <div className="flex items-center gap-2 px-3 py-1 bg-secondary text-xs font-semibold rounded-md text-secondary-foreground border border-border">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    实时节点: 已连接
                </div>
            </div>
            <div className="flex items-center gap-8">
                 <div className="flex flex-col items-end mr-4">
                    <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-0.5">当日预估盈亏</span>
                    <span className={`text-xl font-mono font-bold ${stats.dailyPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ¥{stats.dailyPnL.toLocaleString(undefined, {minimumFractionDigits:2})}
                    </span>
                 </div>
                 <button 
                    onClick={handleGenerateReport}
                    disabled={isGeneratingReport || repairing}
                    className="h-11 px-6 inline-flex items-center justify-center rounded-lg text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all gap-2 active:scale-95">
                    {isGeneratingReport ? <ArrowPathIcon className="w-5 h-5 animate-spin"/> : <DocumentTextIcon className="w-5 h-5"/>}
                    AI 投研分析
                 </button>
            </div>
        </header>

        <div className="flex-1 p-8 grid grid-cols-12 gap-8 overflow-hidden">
            {activeView === 'trading' ? (
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-8 overflow-hidden">
                    <div className="flex-1 min-h-[350px] border border-border rounded-2xl bg-card overflow-hidden shadow-md">
                        <TradingChart data={marketData} trades={trades} />
                    </div>
                    <div className="h-80 grid grid-cols-1 md:grid-cols-3 gap-8 shrink-0">
                        <div className="md:col-span-2 border border-border rounded-2xl bg-card overflow-hidden shadow-md">
                          <LogPanel logs={logs} />
                        </div>
                        <div className="border border-border rounded-2xl bg-card p-6 flex flex-col justify-between shadow-md">
                            <div className="space-y-2">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">自动纠错统计</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">系统运行时自我保护引擎监控中，任何逻辑漂移将被实时拦截。</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="text-5xl font-mono font-bold tracking-tighter text-foreground">{stats.healingCount}</div>
                                <div className="text-xs font-bold text-muted-foreground uppercase mt-2 tracking-widest">累计自愈拦截</div>
                            </div>
                            <div className="pt-5 border-t border-border flex items-center justify-center gap-3">
                               <HeartIcon className="w-5 h-5 text-red-500 animate-pulse" />
                               <span className="text-xs font-bold uppercase tracking-widest">引擎健康度 100%</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-8 overflow-hidden">
                    <div className="grid grid-cols-3 gap-8 shrink-0">
                        {[
                          { icon: ShieldCheckIcon, title: '异常隔离协议', desc: '检测到逻辑错误时，在 15ms 内切断执行链条并进入安全回滚模式。', color: 'text-green-500' },
                          { icon: ArrowPathIcon, title: '状态镜像对齐', desc: '每秒执行 20 次核心参数全对齐检查，确保 UI 与模型参数高度同步。', color: 'text-blue-500' },
                          { icon: HeartIcon, title: '逻辑热重载', desc: '基于稳定基准状态自动执行代码块重置，无需人为干预即可恢复交易。', color: 'text-red-500' }
                        ].map((item, idx) => (
                          <div key={idx} className="bg-card p-8 rounded-2xl border border-border shadow-md group hover:border-primary transition-all">
                               <item.icon className={`w-8 h-8 ${item.color} mb-5 group-hover:scale-110 transition-transform`} />
                               <h4 className="text-base font-bold mb-3">{item.title}</h4>
                               <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                          </div>
                        ))}
                    </div>
                    <div className="flex-1 bg-card rounded-2xl border border-border p-8 flex flex-col shadow-md min-h-0">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-base font-bold tracking-tight uppercase">纠错与热修复历史序列</h3>
                            <span className="text-xs font-mono bg-secondary px-3 py-1 rounded-md border border-border font-bold">MODE: SECURE_AUDIT</span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                             {logs.filter(l => l.level === 'REPAIR' || l.level === 'ERROR').map(l => (
                                 <div key={l.id} className="p-4 bg-secondary/20 rounded-xl flex items-center gap-6 border border-border hover:bg-secondary/40 transition-colors">
                                     <div className="shrink-0 text-muted-foreground font-mono text-xs font-medium">{l.timestamp}</div>
                                     <div className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${l.level === 'ERROR' ? 'bg-destructive/20 text-destructive' : 'bg-blue-500/20 text-blue-500'}`}>
                                         {l.level === 'ERROR' ? 'CRITICAL_BLOCK' : 'AUTO_FIXED'}
                                     </div>
                                     <div className="text-sm font-semibold">{l.message}</div>
                                     <CheckCircleIcon className="w-5 h-5 text-green-500 ml-auto opacity-70" />
                                 </div>
                             ))}
                             {logs.filter(l => l.level === 'REPAIR' || l.level === 'ERROR').length === 0 && (
                               <div className="flex flex-col items-center justify-center h-full opacity-30 gap-3">
                                  <ShieldCheckIcon className="w-16 h-16" />
                                  <span className="text-sm font-bold uppercase tracking-widest">目前系统运行极其稳健，暂无修复记录</span>
                               </div>
                             )}
                        </div>
                    </div>
                </div>
            )}

            {/* Right Sidebar Widgets */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-8 overflow-hidden">
                <div className="shrink-0 border border-border rounded-2xl bg-card shadow-md">
                    <DeepLearningVisualizer winRate={stats.winRate} riskRatio={stats.riskRewardRatio} />
                </div>
                <div className="flex-1 border border-border border-dashed rounded-2xl p-10 flex flex-col items-center justify-center overflow-hidden bg-secondary/10">
                     <div className="mb-8 text-center shrink-0">
                        <h3 className="text-base font-bold tracking-tight">远程监控移动端预览</h3>
                        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-bold">Terminal Sync Preview</p>
                     </div>
                     <WeChatPreview 
                        stats={stats} 
                        lastTrade={trades.length > 0 ? trades[trades.length - 1] : null}
                        reportText={aiReport}
                     />
                </div>
            </div>
        </div>
      </main>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
      `}</style>
    </div>
  );
}

export default App;