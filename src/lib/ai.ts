const apiKey = process.env.SILICONFLOW_API_KEY!;
const API_URL = "https://api.siliconflow.cn/v1/chat/completions";
const MODEL = "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B"; // Free model

export async function summarizeContent(title: string, content: string, replies: string = ""): Promise<string[]> {
    try {
        const prompt = `
你是一位资深的**舆论分析师**和**社会心理观察员**，擅长从嘈杂的社区讨论中提炼出核心逻辑、情绪风向和价值观点。

【帖子信息】
标题: ${title}
正文: ${content || "（无正文内容）"}

【评论区原声】
${replies || "暂无评论"}

【分析任务】
请跳过表面的复述，直接对评论区进行深度“解构”，输出最有价值的分析结论。根据内容丰富程度，灵活输出关键点：

🚀 **分析维度（供参考，无需全部覆盖，只写有价值的）：**
1. **情绪光谱**：评论区的主流情绪是什么？（愤怒/嘲讽/理性/悲观？）背后的社会心理是什么？
2. **逻辑冲突**：如果存在争议，核心分歧点在哪里？双方的底层逻辑分别是什么？
3. **共识提炼**：大家公认的“事实”或“真相”是什么？
4. **高价值建议**：有哪些真正可落地的干货或避坑指南？
5. **神回复/金句**：只收录那些**极其犀利、幽默或一针见血**的评论（需注明出处）。

⛔ **严禁：**
- 严禁流水账式的“有人说...还有人说...”
- 严禁毫无营养的废话总结
- 严禁照搬原文（除非是神回复）

🎯 **输出要求：**
- **必须**包含一条对帖子核心内容的极简概括（放在第一条）
- 观点要**辛辣、简练、直击本质**
- **不必**引用具体的用户名，只需概括观点本身
- **数量不限**，内容越丰富，分析点越多（精彩讨论可输出10条以上）

【输出格式】
每个关键点单独一行，无需编号，无需分类标题，直接输出内容。`;

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: "system", content: "你是一个洞察力极强的舆论分析师。你的目标不是总结，而是'解构'和'提炼'。你的语言风格简练、犀利、直击要害。拒绝平庸的复述，追求有深度的洞察。" },
                    { role: "user", content: prompt }
                ],
                temperature: 0.8, // Slightly higher for creativity in synthesis
                max_tokens: 4096
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`API Error: ${response.status} ${errText}`);
        }

        const data = await response.json() as { choices: Array<{ message: { content: string } }> };
        const text = data.choices[0].message.content;

        // Split by new lines and clean up bullets
        return text
            .split('\n')
            .map((line: string) => line.replace(/^[\d\-\.\*•]+\s*/, '').trim())
            .filter((line: string) => line.length > 0);

    } catch (error) {
        console.error("AI Summarization failed:", error);

        // Log to file
        try {
            const fs = await import('fs');
            const path = await import('path');
            fs.appendFileSync(path.join(process.cwd(), 'debug.log'), `[${new Date().toISOString()}] AI Error: ${error}\n`);
        } catch (e) { console.error("Log failed", e); }

        // Fallback to simple truncation if AI fails
        return [
            content.substring(0, 50) + (content.length > 50 ? "..." : ""),
            "(AI 分析暂时不可用)"
        ];
    }
}
