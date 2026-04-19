/**
 * 醒醒鸦 · 测试流程逻辑 v2.0
 * 4维度计分 + 81种组合映射
 */

// ========== 状态变量 ==========
var currentQuestion = 0;
var answers = [];           // 记录每题答案 { answer: index, score: 3/2/1 }
var currentResult = null;   // 当前测试结果
var generatedImageBlob = null;
var isTransitioning = false;

// ========== DOM 元素缓存 ==========
var cachedElements = {};

function getCachedElement(id) {
    if (!cachedElements[id]) {
        cachedElements[id] = document.getElementById(id);
    }
    return cachedElements[id];
}

// ========== 维度计算 ==========
function calculateDimensions() {
    var scores = {
        电量: 0,
        情绪: 0,
        行动: 0,
        连接: 0
    };
    
    for (var i = 0; i < answers.length; i++) {
        if (answers[i] && questions[i]) {
            var dim = questions[i].dimension;
            if (scores.hasOwnProperty(dim)) {
                scores[dim] += answers[i].score;
            }
        }
    }
    
    return scores;
}

function getDimensionLevel(score) {
    if (score >= 13) return "高";
    if (score >= 9) return "中";
    return "低";
}

function getZoneByYage(yageName) {
    if (yages[yageName]) {
        return yages[yageName].zone;
    }
    return "";
}

function getZoneText(zone) {
    if (zone === "清醒区") return "🌅 清醒区";
    if (zone === "假寐区") return "🌫️ 假寐区";
    if (zone === "沉睡区") return "🌑 沉睡区";
    return zone;
}

// ========== 核心函数 ==========
function startQuiz() {
    var startPage = document.getElementById('startPage');
    var quizPage = document.getElementById('quizPage');
    
    startPage.classList.add('hidden');
    quizPage.style.display = 'block';
    currentQuestion = 0;
    answers = [];
    isTransitioning = false;
    showQuestion();
}

function showQuestion() {
    var question = questions[currentQuestion];
    var progressFill = document.getElementById('progressFill');
    var questionCounter = document.getElementById('questionCounter');
    var questionText = document.getElementById('questionText');
    var optionsContainer = document.getElementById('optionsContainer');
    
    questionCounter.textContent = '第 ' + (currentQuestion + 1) + ' 题 / 共 ' + questions.length + ' 题';
    progressFill.style.width = ((currentQuestion) / questions.length * 100) + '%';
    questionText.textContent = question.text;
    optionsContainer.innerHTML = '';
    
    for (var i = 0; i < question.options.length; i++) {
        (function(index) {
            var option = question.options[index];
            var optionEl = document.createElement('div');
            optionEl.className = 'option';
            if (answers[currentQuestion] !== undefined && answers[currentQuestion].answer === index) {
                optionEl.classList.add('selected');
            }
            optionEl.textContent = option.text;
            optionEl.onclick = function() {
                selectOption(index, option.score);
            };
            optionsContainer.appendChild(optionEl);
        })(i);
    }
    updateNavButtons();
}

function updateNavButtons() {
    var prevBtn = document.getElementById('prevBtn');
    prevBtn.disabled = currentQuestion === 0;
}

function selectOption(index, score) {
    if (isTransitioning) return;
    
    var options = document.querySelectorAll('.option');
    for (var i = 0; i < options.length; i++) {
        options[i].classList.remove('selected');
    }
    options[index].classList.add('selected');
    
    answers[currentQuestion] = { answer: index, score: score };
    console.log('第' + (currentQuestion + 1) + '题已记录：', answers[currentQuestion]);
    updateNavButtons();
    
    if (currentQuestion === questions.length - 1) {
        isTransitioning = true;
        setTimeout(function() {
            showResult();
            isTransitioning = false;
        }, 400);
    } else {
        isTransitioning = true;
        setTimeout(function() {
            currentQuestion++;
            showQuestion();
            isTransitioning = false;
        }, 400);
    }
}

function prevQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        showQuestion();
    }
}

function showResult() {
    try {
        var quizPage = document.getElementById('quizPage');
        var resultPage = document.getElementById('resultPage');
        var progressFill = document.getElementById('progressFill');
        
        // 补齐未答题目
        if (answers.length < questions.length) {
            for (var i = answers.length; i < questions.length; i++) {
                answers[i] = { answer: 0, score: 2 };
            }
        }
        
        quizPage.style.display = 'none';
        resultPage.style.display = 'block';
        progressFill.style.width = '100%';
        
        // 计算各维度分数
        var scores = calculateDimensions();
        console.log('维度分数：', scores);
        
        // 获取各维度等级
        var levels = {
            电量: getDimensionLevel(scores.电量),
            情绪: getDimensionLevel(scores.情绪),
            行动: getDimensionLevel(scores.行动),
            连接: getDimensionLevel(scores.连接)
        };
        console.log('维度等级：', levels);
        
        // 查找匹配鸦格
        var mappingKey = levels.电量 + '-' + levels.情绪 + '-' + levels.行动 + '-' + levels.连接;
        var yageName = yageMapping[mappingKey] || "迷雾探险鸦";
        console.log('匹配键值：' + mappingKey + ' → ' + yageName);
        
        // 获取鸦格详情
        currentResult = yages[yageName];
        var zoneText = getZoneText(currentResult.zone);
        
        // 构建维度得分显示
        var dimensionText = '⚡' + scores.电量 + ' · 💭' + scores.情绪 + ' · 🏃' + scores.行动 + ' · 🔗' + scores.连接;
        
        // 保存到localStorage供聊天页面使用
        localStorage.setItem('xingxingya_test_result', JSON.stringify({
            type: yageName,
            emoji: currentResult.emoji,
            desc: currentResult.desc,
            quote: currentResult.quote,
            advice: currentResult.quote,
            score: scores,
            levels: levels,
            zone: zoneText,
            suitable: currentResult.suitable,
            dimension: dimensionText
        }));
        
        // 填充结果页面
        document.getElementById('resultEmoji').textContent = currentResult.emoji;
        document.getElementById('resultType').textContent = yageName;
        document.getElementById('resultDesc').textContent = currentResult.desc;
        
        // 维度得分展示
        var scoreValueEl = document.getElementById('scoreValue');
        var scoreZoneEl = document.getElementById('scoreZone');
        if (scoreValueEl) scoreValueEl.innerHTML = dimensionText;
        if (scoreZoneEl) scoreZoneEl.textContent = zoneText;
        
        // 适合做什么
        var adviceTextEl = document.getElementById('adviceText');
        if (adviceTextEl) {
            adviceTextEl.innerHTML = '<div style="margin-bottom:12px;">' + currentResult.quote + '</div>' +
                '<div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:12px;margin-top:8px;">' +
                '<div style="font-size:12px;color:#8892b0;margin-bottom:6px;">🎯 适合做什么</div>' +
                '<div>' + currentResult.suitable + '</div></div>';
        }
        
        // 填充图片容器
        document.getElementById('imgEmoji').textContent = currentResult.emoji;
        document.getElementById('imgType').textContent = yageName;
        document.getElementById('imgDesc').textContent = currentResult.desc;
        document.getElementById('imgScore').innerHTML = dimensionText;
        document.getElementById('imgZone').textContent = zoneText;
        document.getElementById('imgAdvice').innerHTML = '<div>' + currentResult.quote + '</div>' +
            '<div style="margin-top:8px;border-top:1px solid rgba(255,255,255,0.1);padding-top:8px;">' +
            '<div style="font-size:12px;color:#8892b0;">🎯 ' + currentResult.suitable + '</div></div>';
        
        console.log('结果页面填充完成');
    } catch (error) {
        console.error('显示结果时出错：', error);
        alert('😢 显示结果时遇到了问题，请刷新页面重试~');
    }
}

// ========== 分享功能 ==========
function toggleShareOptions() {
    var shareOptions = document.getElementById('shareOptions');
    shareOptions.classList.toggle('show');
}

function copyText() {
    var shareText = '我的鸦格是「' + currentResult.emoji + ' ' + currentResult.zone + '的' + Object.keys(yages).find(k => yages[k] === currentResult) + '」' +
        '\n' + currentResult.desc.substring(0, 50) + '...' +
        '\n来测测你现在的真实鸦格吧～ xingxingya.com';
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(function() {
            alert('✅ 已复制到剪贴板！\n嘎嘎 ~ 粘贴到朋友圈分享吧~');
        }).catch(function() {
            fallbackCopy(shareText);
        });
    } else {
        fallbackCopy(shareText);
    }
}

function fallbackCopy(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('✅ 已复制到剪贴板！\n嘎嘎 ~ 粘贴到朋友圈分享吧~');
}

function downloadImage() {
    var shareOptions = document.getElementById('shareOptions');
    var container = document.getElementById('resultImageContainer');
    
    shareOptions.classList.remove('show');
    
    if (typeof html2canvas !== 'undefined') {
        html2canvas(container, {
            backgroundColor: null,
            scale: 2,
            useCORS: true
        }).then(function(canvas) {
            canvas.toBlob(function(blob) {
                generatedImageBlob = blob;
                var img = document.createElement('img');
                img.src = URL.createObjectURL(blob);
                
                var imagePreviewContainer = document.getElementById('imagePreviewContainer');
                imagePreviewContainer.innerHTML = '';
                imagePreviewContainer.appendChild(img);
                
                var imagePreviewOverlay = document.getElementById('imagePreviewOverlay');
                imagePreviewOverlay.classList.add('show');
            }, 'image/png');
        }).catch(function(error) {
            console.error('生成图片失败:', error);
            alert('生成图片失败，请重试');
        });
    } else {
        alert('图片生成库加载失败，请刷新页面重试');
    }
}

function confirmDownload() {
    if (generatedImageBlob) {
        var link = document.createElement('a');
        link.href = URL.createObjectURL(generatedImageBlob);
        var yageName = Object.keys(yages).find(k => yages[k] === currentResult) || '鸦格';
        link.download = '醒醒鸦-' + yageName + '.png';
        link.click();
        closePreview();
    }
}

function closePreview() {
    var imagePreviewOverlay = document.getElementById('imagePreviewOverlay');
    imagePreviewOverlay.classList.remove('show');
}

// ========== 重置与返回 ==========
function retryQuiz() {
    var resultPage = document.getElementById('resultPage');
    var startPage = document.getElementById('startPage');
    var shareOptions = document.getElementById('shareOptions');
    
    resultPage.style.display = 'none';
    startPage.classList.remove('hidden');
    shareOptions.classList.remove('show');
    
    currentQuestion = 0;
    answers = [];
    currentResult = null;
    generatedImageBlob = null;
    isTransitioning = false;
}

function resetToHome() {
    var quizPage = document.getElementById('quizPage');
    var startPage = document.getElementById('startPage');
    var progressFill = document.getElementById('progressFill');
    
    if (confirm('确定要退出测试吗？')) {
        quizPage.style.display = 'none';
        startPage.classList.remove('hidden');
        currentQuestion = 0;
        answers = [];
        isTransitioning = false;
        progressFill.style.width = '0%';
    }
}

// ========== 事件绑定 ==========
function initEventListeners() {
    var startBtn = document.getElementById('startBtn');
    var prevBtn = document.getElementById('prevBtn');
    var shareBtn = document.getElementById('shareBtn');
    var copyTextBtn = document.getElementById('copyTextBtn');
    var downloadImgBtn = document.getElementById('downloadImgBtn');
    var retryBtn = document.getElementById('retryBtn');
    var confirmDownloadBtn = document.getElementById('confirmDownloadBtn');
    var closePreviewBtn = document.getElementById('closePreviewBtn');
    var backHomeBtn = document.getElementById('backHomeBtn');
    
    if (startBtn) startBtn.onclick = startQuiz;
    if (prevBtn) prevBtn.onclick = prevQuestion;
    if (shareBtn) shareBtn.onclick = toggleShareOptions;
    if (copyTextBtn) copyTextBtn.onclick = copyText;
    if (downloadImgBtn) downloadImgBtn.onclick = downloadImage;
    if (retryBtn) retryBtn.onclick = retryQuiz;
    if (confirmDownloadBtn) confirmDownloadBtn.onclick = confirmDownload;
    if (closePreviewBtn) closePreviewBtn.onclick = closePreview;
    if (backHomeBtn) backHomeBtn.onclick = resetToHome;
    
    console.log('醒醒鸦测试 v2.0 已加载完成 · 嘎嘎');
}

// ========== 离线提示功能 ==========
function showOfflineToast() {
    var toast = document.getElementById('offlineToast');
    if (toast) {
        toast.classList.add('show');
    }
}

function hideOfflineToast() {
    var toast = document.getElementById('offlineToast');
    if (toast) {
        toast.classList.remove('show');
    }
}

function initNetworkListener() {
    window.addEventListener('online', function() {
        hideOfflineToast();
    });
    
    window.addEventListener('offline', function() {
        showOfflineToast();
    });
    
    if (!navigator.onLine) {
        showOfflineToast();
    }
}

// ========== 页面加载完成后初始化 ==========
document.addEventListener('DOMContentLoaded', function() {
    initEventListeners();
    initNetworkListener();
});
