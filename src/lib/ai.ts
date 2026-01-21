const apiKey = process.env.SILICONFLOW_API_KEY!;
const API_URL = "https://api.siliconflow.cn/v1/chat/completions";
const MODEL = "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B"; // Free model

export async function summarizeContent(title: string, content: string, replies: string = ""): Promise<string[]> {
    try {
        const prompt = `
你是一位资深的 V2EX 社区观察员，擅长从大量讨论中提炼精华。

【帖子信息】
标题: ${title}
正文: ${content || "（无正文内容）"}

【评论区原声】
${replies || "暂无评论"}

【分析任务】
请深入挖掘这个帖子和评论区的价值，根据内容丰富程度，输出**不限数量**的关键点：

📌 **必须包含：**
1. 帖子核心内容（1句话概括）

📢 **评论区分析（根据实际情况，有多少写多少）：**
- 主流观点：大多数人认同什么？
- 争议焦点：存在分歧的话题，双方观点各是什么？
- 干货建议：有价值的经验、建议、解决方案
- 神回复/金句：有梗、犀利、引人共鸣的评论
- 有趣的讨论：吐槽、段子、意外发现等

⚠️ **重要要求：**
- 所有观点必须引用原评论，格式：@用户名 说"原文内容"
- 关键点数量不限，根据内容丰富程度决定，精彩内容越多，关键点越多
- 如果评论特别精彩，可以输出 5-10 个甚至更多关键点
- 如果评论很少或质量一般，2-3 个关键点也可以

【输出格式】
每个关键点单独一行，无需编号，不要开头语和总结语。`;

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: "system", content: "你是一个专业的社区讨论分析师，善于从评论区中发现有价值的观点和有趣的回复。根据内容丰富程度动态输出分析，不要限制关键点数量，精彩内容多就多写，内容少就少写。" },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
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
