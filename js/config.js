/**
 * 醒醒鸦 - 全局配置
 */

const CONFIG = {
    // 网站信息
    site: {
        name: '醒醒鸦',
        url: 'https://xingxingya.com',
        slogan: '心境如云，不定义，只看见'
    },
    
    // 图片路径
    images: {
        yages: 'yages/',
        yagesThumbs: 'yages/thumbs/',
        storyImages: 'story_images/',
        logo: 'mengya.png'
    },
    
    // 分区配置
    zones: {
        awake: { name: '清醒区', emoji: '🌅', class: 'awake' },
        blurry: { name: '假寐区', emoji: '🌫️', class: 'blurry' },
        asleep: { name: '沉睡区', emoji: '🌑', class: 'asleep' }
    },
    
    // API配置
    api: {
        chat: '/api/chat.js'
    }
};

// 导出配置（兼容模块和非模块环境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
