/**
 * 醒醒鸦 · 测试流程逻辑
 */

// ========== 状态变量 ==========
var currentQuestion = 0;
var totalScore = 0;
var answers = [];
var currentResult = null;
var generatedImageBlob = null;
var isTransitioning = false; // 防止重复点击

// ========== DOM 元素缓存 ==========
var cachedElements = {
    progressFill: null,
    questionCounter: null,
    questionText: null,
    optionsContainer: null
};

function getCachedElement(id) {
    if (!cachedElements[id]) {
        cachedElements[id] = document.getElementById(id);
    }
    return cachedElements[id];
}

// ========== 核心函数 ==========
function startQuiz() {
    var startPage = document.getElementById('startPage');
    var quizPage = document.getElementById('quizPage');
    
    startPage.classList.add('hidden');
    quizPage.style.display = 'block';
    currentQuestion = 0;
    totalScore = 0;
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
    if (isTransitioning) {
        return;
    }
    
    var options = document.querySelectorAll('.option');
    for (var i = 0; i < options.length; i++) {
        options[i].classList.remove('selected');
    }
    options[index].classList.add('selected');
    
    // 记录答案
    answers[currentQuestion] = { answer: index, score: score };
    console.log('第' + (currentQuestion + 1) + '题答案已记录：', answers[currentQuestion]);
    
    updateNavButtons();
    
    // 判断是否是最后一题
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
        
        // 检查是否所有题目都答了
        if (answers.length < questions.length) {
            console.log('答案不完整，当前数量：' + answers.length);
            // 补齐未答的题目（默认给2分）
            for (var i = answers.length; i < questions.length; i++) {
                answers[i] = { answer: 0, score: 2 };
            }
        }
        
        quizPage.style.display = 'none';
        resultPage.style.display = 'block';
        progressFill.style.width = '100%';
        
        // 计算总分
        totalScore = 0;
        for (var i = 0; i < answers.length; i++) {
            if (answers[i] && answers[i].score !== undefined) {
                totalScore += answers[i].score;
            }
        }
        console.log('答题完成，总分：' + totalScore + '，答案数量：' + answers.length);
        
        // 确定分区
        var zone, zoneText, resultPool;
        if (totalScore >= 51) {
            zone = 'awake';
            zoneText = '🦅 清醒翱翔区';
            resultPool = results.awake;
        } else if (totalScore >= 36) {
            zone = 'blurry';
            zoneText = '🌫️ 迷雾盘旋区';
            resultPool = results.blurry;
        } else {
            zone = 'asleep';
            zoneText = '🌑 深渊蛰伏区';
            resultPool = results.asleep;
        }
        console.log('分区：' + zone + '，结果池数量：' + resultPool.length);
        
        // 随机选择一个结果
        var resultIndex = Math.floor(Math.random() * resultPool.length);
        currentResult = resultPool[resultIndex];
        console.log('选中结果：', currentResult);
        
        // 保存测试结果到localStorage供聊天页面使用
        localStorage.setItem('xingxingya_test_result', JSON.stringify({
            type: currentResult.type,
            desc: currentResult.desc,
            advice: currentResult.advice,
            score: totalScore,
            zone: zoneText
        }));
        
        // 填充结果页面
        document.getElementById('resultEmoji').innerHTML = '<img loading="lazy" src="' + currentResult.image + '" alt="' + currentResult.type + '" style="max-width: 200px; border-radius: 20px;">';
        document.getElementById('resultType').innerHTML = currentResult.type;
        document.getElementById('resultDesc').innerHTML = currentResult.desc;
        document.getElementById('scoreValue').innerHTML = totalScore + ' / 60';
        document.getElementById('scoreZone').innerHTML = zoneText;
        document.getElementById('adviceText').innerHTML = currentResult.advice;
        
        // 填充图片容器
        document.getElementById('imgEmoji').innerHTML = '<img loading="lazy" src="' + currentResult.image + '" alt="' + currentResult.type + '" style="max-width: 300px; border-radius: 20px;">';
        document.getElementById('imgType').innerHTML = currentResult.type;
        document.getElementById('imgDesc').innerHTML = currentResult.desc;
        document.getElementById('imgScore').innerHTML = totalScore + ' / 60';
        document.getElementById('imgZone').innerHTML = zoneText;
        document.getElementById('imgAdvice').innerHTML = currentResult.advice;
        
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
    var shareText = '我的真实鸦格是「' + currentResult.type + '」！来测测你现在的真实鸦格吧～ xingxingya.com';
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
        link.download = '醒醒鸦-' + currentResult.type + '.png';
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
    totalScore = 0;
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
        totalScore = 0;
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
    
    console.log('醒醒鸦测试已加载完成 · 嘎嘎');
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
    
    // 页面加载时检查初始网络状态
    if (!navigator.onLine) {
        showOfflineToast();
    }
}

// ========== 页面加载完成后初始化 ==========
document.addEventListener('DOMContentLoaded', function() {
    initEventListeners();
    initNetworkListener();
});
