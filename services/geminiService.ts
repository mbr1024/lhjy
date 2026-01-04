
import { GoogleGenAI } from "@google/genai";
import { SystemStats, Trade, OrderType } from "../types";

/**
 * Generates a daily executive summary report using the Gemini AI model.
 */
const generateDailyReport = async (stats: SystemStats, recentTrades: Trade[]): Promise<string> => {
  // Use the API key from process.env.API_KEY directly as required.
  // Initializing GoogleGenAI inside the function ensures the most up-to-date API key is used.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Fix: Comparison between OrderType enum and string literal 'LONG' which have no overlap.
  const tradeSummary = recentTrades.slice(-5).map(t => 
    `${t.type === OrderType.LONG ? '做多' : '做空'} 价格: ${t.price} (${t.profit ? '已平仓' : '持仓中'})`
  ).join(', ');

  // Fix: currentVersion is now available on stats due to update in types.ts
  const prompt = `
    你是一个针对“燃料油主力合约”的高频量化交易系统的 AI 引擎。
    
    当前统计数据：
    - 胜率: ${stats.winRate}%
    - 当日盈亏: ${stats.dailyPnL}
    - 交易次数: ${stats.tradeCount}
    - 系统版本: ${stats.currentVersion}
    
    近期活动: ${tradeSummary}

    请用中文生成一份简短、专业的“收盘总结”执行摘要（最多 100 字）。
    重点关注 AI 的自优化表现和市场适应性。语气要专业、有技术感且自信。
  `;

  try {
    // Calling generateContent with the appropriate model for basic text tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // The response.text property directly returns the generated string.
    return response.text || "分析完成，未返回文本。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 分析服务暂时不可用。";
  }
};

export { generateDailyReport };