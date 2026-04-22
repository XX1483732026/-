/**
 * 访问统计API
 * 存储到data/stats.json
 */
const fs = require('fs');
const path = require('path');

// 数据文件路径
const DATA_FILE = path.join(process.cwd(), 'data', 'stats.json');

// 确保data目录存在
function ensureDataDir() {
    const dir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// 读取统计数据
function readStats() {
    ensureDataDir();
    if (fs.existsSync(DATA_FILE)) {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
    return { daily: {}, pages: {}, devices: { mobile: 0, desktop: 0 }, records: [] };
}

// 写入统计数据
function writeStats(stats) {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(stats, null, 2));
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
            
            const stats = readStats();
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
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
            
            writeStats(stats);
            
            return res.status(200).json({ success: true });
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }
    
    if (req.method === 'GET') {
        // 返回统计数据（用于展示页面）
        const stats = readStats();
        return res.status(200).json(stats);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
}
