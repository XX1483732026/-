/**
 * 绘本页面逻辑
 */

// 绘本数据
const storyPages = [
    {page:1, text:"", title:"小鸦的云朵心事"},
    {page:2, text:"清晨，小鸦从一团灰蒙蒙的雾气中醒来，感觉身体沉甸甸的。"},
    {page:3, text:"我怎么了？小鸦问池塘，池塘只回以轻柔的水波声。"},
    {page:4, text:"它决定出去走走，也许会找到答案。森林安静得像在沉睡。"},
    {page:5, text:"走了很久，小鸦遇见了一只飘在空中的小幽灵。"},
    {page:6, text:"你也感到累了，对吗？小幽灵的声音很轻，像一阵风。"},
    {page:7, text:"小鸦点点头。小幽灵笑了：累没关系，休息本身就是一种力量。"},
    {page:8, text:"小鸦第一次觉得，疲惫也可以被温柔对待。"},
    {page:9, text:"告别小幽灵后，小鸦继续向前。天空好像变亮了一点。"},
    {page:10, text:"走着走着，小鸦遇见了一只晒太阳的狐狸。"},
    {page:11, text:"来坐坐吧，狐狸说，这里的光刚刚好。"},
    {page:12, text:"小鸦很久没有这样，什么都不做，只是感受阳光了。"},
    {page:13, text:"有时候，我们需要慢下来，才能看清自己。"},
    {page:14, text:"前面是一片蒲公英田。小鸦从来没见过这么多蒲公英。"},
    {page:15, text:"它轻轻吹了一口——呼，种子们像小伞一样飞了起来。"},
    {page:16, text:"小鸦突然想跑起来，身体好像变轻了。"},
    {page:17, text:"它跑到了山顶。原来这片森林这么美。"},
    {page:18, text:"小鸦抬头看天。那些云在慢慢变化，没有固定的形状。"},
    {page:19, text:"就像心情，小鸦轻声说，没有固定的样子。"},
    {page:20, text:"我接纳此刻的自己，无论是灰暗还是明亮。"},
    {page:21, text:"心境如云，不定义，只看见。这，就是小鸦的云朵心事。"},
    {page:22, text:""}
];

// 状态变量
let currentPage = 1;
const totalPages = storyPages.length;

// DOM元素
let img, prevBtn, nextBtn, coverTitleLayer, textArea, storyText, pageNumEl, progressFill;

// 初始化
function initStory() {
    // 获取DOM元素
    img = document.getElementById('storyImage');
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');
    coverTitleLayer = document.getElementById('coverTitleLayer');
    textArea = document.getElementById('textArea');
    storyText = document.getElementById('storyText');
    pageNumEl = document.getElementById('pageNum');
    progressFill = document.getElementById('progressFill');
    
    // 绑定事件
    prevBtn.addEventListener('click', prevPage);
    nextBtn.addEventListener('click', nextPage);
    
    // 键盘翻页
    document.addEventListener('keydown', handleKeydown);
    
    // 触摸滑动
    setupTouchEvents();
    
    // 初始渲染
    updatePage();
}

function handleKeydown(e) {
    if (e.key === 'ArrowLeft') prevPage();
    if (e.key === 'ArrowRight') nextPage();
}

function setupTouchEvents() {
    const container = document.getElementById('pageContainer');
    let touchStartX = 0;
    
    container.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    container.addEventListener('touchend', function(e) {
        const diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextPage();
            else prevPage();
        }
    }, { passive: true });
}

function updatePage() {
    const pageData = storyPages[currentPage - 1];
    const pageNumStr = currentPage.toString().padStart(2, '0');
    
    // 更新图片
    img.src = CONFIG.images.storyImages + 'page_' + pageNumStr + '.jpg';
    
    // 更新内容
    if (currentPage === 1) {
        coverTitleLayer.classList.add('show');
        textArea.classList.add('hidden');
    } else if (currentPage === totalPages) {
        coverTitleLayer.classList.remove('show');
        textArea.classList.add('hidden');
    } else {
        coverTitleLayer.classList.remove('show');
        textArea.classList.remove('hidden');
        storyText.textContent = pageData.text || '';
        pageNumEl.textContent = (currentPage - 1) + ' / ' + (totalPages - 2);
    }
    
    // 更新进度条
    const progress = (currentPage / totalPages) * 100;
    progressFill.style.width = progress + '%';
    
    // 更新按钮状态
    prevBtn.classList.toggle('disabled', currentPage === 1);
    nextBtn.classList.toggle('disabled', currentPage === totalPages);
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        updatePage();
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        updatePage();
    }
}

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', initStory);
