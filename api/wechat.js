const crypto = require('crypto');

// 微信公众号配置
const WECHAT_TOKEN = 'xingxingya2026';
const WECHAT_APPID = 'wx680393f75d1c5b91';
const WECHAT_SECRET = 'bfd2bb8694a9d6ebe03e874da3bd348d';

// Coze API配置
const COZE_API_TOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImU4MmE0YjNkLWQzNTctNDgwZC05ZDIwLWEyNjk1MThiYzI0MyJ9.eyJpc3MiOiJodHRwczovL2FwaS5jb3plLmNuIiwiYXVkIjpbImhwQlk2S05Fd2FGUnBJYlNHWktlbnBpMGM1Q2xFaHJMIl0sImV4cCI6ODIxMDI2Njg3Njc5OSwiaWF0IjoxNzc2MDEyODMyLCJzdWIiOiJzcGlmZmU6Ly9hcGkuY296ZS5jbi93b3JrbG9hZF9pZGVudGl0eS9pZDo3NjI3ODg1MzM1NjU3MDU0MjM0Iiwic3JjIjoiaW5ib3VuZF9hdXRoX2FjY2Vzc190b2tlbl9pZDo3NjI3OTE3MDMzODQ1MjkzMDk3In0.PcsjkYRAPJeGFl_gDv7Q8GT9iNRaVTFw3Ap8CGkZS9gNDdawT6QymWW3oVDI6RXzPl4VzEqTQYeRP3UcrX344ACTH8di_bR3MBQ5q9ysfTUifOP_7hsuYEd0_iW75fMpIHjx2ATA-3sw4HpoAaNXVKVUM1OZ7TqkHiNTrubneAOqbILZatj1AS_7Pm1OweAxYnpt79BddpiSjYFH7neS2QvcUzg7LbLsrsJfNbXgHUh1E6xtk-wXzhkpvWW-jgXJUxndXtpgDmBJLx27nb3SmKrxMJggaJSAwBmlcYT4TUXoAQMB0lLCXECy2IA1wWiCLNO9ooCDdV7POiHBp2slcw';
const COZE_BOT_ID = '7627880092177301550';

// 验证微信签名
function verifySignature(signature, timestamp, nonce) {
  const arr = [WECHAT_TOKEN, timestamp, nonce].sort();
  const str = arr.join('');
  const sha1 = crypto.createHash('sha1').update(str).digest('hex');
  return sha1 === signature;
}

// 获取微信access_token
async function getAccessToken() {
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT_APPID}&secret=${WECHAT_SECRET}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.access_token;
}

// 发送文本消息给用户
async function sendTextMessage(openid, content, accessToken) {
  const url = `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${accessToken}`;
  const body = {
    touser: openid,
    msgtype: 'text',
    text: { content }
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return await res.json();
}

// 调用Coze API获取回复
async function getCozeReply(userMessage, userId) {
  const url = 'https://api.coze.cn/v3/chat';
  const body = {
    bot_id: COZE_BOT_ID,
    user_id: userId,
    stream: false,
    auto_save_history: true,
    additional_messages: [
      {
        role: 'user',
        content: userMessage,
        content_type: 'text'
      }
    ]
  };
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${COZE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  
  const data = await res.json();
  
  // 解析Coze返回的消息
  if (data.data && data.data.length > 0) {
    // 找到assistant的回复
    const assistantMsg = data.data.find(item => 
      item.role === 'assistant' && item.type === 'answer'
    );
    if (assistantMsg && assistantMsg.content) {
      return assistantMsg.content;
    }
  }
  
  return '抱歉，我暂时无法回答，请稍后再试~';
}

// 解析XML
function parseXML(xml) {
  const result = {};
  const regex = /<(\w+)><!\[CDATA\[(.*?)\]\]><\/\1>|<(\w+)>(.*?)<\/\3>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const key = match[1] || match[3];
    const value = match[2] || match[4];
    result[key] = value;
  }
  return result;
}

// 生成XML回复
function generateTextReply(toUser, fromUser, content) {
  const time = Math.floor(Date.now() / 1000);
  return `<xml>
  <ToUserName><![CDATA[${toUser}]]></ToUserName>
  <FromUserName><![CDATA[${fromUser}]]></FromUserName>
  <CreateTime>${time}</CreateTime>
  <MsgType><![CDATA[text]]></MsgType>
  <Content><![CDATA[${content}]]></Content>
</xml>`;
}

export default async function handler(req, res) {
  // 处理GET请求 - 微信服务器验证
  if (req.method === 'GET') {
    const { signature, timestamp, nonce, echostr } = req.query;
    
    if (verifySignature(signature, timestamp, nonce)) {
      res.status(200).send(echostr);
    } else {
      res.status(403).send('Invalid signature');
    }
    return;
  }
  
  // 处理POST请求 - 接收微信消息
  if (req.method === 'POST') {
    const { signature, timestamp, nonce } = req.query;
    
    // 验证签名
    if (!verifySignature(signature, timestamp, nonce)) {
      res.status(403).send('Invalid signature');
      return;
    }
    
    // 获取请求体
    let body = '';
    for await (const chunk of req) {
      body += chunk;
    }
    
    // 解析XML消息
    const message = parseXML(body);
    const { FromUserName, ToUserName, MsgType, Content } = message;
    
    // 只处理文本消息
    if (MsgType === 'text' && Content) {
      try {
        // 调用Coze获取回复
        const reply = await getCozeReply(Content, FromUserName);
        
        // 返回XML回复
        const xmlReply = generateTextReply(FromUserName, ToUserName, reply);
        res.status(200).setHeader('Content-Type', 'application/xml');
        res.send(xmlReply);
      } catch (error) {
        console.error('Error:', error);
        res.status(200).setHeader('Content-Type', 'application/xml');
        res.send(generateTextReply(FromUserName, ToUserName, '系统开小差了，请稍后再试~'));
      }
    } else {
      // 非文本消息回复提示
      res.status(200).setHeader('Content-Type', 'application/xml');
      res.send(generateTextReply(FromUserName, ToUserName, '我暂时只支持文字聊天哦~'));
    }
    return;
  }
  
  res.status(405).send('Method not allowed');
}
