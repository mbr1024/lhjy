
import React, { useState } from 'react';
import { SystemStats, Trade, OrderType } from '../types';
import { 
  UserIcon, 
  ChartBarIcon, 
  ClockIcon, 
  HomeIcon, 
  InformationCircleIcon, 
  SignalIcon, 
  ArrowPathIcon, 
  ShieldCheckIcon,
  HeartIcon
} from '@heroicons/react/24/solid';

interface WeChatPreviewProps {
  stats: SystemStats;
  lastTrade: Trade | null;
  reportText: string;
}

type Tab = 'home' | 'report' | 'settings';

const WeChatPreview: React.FC<WeChatPreviewProps> = ({ stats, lastTrade, reportText }) => {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  return (
    <div className="w-[300px] h-[600px] bg-white rounded-[2rem] border-8 border-gray-800 overflow-hidden relative shadow-2xl shrink-0 select-none">
      {/* 刘海屏 */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-20"></div>

      {/* 状态栏 */}
      <div className="bg-gray-100 h-8 w-full flex justify-between items-center px-4 text-[10px] text-black font-bold pt-2">
        <span>9:41</span>
        <div className="flex gap-1">
          <SignalIcon className="w-3 h-3" />
          <span>🔋</span>
        </div>
      </div>

      {/* 小程序标题栏 */}
      <div className="bg-white px-3 py-2 flex items-center justify-between border-b border-gray-200">
        <div className="text-sm font-bold text-gray-900">量子燃油助手</div>
        <div className="flex gap-2">
          <div className="w-16 h-6 border border-gray-300 rounded-full flex items-center justify-around px-1">
             <span className="text-[10px] text-gray-800 font-bold">•••</span>
             <span className="text-[10px] text-gray-800">⊙</span>
          </div>
        </div>
      </div>

      {/* 内容区域：首页 */}
      {activeTab === 'home' && (
        <div className="p-3 bg-gray-50 h-[480px] overflow-y-auto pb-10">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-4 text-white shadow-lg mb-4">
                <div className="flex items-center gap-2 mb-1">
                    <UserIcon className="w-4 h-4 opacity-80" />
                    <span className="text-[10px] opacity-80 uppercase tracking-widest">账户 ID: 8829-用户-A</span>
                </div>
                <div className="text-2xl font-bold font-mono">¥ {stats.dailyPnL.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
                <div className="text-[10px] mt-1 text-blue-200">当日盈亏统计 (实时对齐)</div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-[10px] text-gray-500 mb-1">自适应胜率</div>
                    <div className="text-lg font-bold text-green-600">{stats.winRate}%</div>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-[10px] text-gray-500 mb-1">成交次数</div>
                    <div className="text-lg font-bold text-gray-800">{stats.tradeCount}</div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                    <ClockIcon className="w-3 h-3 text-blue-500" /> 最新动态
                </h4>
                {lastTrade ? (
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                        <div>
                            <span className={`text-xs font-bold ${lastTrade.type === OrderType.LONG ? 'text-green-600' : 'text-red-600'}`}>
                                {lastTrade.type === OrderType.LONG ? '做多' : '做空'}
                            </span>
                            <span className="text-[10px] text-gray-400 ml-2">FU主力</span>
                        </div>
                        <span className="text-xs font-mono text-gray-700">¥{lastTrade.price}</span>
                    </div>
                ) : (
                    <div className="text-xs text-gray-400 italic text-center py-2">暂无成交记录</div>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2">
                        <ShieldCheckIcon className="w-3 h-3 text-blue-500" /> 安全盾状态
                    </h4>
                    <span className="text-[10px] text-green-500 font-bold">{stats.serverStatus}</span>
                </div>
                <div className="text-[10px] text-gray-500 leading-normal">
                    AI 纠错系统今日已成功拦截并修复 <span className="font-bold text-blue-600">{stats.healingCount}</span> 次运行时逻辑偏差，资产受 24H 实时保护中。
                </div>
            </div>
        </div>
      )}

      {/* 内容区域：深度投研 */}
      {activeTab === 'report' && (
        <div className="p-3 bg-gray-50 h-[480px] overflow-y-auto pb-10">
            <div className="flex items-center gap-2 mb-4">
                <ChartBarIcon className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-gray-900">智能深度投研报告</h3>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 leading-relaxed">
                {reportText ? (
                    <div className="text-xs text-gray-700 whitespace-pre-wrap">{reportText}</div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                        <ArrowPathIcon className="w-8 h-8 text-gray-300 animate-spin mb-3" />
                        <div className="text-xs text-gray-400">正在等待 AI 分析收盘数据...</div>
                    </div>
                )}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-[10px] text-blue-700 leading-normal">
                报告生成基于深度学习模型对波动率平衡点的实时捕捉。
            </div>
        </div>
      )}

      {/* 内容区域：我的设置 */}
      {activeTab === 'settings' && (
        <div className="p-3 bg-gray-50 h-[480px] overflow-y-auto pb-10">
            <div className="flex flex-col items-center py-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <UserIcon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-sm font-bold text-gray-900">旗舰版用户-A</div>
                <div className="text-[10px] text-gray-400">系统版本：{stats.currentVersion}</div>
            </div>

            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 mb-4">
                <div className="p-3 flex items-center justify-between border-b border-gray-50">
                    <div className="flex items-center gap-2 text-xs text-gray-700">
                        <HeartIcon className="w-4 h-4 text-red-400" /> 累计自愈保护
                    </div>
                    <div className="text-xs font-bold text-blue-600">{stats.healingCount} 次</div>
                </div>
                <div className="p-3 flex items-center justify-between border-b border-gray-50">
                    <div className="flex items-center gap-2 text-xs text-gray-700">
                        <ShieldCheckIcon className="w-4 h-4 text-gray-400" /> 自动纠错引擎
                    </div>
                    <div className="w-8 h-4 bg-blue-600 rounded-full flex items-center px-1">
                        <div className="w-2 h-2 bg-white rounded-full translate-x-4 transition-transform"></div>
                    </div>
                </div>
                <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-700">
                        <InformationCircleIcon className="w-4 h-4 text-gray-400" /> 帮助与反馈
                    </div>
                    <span className="text-gray-300">›</span>
                </div>
            </div>

            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-2">自适应决策快报</h4>
                <div className="text-[10px] text-gray-500 leading-relaxed">
                   AI 模型目前倾向于 <span className="text-blue-600 font-bold">稳健胜率模式</span>。纠错模块监控到数据源延迟 12ms，已自动优化对齐协议。
                </div>
            </div>
            
            <button className="w-full mt-6 bg-white py-3 rounded-xl text-xs text-red-500 font-bold border border-gray-100 shadow-sm active:bg-gray-50">
                停止所有智能任务
            </button>
        </div>
      )}
      
      {/* 底部导航栏 */}
      <div className="absolute bottom-0 w-full bg-white border-t border-gray-200 h-16 flex items-center justify-around pb-4 z-30">
        <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center transition-colors ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-400'}`}
        >
            <HomeIcon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">首页</span>
        </button>
        <button 
            onClick={() => setActiveTab('report')}
            className={`flex flex-col items-center transition-colors ${activeTab === 'report' ? 'text-blue-600' : 'text-gray-400'}`}
        >
            <ChartBarIcon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">投研</span>
        </button>
        <button 
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center transition-colors ${activeTab === 'settings' ? 'text-blue-600' : 'text-gray-400'}`}
        >
            <UserIcon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">我</span>
        </button>
      </div>
    </div>
  );
};

export default WeChatPreview;
