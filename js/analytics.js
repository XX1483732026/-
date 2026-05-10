/**
 * 醒醒鸦访问统计脚本 - 增强版
 * 新增：页面停留时间、点击事件追踪、滚动深度、来源渠道细分
 */
(function() {
    'use strict';
    
    const Stats = {
        // 配置
        config: {
            apiEndpoint: '/api/stats',
            sessionId: 's_' + Math.random().toString(36).substr(2, 9),
            heartbeatInterval: 30000, // 30秒发送一次心跳
            maxScrollDepth: 0,
            timeOnPage: 0,
            startTime: Date.now(),
            isFirstPage: true,
            lastHeartbeat: Date.now()
        },
        
        // 收集基础数据
        collectBaseData() {
            return {
                page: window.location.pathname,
                title: document.title,
                time: new Date().toISOString(),
                referrer: document.referrer || 'direct',
                device: this.detectDevice(),
                screen: window.innerWidth + 'x' + window.innerHeight,
                browser: this.detectBrowser(),
                language: navigator.language || 'zh-CN',
                sessionId: this.config.sessionId,
                isFirstPage: this.config.isFirstPage,
                utm: this.parseUTMParams()
            };
        },
        
        // 检测设备类型
        detectDevice() {
            const ua = navigator.userAgent.toLowerCase();
            if (/mobile|android|iphone|ipad|ipod/i.test(ua)) {
                if (/ipad|tablet|kindle/i.test(ua)) return 'tablet';
                return 'mobile';
            }
            return 'desktop';
        },
        
        // 检测浏览器
        detectBrowser() {
            const ua = navigator.userAgent;
            if (ua.includes('MicroMessenger')) return 'wechat';
            if (ua.includes('DingTalk')) return 'dingtalk';
            if (ua.includes('FeiSu')) return 'feishu';
            if (ua.includes('Safari') && !ua.includes('Chrome')) return 'safari';
            if (ua.includes('Chrome')) return 'chrome';
            if (ua.includes('Firefox')) return 'firefox';
            if (ua.includes('Edge')) return 'edge';
            return 'other';
        },
        
        // 解析UTM参数
        parseUTMParams() {
            const params = new URLSearchParams(window.location.search);
            return {
                source: params.get('utm_source') || this.parseReferrer().source,
                medium: params.get('utm_medium') || this.parseReferrer().medium,
                campaign: params.get('utm_campaign') || null,
                term: params.get('utm_term') || null,
                content: params.get('utm_content') || null
            };
        },
        
        // 解析来源渠道
        parseReferrer() {
            const ref = document.referrer;
            if (!ref) return { source: 'direct', medium: 'none' };
            
            try {
                const url = new URL(ref);
                const host = url.hostname.replace('www.', '');
                
                // 搜索引擎
                const searchEngines = {
                    'baidu.com': { source: 'baidu', medium: 'organic' },
                    'google.com': { source: 'google', medium: 'organic' },
                    'bing.com': { source: 'bing', medium: 'organic' },
                    'sogou.com': { source: 'sogou', medium: 'organic' },
                    'so.com': { source: '360', medium: 'organic' }
                };
                
                for (const [domain, channel] of Object.entries(searchEngines)) {
                    if (host.includes(domain)) return channel;
                }
                
                // 社交平台
                const socialPlatforms = {
                    'weibo.com': 'weibo',
                    'weixin.qq.com': 'wechat',
                    'mp.weixin.qq.com': 'wechat_article',
                    'xiaohongshu.com': 'xiaohongshu',
                    'douban.com': 'douban',
                    'zhihu.com': 'zhihu',
                    'twitter.com': 'twitter',
                    'x.com': 'twitter',
                    'facebook.com': 'facebook',
                    'instagram.com': 'instagram'
                };
                
                for (const [domain, platform] of Object.entries(socialPlatforms)) {
                    if (host.includes(domain)) return { source: platform, medium: 'social' };
                }
                
                // 其他网站
                return { source: host, medium: 'referral' };
            } catch (e) {
                return { source: 'direct', medium: 'none' };
            }
        },
        
        // 追踪页面停留时间
        trackTimeOnPage() {
            // 使用 visibilitychange 更准确
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden') {
                    this.sendTimeUpdate();
                }
            });
            
            // 页面卸载时发送
            window.addEventListener('beforeunload', () => {
                this.sendTimeUpdate();
            });
            
            // 定期发送心跳
            setInterval(() => {
                if (document.visibilityState === 'visible') {
                    this.sendHeartbeat();
                }
            }, this.config.heartbeatInterval);
        },
        
        // 发送时间更新
        sendTimeUpdate() {
            const timeOnPage = Math.round((Date.now() - this.config.startTime) / 1000);
            this.sendData({
                type: 'time_update',
                timeOnPage: timeOnPage
            });
        },
        
        // 发送心跳
        sendHeartbeat() {
            const timeOnPage = Math.round((Date.now() - this.config.startTime) / 1000);
            this.sendData({
                type: 'heartbeat',
                timeOnPage: timeOnPage
            });
        },
        
        // 追踪滚动深度
        trackScrollDepth() {
            const updateScrollDepth = () => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrollPercent = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 100;
                
                if (scrollPercent > this.config.maxScrollDepth) {
                    this.config.maxScrollDepth = scrollPercent;
                    
                    // 在25%, 50%, 75%, 100%时记录
                    const milestones = [25, 50, 75, 100];
                    milestones.forEach(milestone => {
                        if (scrollPercent >= milestone && scrollPercent - 10 < milestone) {
                            this.sendData({
                                type: 'scroll_milestone',
                                milestone: milestone,
                                maxDepth: this.config.maxScrollDepth
                            });
                        }
                    });
                }
            };
            
            // 使用节流
            let ticking = false;
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        updateScrollDepth();
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true });
        },
        
        // 追踪点击事件
        trackClickEvents() {
            // 关键按钮选择器
            const trackedButtons = [
                // 聊天相关
                { selector: '#sendBtn, [id*="send"], [class*="send"]', name: 'chat_send' },
                { selector: '#startChat, [class*="start-chat"]', name: 'chat_start' },
                { selector: '[class*="chat-input"]', name: 'chat_input' },
                
                // 测试相关
                { selector: '[id*="test"], [class*="test"]', name: 'start_test' },
                { selector: '[class*="begin"], [class*="start"]', name: 'begin_action' },
                
                // 导航相关
                { selector: 'nav a, .nav-link, [class*="nav"] a', name: 'nav_click' },
                
                // 分享/收藏
                { selector: '[class*="share"], [class*="favorite"], [class*="bookmark"]', name: 'share_action' },
                
                // 外部链接
                { selector: 'a[href*="weixin"], a[href*="mp.weixin"]', name: 'external_wechat' },
                { selector: 'a[target="_blank"]', name: 'external_link' }
            ];
            
            // 事件委托处理点击
            document.addEventListener('click', (e) => {
                const target = e.target.closest('a, button, [role="button"]');
                if (!target) return;
                
                const rect = target.getBoundingClientRect();
                const clickPosition = {
                    x: Math.round((e.clientX - rect.left) / rect.width * 100),
                    y: Math.round((e.clientY - rect.top) / rect.height * 100)
                };
                
                let eventName = 'generic_click';
                let eventData = {};
                
                // 匹配按钮类型
                for (const btn of trackedButtons) {
                    if (target.matches(btn.selector) || target.closest(btn.selector)) {
                        eventName = btn.name;
                        break;
                    }
                }
                
                // 获取链接信息
                if (target.tagName === 'A') {
                    eventData.href = target.href;
                    eventData.external = !target.href.includes(window.location.hostname);
                }
                
                this.sendData({
                    type: 'click',
                    eventName: eventName,
                    element: this.getElementInfo(target),
                    position: clickPosition,
                    page: window.location.pathname
                });
            });
        },
        
        // 获取元素信息
        getElementInfo(element) {
            return {
                tag: element.tagName.toLowerCase(),
                id: element.id || null,
                class: element.className || null,
                text: element.textContent?.trim().substring(0, 50) || null
            };
        },
        
        // 追踪表单交互
        trackFormEvents() {
            // 追踪输入
            document.addEventListener('input', (e) => {
                const target = e.target;
                if (target.matches('input, textarea')) {
                    this.sendData({
                        type: 'form_input',
                        field: target.name || target.id || 'unknown',
                        inputLength: target.value.length,
                        page: window.location.pathname
                    });
                }
            });
        },
        
        // 发送数据
        sendData(data) {
            const payload = {
                ...this.collectBaseData(),
                ...data,
                timestamp: Date.now()
            };
            
            if (navigator.sendBeacon) {
                navigator.sendBeacon(this.config.apiEndpoint, JSON.stringify(payload));
            } else {
                fetch(this.config.apiEndpoint, {
                    method: 'POST',
                    body: JSON.stringify(payload),
                    keepalive: true
                }).catch(() => {});
            }
        },
        
        // 初始化
        init() {
            // 标记首次访问
            if (!sessionStorage.getItem('stats_init')) {
                sessionStorage.setItem('stats_init', 'true');
                this.config.isFirstPage = true;
            } else {
                this.config.isFirstPage = false;
            }
            
            // 页面可见时立即发送基础PV
            this.sendData({ type: 'pageview' });
            
            // 启动各项追踪
            this.trackTimeOnPage();
            this.trackScrollDepth();
            this.trackClickEvents();
            this.trackFormEvents();
            
            // 页面卸载前发送最终数据
            window.addEventListener('pagehide', () => {
                const finalData = {
                    type: 'page_exit',
                    timeOnPage: Math.round((Date.now() - this.config.startTime) / 1000),
                    maxScrollDepth: this.config.maxScrollDepth
                };
                this.sendData(finalData);
            });
        }
    };
    
    // 启动统计
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => Stats.init());
    } else {
        Stats.init();
    }
    
    // 暴露全局方法供外部调用
    window.XingXingYaStats = {
        track: (eventName, eventData) => {
            Stats.sendData({
                type: 'custom_event',
                eventName: eventName,
                ...eventData
            });
        },
        trackConversion: (conversionName) => {
            Stats.sendData({
                type: 'conversion',
                conversionName: conversionName
            });
        }
    };
})();
