/**
 * 醒醒鸦访问统计脚本
 */
(function() {
    // 收集数据
    const data = {
        page: window.location.pathname,
        title: document.title,
        time: new Date().toISOString(),
        referrer: document.referrer || 'direct',
        device: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        screen: window.innerWidth + 'x' + window.innerHeight
    };
    
    // 异步发送，不阻塞页面
    if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/stats', JSON.stringify(data));
    } else {
        fetch('/api/stats', {
            method: 'POST',
            body: JSON.stringify(data),
            keepalive: true
        }).catch(() => {}); // 静默失败
    }
})();
