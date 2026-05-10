/**
 * 访问统计API - 增强版
 * 新增：停留时间、点击事件、滚动深度、来源渠道、浏览器分布等统计
 */

// 全局内存存储 - 增强版
if (!global.statsData) {
    global.statsData = {
        // 基础统计
        daily: {},
        pages: {},
        devices: { mobile: 0, desktop: 0, tablet: 0 },
        
        // 新增统计维度
        browsers: {},      // 浏览器分布
        sources: {},      // 来源渠道
        mediums: {},      // 流量类型
        scrollDepth: {    // 滚动深度分布
            '0-25': 0,
            '26-50': 0,
            '51-75': 0,
            '76-100': 0
        },
        timeOnPage: [],    // 停留时间记录
        clicks: {},        // 点击事件统计
        conversions: {},   // 转化事件
        
        // 最近记录
        records: [],
        
        // 汇总数据
        totalPV: 0,
        totalUV: 0,
        avgTimeOnPage: 0
    };
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
            let data = req.body;
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }
            
            const stats = global.statsData;
            const today = new Date().toISOString().split('T')[0];
            const page = data.page || '/';
            
            // 初始化今日数据
            if (!stats.daily[today]) {
                stats.daily[today] = { 
                    pv: 0, 
                    uv: 0,
                    sources: {},
                    timeOnPage: [],
                    scrollDepth: { '0-25': 0, '26-50': 0, '51-75': 0, '76-100': 0 }
                };
            }
            
            // 根据事件类型处理
            const eventType = data.type || 'pageview';
            
            switch (eventType) {
                case 'pageview':
                case 'heartbeat':
                    // 更新PV
                    stats.daily[today].pv += 1;
                    stats.totalPV += 1;
                    
                    // 尝试更新UV (基于sessionId去重)
                    const sessionKey = `uv_${data.sessionId}_${today}`;
                    if (!global[sessionKey]) {
                        global[sessionKey] = true;
                        stats.daily[today].uv += 1;
                        stats.totalUV += 1;
                    }
                    
                    // 更新页面访问量
                    if (!stats.pages[page]) {
                        stats.pages[page] = { count: 0, timeTotal: 0, views: 0 };
                    }
                    stats.pages[page].count += 1;
                    stats.pages[page].views += 1;
                    
                    // 更新设备分布
                    const device = data.device || 'desktop';
                    if (stats.devices[device] !== undefined) {
                        stats.devices[device] += 1;
                    } else {
                        stats.devices.desktop += 1;
                    }
                    
                    // 更新浏览器分布
                    const browser = data.browser || 'other';
                    stats.browsers[browser] = (stats.browsers[browser] || 0) + 1;
                    
                    // 更新来源渠道
                    const source = data.utm?.source || data.referrer || 'direct';
                    if (!stats.sources[source]) {
                        stats.sources[source] = 0;
                    }
                    stats.sources[source] += 1;
                    
                    // 更新流量类型
                    const medium = data.utm?.medium || 'none';
                    if (!stats.mediums[medium]) {
                        stats.mediums[medium] = 0;
                    }
                    stats.mediums[medium] += 1;
                    
                    // 更新今日来源
                    if (!stats.daily[today].sources[source]) {
                        stats.daily[today].sources[source] = 0;
                    }
                    stats.daily[today].sources[source] += 1;
                    break;
                    
                case 'time_update':
                case 'page_exit':
                    // 记录停留时间
                    const timeOnPage = data.timeOnPage || 0;
                    if (timeOnPage > 0 && timeOnPage < 3600) { // 排除异常值
                        stats.timeOnPage.push({ time: timeOnPage, page, date: today });
                        stats.daily[today].timeOnPage.push(timeOnPage);
                        
                        // 保持最近1000条记录
                        if (stats.timeOnPage.length > 1000) {
                            stats.timeOnPage = stats.timeOnPage.slice(-1000);
                        }
                        
                        // 更新页面平均停留时间
                        if (stats.pages[page]) {
                            stats.pages[page].timeTotal += timeOnPage;
                            stats.pages[page].avgTime = Math.round(
                                stats.pages[page].timeTotal / stats.pages[page].views
                            );
                        }
                        
                        // 计算全局平均停留时间
                        const totalTime = stats.timeOnPage.reduce((sum, r) => sum + r.time, 0);
                        stats.avgTimeOnPage = Math.round(totalTime / stats.timeOnPage.length);
                    }
                    break;
                    
                case 'scroll_milestone':
                    // 记录滚动深度
                    const depth = data.maxScrollDepth || 0;
                    let depthRange = '0-25';
                    if (depth > 75) depthRange = '76-100';
                    else if (depth > 50) depthRange = '51-75';
                    else if (depth > 25) depthRange = '26-50';
                    
                    stats.scrollDepth[depthRange] += 1;
                    stats.daily[today].scrollDepth[depthRange] += 1;
                    break;
                    
                case 'click':
                    // 记录点击事件
                    const clickName = data.eventName || 'unknown';
                    if (!stats.clicks[clickName]) {
                        stats.clicks[clickName] = 0;
                    }
                    stats.clicks[clickName] += 1;
                    
                    // 记录具体元素点击
                    const elementKey = `${clickName}_${data.element?.tag || 'unknown'}`;
                    if (!stats.clicks.details) {
                        stats.clicks.details = {};
                    }
                    if (!stats.clicks.details[elementKey]) {
                        stats.clicks.details[elementKey] = 0;
                    }
                    stats.clicks.details[elementKey] += 1;
                    break;
                    
                case 'conversion':
                    // 记录转化事件
                    const conversionName = data.conversionName || 'unknown';
                    if (!stats.conversions[conversionName]) {
                        stats.conversions[conversionName] = 0;
                    }
                    stats.conversions[conversionName] += 1;
                    break;
                    
                case 'form_input':
                    // 记录表单输入（用于分析用户参与度）
                    // 可选：记录输入长度分布
                    break;
                    
                case 'custom_event':
                    // 自定义事件 - 记录事件名称
                    const customName = data.eventName || 'unknown';
                    if (!stats.customEvents) {
                        stats.customEvents = {};
                    }
                    if (!stats.customEvents[customName]) {
                        stats.customEvents[customName] = 0;
                    }
                    stats.customEvents[customName] += 1;
                    break;
            }
            
            // 保存最近200条详细记录
            const record = {
                ...data,
                eventType,
                date: today,
                time: new Date().toISOString()
            };
            stats.records.unshift(record);
            if (stats.records.length > 200) {
                stats.records = stats.records.slice(0, 200);
            }
            
            return res.status(200).json({ success: true, eventType });
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }
    
    if (req.method === 'GET') {
        const stats = global.statsData;
        
        // 计算7天趋势
        const trend = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            trend.push({
                date: dateStr,
                pv: stats.daily[dateStr]?.pv || 0,
                uv: stats.daily[dateStr]?.uv || 0
            });
        }
        
        // 排序页面访问
        const pageRanking = Object.entries(stats.pages)
            .map(([page, data]) => ({ page, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        
        // 排序来源渠道
        const sourceRanking = Object.entries(stats.sources)
            .map(([source, count]) => ({ source, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        
        // 计算滚动深度分布百分比
        const totalScrolls = Object.values(stats.scrollDepth).reduce((a, b) => a + b, 0);
        const scrollDistribution = {};
        for (const [range, count] of Object.entries(stats.scrollDepth)) {
            scrollDistribution[range] = {
                count,
                percent: totalScrolls > 0 ? Math.round(count / totalScrolls * 100) : 0
            };
        }
        
        // 点击事件排行
        const clickRanking = Object.entries(stats.clicks)
            .filter(([key]) => key !== 'details')
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
        
        return res.status(200).json({
            // 基础统计
            today: stats.daily[new Date().toISOString().split('T')[0]] || { pv: 0, uv: 0 },
            totalPV: stats.totalPV,
            totalUV: stats.totalUV,
            
            // 设备分布
            devices: stats.devices,
            
            // 浏览器分布
            browsers: stats.browsers,
            
            // 来源分析
            sources: stats.sources,
            mediums: stats.mediums,
            
            // 停留时间
            avgTimeOnPage: stats.avgTimeOnPage,
            timeOnPageCount: stats.timeOnPage.length,
            
            // 滚动深度
            scrollDepth: scrollDistribution,
            totalScrolls,
            
            // 点击事件
            clicks: stats.clicks,
            clickRanking,
            
            // 转化事件
            conversions: stats.conversions,
            
            // 自定义事件
            customEvents: stats.customEvents || {},
            
            // 7天趋势
            trend,
            
            // 页面排行
            pageRanking,
            sourceRanking,
            
            // 更新记录
            recentRecords: stats.records.slice(0, 20)
        });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
}
