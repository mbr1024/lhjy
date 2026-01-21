
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // CASM: 允许跨域
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

        try {
            // 1. 获取热榜: /
            if (url.pathname === '/' || url.pathname === '/hot') {
                const response = await fetch('https://www.v2ex.com/api/topics/hot.json', {
                    headers: { 'User-Agent': userAgent }
                });
                return new Response(response.body, {
                    status: response.status,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            // 2. 获取回复: /replies?topic_id=xxx
            if (url.pathname === '/replies') {
                const topicId = url.searchParams.get('topic_id');
                if (!topicId) {
                    return new Response(JSON.stringify({ error: 'Missing topic_id' }), { status: 400, headers: corsHeaders });
                }

                const targetUrl = `https://www.v2ex.com/api/replies/show.json?topic_id=${topicId}`;
                const response = await fetch(targetUrl, {
                    headers: { 'User-Agent': userAgent }
                });

                // 检查上游状态
                if (!response.ok) {
                    const text = await response.text();
                    return new Response(JSON.stringify({
                        error: `Upstream Error: ${response.status}`,
                        body: text.substring(0, 200) // 截取部分内容防止过大
                    }), {
                        status: response.status, // 透传状态码 (如 403, 429)
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                }

                // 尝试解析 JSON 确保安全
                const textSize = await response.text();
                try {
                    JSON.parse(textSize); // 验证是否为合法 JSON
                    return new Response(textSize, {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                } catch (e) {
                    return new Response(JSON.stringify({
                        error: 'Invalid JSON from V2EX',
                        preview: textSize.substring(0, 200)
                    }), {
                        status: 502,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                }
            }

            return new Response('Not Found', { status: 404, headers: corsHeaders });

        } catch (err) {
            return new Response(JSON.stringify({ error: err.toString() }), { status: 500, headers: corsHeaders });
        }
    },
};
