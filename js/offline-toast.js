/**
 * 离线提示公共组件
 * 统一管理网络状态提示
 */

(function() {
    // 创建离线提示DOM
    function createOfflineToast() {
        // 如果已存在则不重复创建
        if (document.getElementById('offlineToast')) return;
        
        var toast = document.createElement('div');
        toast.className = 'offline-toast';
        toast.id = 'offlineToast';
        toast.innerHTML = 
            '<button class="close-toast" onclick="hideOfflineToast()">×</button>' +
            '<span class="offline-icon">🐦‍⬛</span>' +
            '<span class="offline-text">小鸦飞去找网络了<span class="dots">...</span></span>' +
            '<button class="reconnect-btn" onclick="location.reload()">重新连接</button>';
        document.body.appendChild(toast);
    }
    
    // 显示离线提示
    function showOfflineToast() {
        var toast = document.getElementById('offlineToast');
        if (toast) toast.classList.add('show');
    }
    
    // 隐藏离线提示
    window.hideOfflineToast = function() {
        var toast = document.getElementById('offlineToast');
        if (toast) toast.classList.remove('show');
    };
    
    // 初始化
    function init() {
        createOfflineToast();
        
        // 监听网络状态
        window.addEventListener('offline', showOfflineToast);
        window.addEventListener('online', window.hideOfflineToast);
        
        // 页面加载时检查网络状态
        if (!navigator.onLine) {
            showOfflineToast();
        }
    }
    
    // DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
