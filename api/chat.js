export default async function handler(req, res) {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 处理预检请求
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const API_URL = 'https://s98st93z8d.coze.site/stream_run';
    const API_TOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImU4MmE0YjNkLWQzNTctNDgwZC05ZDIwLWEyNjk1MThiYzI0MyJ9.eyJpc3MiOiJodHRwczovL2FwaS5jb3plLmNuIiwiYXVkIjpbImhwQlk2S05Fd2FGUnBJYlNHWktlbnBpMGM1Q2xFaHJMIl0sImV4cCI6ODIxMDI2Njg3Njc5OSwiaWF0IjoxNzc2MDExMDE2LCJzdWIiOiJzcGlmZmU6Ly9hcGkuY296ZS5jbi93b3JrbG9hZF9pZGVudGl0eS9pZDo3NjI3ODg1MzM1NjU3MDU0MjM0Iiwic3JjIjoiaW5ib3VuZF9hdXRoX2FjY2Vzc190b2tlbl9pZDo3NjI3OTA5MjMyNTM2MzIyMDgyIn0.fY6UnjX9h09j749TzE65xwGxdA5sfOFapOfh2mEcSnU8Y2FCVkzkN5Cq8PqURH7RPOGJigTnddqfsj5cxTnEyQlsX3y1yXh51Z8i_7kj7i1Osk3A4rjBXN8aKaVTah_XxwmheKKRb00c5z-6Q7Qt_ZIBVba15sBlUMtIlefTmw2SIrR7ziA7cnJeuhQy-COCm1pdBYifMEU7a9hfq7XF4YgZWhKkrjFQMad1F1qCd1HXrmdz_dY62rlWwrf-ePflMyoEAYNp1ACXwkWqrCEmfP1jeqO8xek8uhJy02KKrzL_ftSVrHXJqTe8ZnSGe8t9mARXKlMBNXJ5Vjq4TVnhTw';
    const PROJECT_ID = '7627880092177301550';

    try {
        const { message, sessionId } = req.body;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: {
                    query: {
                        prompt: [{
                            type: 'text',
                            content: { text: message }
                        }]
                    }
                },
                type: 'query',
                session_id: sessionId || 'chat_' + Date.now(),
                project_id: PROJECT_ID
            })
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: 'API请求失败' });
        }

        // 读取流式响应
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let result = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data:')) {
                    try {
                        const data = JSON.parse(line.slice(5));
                        if (data.content) {
                            result = data.content;
                        }
                    } catch (e) {}
                }
            }
        }

        return res.status(200).json({ 
            success: true, 
            content: result || '嘎...小鸦暂时没想好说什么'
        });

    } catch (error) {
        console.error('代理错误:', error);
        return res.status(500).json({ error: '服务器错误' });
    }
}
