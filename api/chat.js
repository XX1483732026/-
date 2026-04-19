export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const API_URL = 'https://s98st93z8d.coze.site/stream_run';
    const API_TOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImU4MmE0YjNkLWQzNTctNDgwZC05ZDIwLWEyNjk1MThiYzI0MyJ9.eyJpc3MiOiJodHRwczovL2FwaS5jb3plLmNuIiwiYXVkIjpbImhwQlk2S05Fd2FGUnBJYlNHWktlbnBpMGM1Q2xFaHJMIl0sImV4cCI6ODIxMDI2Njg3Njc5OSwiaWF0IjoxNzc2MDEyODMyLCJzdWIiOiJzcGlmZmU6Ly9hcGkuY296ZS5jbi93b3JrbG9hZF9pZGVudGl0eS9pZDo3NjI3ODg1MzM1NjU3MDU0MjM0Iiwic3JjIjoiaW5ib3VuZF9hdXRoX2FjY2Vzc190b2tlbl9pZDo3NjI3OTE3MDMzODQ1MjkzMDk3In0.PcsjkYRAPJeGFl_gDv7Q8GT9iNRaVTFw3Ap8CGkZS9gNDdawT6QymWW3oVDI6RXzPl4VzEqTQYeRP3UcrX344ACTH8di_bR3MBQ5q9ysfTUifOP_7hsuYEd0_iW75fMpIHjx2ATA-3sw4HpoAaNXVKVUM1OZ7TqkHiNTrubneAOqbILZatj1AS_7Pm1OweAxYnpt79BddpiSjYFH7neS2QvcUzg7LbLsrsJfNbXgHUh1E6xtk-wXzhkpvWW-jgXJUxndXtpgDmBJLx27nb3SmKrxMJggaJSAwBmlcYT4TUXoAQMB0lLCXECy2IA1wWiCLNO9ooCDdV7POiHBp2slcw';
    const PROJECT_ID = '7627880092177301550';

    try {
        const { message, sessionId, testResult, hasContext, images } = req.body;

        // 构建prompt，支持文字+图片
        let prompt = [];
        
        // 添加文字
        if (message) {
            prompt.push({
                type: 'text',
                content: { text: message }
            });
        }
        
        // 添加图片（Base64）
        if (images && images.length > 0) {
            for (const imgData of images) {
                prompt.push({
                    type: 'image',
                    content: { url: imgData }
                });
            }
        }

        let requestBody = {
            content: {
                query: {
                    prompt: prompt
                }
            },
            type: 'query',
            session_id: sessionId || 'chat_' + Date.now(),
            project_id: PROJECT_ID
        };

        if (testResult && hasContext) {
            const contextMessage = `【用户刚完成了精神状态测试】
测试结果：${testResult.emoji} ${testResult.type}
精神状态指数：${testResult.score} / 60
所属区域：${testResult.zone}
请在聊天时根据这个测试结果，给予用户更针对性的心理支持和建议。`;
            requestBody.content.query.additional_messages = [{
                role: 'user',
                content: contextMessage,
                content_type: 'text'
            }];
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: 'API请求失败' });
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let result = '';
        let images = [];  // AI回复的图片
        let tokenCost = null;
        let errorMsg = null;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data:')) {
                    try {
                        const data = JSON.parse(line.slice(5));
                        
                        // 文本内容
                        if (data.type === 'answer' && data.content?.answer) {
                            result += data.content.answer;
                        }
                        
                        // 图片消息 - 多种格式兼容
                        if (data.type === 'image' && data.content?.image_url) {
                            const url = typeof data.content.image_url === 'string' 
                                ? data.content.image_url 
                                : data.content.image_url?.url;
                            if (url) images.push(url);
                        }
                        
                        if (data.type === 'generate_image_success' && data.content?.image_url) {
                            const url = typeof data.content.image_url === 'string' 
                                ? data.content.image_url 
                                : data.content.image_url?.url;
                            if (url) images.push(url);
                        }
                        
                        if (data.type === 'conversation_message' && data.content?.message?.content_type === 'image') {
                            const url = data.content.message.content?.url;
                            if (url) images.push(url);
                        }
                        
                        // token统计
                        if (data.type === 'message_end' && data.content?.message_end) {
                            tokenCost = data.content.message_end.token_cost;
                        }
                        
                        // 错误处理
                        if (data.type === 'error' && data.content?.error) {
                            errorMsg = data.content.error.error_msg;
                        }
                    } catch (e) {}
                }
            }
        }

        if (errorMsg) {
            return res.status(500).json({ error: errorMsg });
        }

        return res.status(200).json({ 
            success: true, 
            content: result || '嘎...小鸦暂时没想好说什么',
            images: images,
            tokenCost: tokenCost
        });

    } catch (error) {
        console.error('代理错误:', error);
        return res.status(500).json({ error: '服务器错误' });
    }
}
