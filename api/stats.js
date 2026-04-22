/**
 * 访问统计API - 使用内存存储（Vercel免费版兼容）
 * 注意：数据会在部署重启后丢失，但日常使用没问题
 */

// 全局内存存储
if (!global.statsData) {
    global.statsData = { daily: {}, pages: {}, devices: { mobile: 0, desktop: 0 }, records: [] };
}

export default function handler(req, res) {
    // 允许跨域
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method === 'POST') {
        try {
            // 解析数据
            let data = req.body;
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }
            
            const stats = global.statsData;
            const today = new Date().toISOString().split('T')[0];
            const page = data.page || '/';
            
            // 更新每日访问量
            if (!stats.daily[today]) {
                stats.daily[today] = { pv: 0, uv: 0 };
            }
            stats.daily[today].pv += 1;
            
            // 更新页面访问量
            if (!stats.pages[page]) {
                stats.pages[page] = 0;
            }
            stats.pages[page] += 1;
            
            // 更新设备分布
            if (data.device === 'mobile') {
                stats.devices.mobile += 1;
            } else {
                stats.devices.desktop += 1;
            }
            
            // 保存最近100条记录
            stats.records.unshift({
                ...data,
                date: today
            });
            stats.records = stats.records.slice(0, 100);
            
            return res.status(200).json({ success: true, pv: stats.daily[today].pv });
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }
    
    if (req.method === 'GET') {
        return res.status(200).json(global.statsData);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
}
