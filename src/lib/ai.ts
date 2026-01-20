const apiKey = process.env.SILICONFLOW_API_KEY!;
const API_URL = "https://api.siliconflow.cn/v1/chat/completions";
const MODEL = "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B"; // Free model

export async function summarizeContent(title: string, content: string, replies: string = ""): Promise<string[]> {
    try {
        const prompt = `
    请阅读以下 V2EX 帖子标题、内容以及评论区讨论（用户的真实反馈）。
    
    标题: ${title}
    内容: ${content || "（无正文内容）"}
    评论区精华:
    ${replies}

    要求：
    1. 用中文回答。
    2. 总结核心话题，并**重点概括评论区网友的观点/争议点/神回复**。
    3. 返回 3 个关键点：
       - 第一点：帖子核心内容。
       - 第二点：网友的主要看法/争议。
       - 第三点：有趣的评论或结论。
    4. 只要返回关键点列表，每行一个，不要有任何废话。
    `;

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: "system", content: "You are a helpful news summarizer assistant." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 512
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`API Error: ${response.status} ${errText}`);
        }

        const data = await response.json();
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
            const fs = require('fs');
            const path = require('path');
            fs.appendFileSync(path.join(process.cwd(), 'debug.log'), `[${new Date().toISOString()}] AI Error: ${error}\n`);
        } catch (e) { console.error("Log failed", e); }

        // Fallback to simple truncation if AI fails
        return [
            content.substring(0, 50) + (content.length > 50 ? "..." : ""),
            "(AI 分析暂时不可用)"
        ];
    }
}
