import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';

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
    const PROJECT_ID = process.env.COZE_PROJECT_ID || '7627880092177301550';
    
    // 验证Token是否存在
    if (!API_TOKEN) {
        return res.status(500).json({ error: 'API Token未配置' });
    }

    try {
        const { message, sessionId, testResult, hasContext, images, files } = req.body;

        // ========== 核心修复：使用正确的 Coze API 格式 ==========
        
        // 1. 构建消息内容数组 (object_string 格式)
        let messageContent = [];
        
        // 添加文本内容
        let textContent = message || '';
        
        // 处理文件 - 尝试解析为文本
        if (files && files.length > 0) {
            for (const file of files) {
                try {
                    const base64Data = file.content.split(',')[1];
                    const buffer = Buffer.from(base64Data, 'base64');
                    
                    if (file.name.endsWith('.txt')) {
                        const text = buffer.toString('utf-8');
                        textContent += `\n\n【文件：${file.name}】\n${text}`;
                    } else if (file.name.endsWith('.docx')) {
                        const result = await mammoth.extractRawText({ buffer });
                        textContent += `\n\n【文件：${file.name}】\n${result.value}`;
                    } else if (file.name.endsWith('.pdf')) {
                        const data = await pdfParse(buffer);
                        textContent += `\n\n【文件：${file.name}】\n${data.text}`;
                    } else {
                        textContent += `\n\n[用户上传了 ${file.name}，暂只支持Word/PDF/TXT]`;
                    }
                } catch (e) {
                    console.error('解析文件失败:', e);
                    textContent += `\n\n[文件 ${file.name} 解析失败]`;
                }
            }
        }
        
        // 添加文本到消息内容
        messageContent.push({
            type: 'text',
            text: textContent
        });
        
        // 2. 处理图片 - 需要上传到 Coze 获取 file_id
        if (images && images.length > 0) {
            for (const imgDataUrl of images) {
                try {
                    // 提取 base64 数据和 MIME 类型
                    const matches = imgDataUrl.match(/^data:([^;]+);base64,(.+)$/);
                    if (matches) {
                        const mimeType = matches[1];
                        const base64Data = matches[2];
                        const buffer = Buffer.from(base64Data, 'base64');
                        
                        // 上传到 Coze
                        const formData = new FormData();
                        formData.append('file', new Blob([buffer], { type: mimeType }), 'image.png');
                        
                        const uploadRes = await fetch('https://api.coze.cn/v1/files/upload', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${API_TOKEN}`
                            },
                            body: formData
                        });
                        
                        const uploadData = await uploadRes.json();
                        
                        if (uploadData.code === 0 && uploadData.data?.id) {
                            messageContent.push({
                                type: 'image',
                                file_id: uploadData.data.id
                            });
                        } else {
                            console.error('图片上传失败:', uploadData);
                            // 上传失败则附加到文本说明
                            textContent += '\n\n[用户发送了一张图片，但上传失败]';
                        }
                    }
                } catch (e) {
                    console.error('处理图片失败:', e);
                    textContent += '\n\n[用户发送了一张图片，但处理失败]';
                }
            }
        }
        
        // 重新构建消息内容（如果文本被修改）
        if (messageContent[0].text !== textContent) {
            messageContent[0].text = textContent;
        }

        // ========== 构建符合 Coze API 标准的请求体 ==========
        let requestBody = {
            content: JSON.stringify(messageContent),  // 必须是 JSON 字符串
            type: 'query',
            session_id: sessionId || 'chat_' + Date.now(),
            project_id: PROJECT_ID
        };

        // 如果有测试结果，添加到 additional_messages
        if (testResult && hasContext) {
            const score = testResult.score || {};
            const totalScore = (score.电量 || 0) + (score.情绪 || 0) + (score.行动 || 0) + (score.连接 || 0);
            
            const contextMessage = `【用户刚完成了精神状态测试】
测试结果：${testResult.emoji || '🐦‍⬛'} ${testResult.type}
心境状态指数：
- 电量：${score.电量 || 0}分
- 情绪：${score.情绪 || 0}分  
- 行动：${score.行动 || 0}分
- 连接：${score.连接 || 0}分
- 总分：${totalScore} / 60

所属区域：${testResult.zone}
状态描述：${testResult.desc || ''}

请在聊天时根据这个测试结果，给予用户更针对性的心理支持和建议。`;

            requestBody.additional_messages = [{
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
                        
                        if (data.type === 'answer' && data.content?.answer) {
                            result += data.content.answer;
                        }
                        if (data.type === 'message_end' && data.content?.message_end) {
                            tokenCost = data.content.message_end.token_cost;
                        }
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
            tokenCost: tokenCost
        });

    } catch (error) {
        console.error('代理错误:', error);
        return res.status(500).json({ error: '服务器错误' });
    }
}
