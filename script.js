// --- 遊戲設定 ---

// 定義等級系統：每級所需的總經驗值、稱號、Icon、解鎖獎勵文字
const LEVEL_DATA = [
    { level: 1,  xpReq: 100, title: "Novice",     icon: "fa-seedling",    reward: "起點：解鎖基礎習慣追蹤" },
    { level: 2,  xpReq: 150, title: "Apprentice", icon: "fa-scroll",      reward: "獎勵：獲得「學徒」徽章" },
    { level: 3,  xpReq: 220, title: "Warrior",    icon: "fa-khanda",      reward: "解鎖：火焰特效" },
    { level: 4,  xpReq: 300, title: "Knight",     icon: "fa-shield-halved", reward: "獎勵：解鎖淺色主題 II" },
    { level: 5,  xpReq: 400, title: "Master",     icon: "fa-dragon",      reward: "解鎖：自訂背景功能" },
    { level: 6,  xpReq: 600, title: "Legend",     icon: "fa-crown",       reward: "終極目標：成為傳說！" }
];

// 單次任務獲得的經驗值
const XP_PER_TASK = 20;

// --- 當前狀態 ---
let currentXP = 0;
let currentLevel = 1;

// 初始化範例習慣
const initialHabits = [
    { text: "晨間運動", icon: "fa-dumbbell", completed: false },
    { text: "學習 Coding", icon: "fa-code", completed: false }
];

// --- 核心功能 ---

// 頁面載入後執行
document.addEventListener('DOMContentLoaded', () => {
    init();
});

function init() {
    initialHabits.forEach(h => createHabitElement(h.text, h.icon, h.completed));
    setupCustomSelect(); 

    // [LV.4] 讀取並套用儲存的主題
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-theme');
    }

    // [LV.5] 讀取並套用儲存的自訂背景
    const savedBgType = localStorage.getItem('bgType');
    const savedBgValue = localStorage.getItem('bgValue');
    const oldCustomBg = localStorage.getItem('customBg');

    if (savedBgType && savedBgValue) {
        document.body.style.background = savedBgValue;
        if (savedBgType === 'gradient') {
            document.body.style.backgroundAttachment = 'fixed';
        }
        document.body.classList.add('has-custom-bg');
    } else if (oldCustomBg) {
        document.body.style.backgroundImage = `url('${oldCustomBg}')`;
        document.body.classList.add('has-custom-bg');
    }
    renderSidebar();
    updateHUD();

    document.getElementById('habit-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addHabit();
        }
    });

    checkTutorial();

    if (currentLevel >= 6) {
        enableLegendaryMode();
    }
}

// --- 習慣管理功能 ---

function addHabit() {
    const input = document.getElementById('habit-input');
    const iconValue = document.getElementById('selected-icon-value').value; 
    const text = input.value.trim();
    
    if (text) {
        createHabitElement(text, iconValue, false);
        input.value = '';
    }
}

function createHabitElement(text, iconClass, isCompleted) {
    const list = document.getElementById('habit-list');
    const li = document.createElement('li');
    li.className = `habit-item ${isCompleted ? 'completed' : ''}`;
    
    li.innerHTML = `
        <div class="habit-content" onclick="toggleHabit(this)">
            <div class="habit-icon">
                <i class="fa-solid ${iconClass}"></i>
            </div>
            <span class="habit-text">${text}</span>
        </div>
        <button class="delete-btn" onclick="deleteHabit(this)">
            <i class="fa-solid fa-trash"></i>
        </button>
    `;
    // 新增到列表最上方
    list.prepend(li);
}

function toggleHabit(element) {
    const item = element.parentElement;
    
    if (!item.classList.contains('completed')) {
        // --- 完成任務 ---
        item.classList.add('completed');
        
        // 判斷等級特效
        if (currentLevel >= 3) {
            // LV.3 以上：觸發戰士特效 (加 class + 噴火)
            item.classList.add('warrior-impact');
            triggerFireConfetti();
        } else {
            // LV.3 以下：普通特效 (彩色紙花)
            triggerConfetti(); 
        }

        addXP();
    } else {
        item.classList.remove('completed');
        item.classList.remove('warrior-impact');
        removeXP();
    }
}

function deleteHabit(btn) {
    const item = btn.parentElement;
    
    // 如果刪除已完成任務，扣除經驗值
    if(item.classList.contains('completed')) {
        removeXP();
    }

    item.style.transform = 'translateX(100px)';
    item.style.opacity = '0';
    setTimeout(() => {
        item.remove();
    }, 300);
}

// --- 遊戲邏輯與等級系統 ---

function getCurrentLevelData() {
    const dataIndex = currentLevel - 1;
    if (dataIndex < LEVEL_DATA.length) {
        return LEVEL_DATA[dataIndex];
    } else {
        return LEVEL_DATA[LEVEL_DATA.length - 1];
    }
}

function addXP() {
    currentXP += XP_PER_TASK;
    
    const levelData = getCurrentLevelData();
    
    // 檢查是否升級：如果目前經驗 >= 當前等級需要的上限
    if (currentXP >= levelData.xpReq) {
        levelUp();
    }
    updateHUD();
}

function removeXP() {
    if (currentXP >= XP_PER_TASK) currentXP -= XP_PER_TASK;
    updateHUD();
}

function levelUp() {
    const currentMax = getCurrentLevelData().xpReq;
    
    // 扣除經驗值
    currentXP -= currentMax; 
    
    currentLevel++;
    
    // 取得新等級資料
    const nextLevelData = getCurrentLevelData();
    const popup = document.getElementById('level-up-popup');
    const badgeIcon = document.getElementById('level-up-badge-icon');
    const rankText = document.getElementById('level-up-rank');
    const descText = document.getElementById('level-up-desc');

    badgeIcon.className = 'fa-solid'; 
    badgeIcon.classList.add(nextLevelData.icon);

    rankText.innerText = nextLevelData.title;
    descText.innerText = `恭喜！你已獲得「${nextLevelData.title}」徽章`;

    popup.classList.add('active');

    triggerBigConfetti();
    renderSidebar(); 
    updateHUD();

    if (currentLevel >= 6) {
        enableLegendaryMode();
    }
}

// 關閉升級視窗
function closeLevelUpPopup() {
    document.getElementById('level-up-popup').classList.remove('active');
}

function updateHUD() {
    const xpBar = document.getElementById('xp-bar');
    const levelText = document.getElementById('level-display');
    const xpText = document.getElementById('xp-text');

    const levelData = getCurrentLevelData();
    const maxXP = levelData.xpReq;

    let displayXP = currentXP;
    if(displayXP > maxXP) displayXP = maxXP;

    const percentage = (displayXP / maxXP) * 100;
    
    xpBar.style.width = `${percentage}%`;
    const badgeClass = `badge-lv${Math.min(currentLevel, 6)}`;

    levelText.innerHTML = `
        <i class="fa-solid ${levelData.icon} hud-level-icon ${badgeClass}"></i> 
        LV. ${currentLevel} ${levelData.title}
    `;
    
    xpText.innerText = `${displayXP} / ${maxXP} XP`;
}

// --- 側邊欄與選單功能 ---

// 渲染側邊欄等級列表 (包含底部設定按鈕控制)
function renderSidebar() {
    const list = document.getElementById('level-list');
    const settingsFooter = document.getElementById('sidebar-settings');
    
    if (!list) return;
    
    list.innerHTML = ''; 

    // 1. 生成等級列表
    LEVEL_DATA.forEach(data => {
        const li = document.createElement('li');
        
        const isUnlocked = currentLevel >= data.level;
        const isCurrent = currentLevel === data.level;
        
        li.className = `level-row ${isUnlocked ? 'unlocked' : ''} ${isCurrent ? 'current' : ''}`;

        // LV.4 騎士 (切換主題)
        if (data.level === 4 && isUnlocked) {
            li.style.cursor = 'pointer';
            li.title = "點擊切換 淺色/深色 主題";
            li.onclick = toggleTheme;
            const isLight = document.body.classList.contains('light-theme');
            const statusText = isLight ? " (使用中: 淺色)" : " (點擊啟用)";
            
            li.innerHTML = `
                <div class="level-badge"><i class="fa-solid ${data.icon}"></i></div>
                <div class="level-details">
                    <h4>LV.${data.level} ${data.title} <span style="font-size:0.7rem; color:var(--highlight);">${statusText}</span></h4>
                    <p>${data.reward}</p>
                </div>
            `;
        } 
        // LV.5 大師 (自訂背景)
        else if (data.level === 5) {
            const hintText = isUnlocked ? " (請使用下方⚙️設定)" : "";
            
            li.innerHTML = `
                <div class="level-badge"><i class="fa-solid ${data.icon}"></i></div>
                <div class="level-details">
                    <h4>LV.${data.level} ${data.title} <span style="font-size:0.7rem; color:#888;">${hintText}</span></h4>
                    <p>${data.reward}</p>
                </div>
            `;
        }
        else {
            // 其他等級
            li.innerHTML = `
                <div class="level-badge"><i class="fa-solid ${data.icon}"></i></div>
                <div class="level-details">
                    <h4>LV.${data.level} ${data.title}</h4>
                    <p>${data.reward}</p>
                    <p style="font-size: 0.7rem; color: #666;">XP 需求: ${data.xpReq}</p>
                </div>
            `;
        }
        
        list.appendChild(li);
    });

    // 2. 控制底部「設定按鈕」顯示
    // 只有當等級 >= 5 (Master) 時才顯示
    if (currentLevel >= 5) {
        settingsFooter.style.display = 'block';
    } else {
        settingsFooter.style.display = 'none';
    }
}

// 開關側邊欄
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

// --- 特效函式庫 (Canvas Confetti) ---

function triggerConfetti() {
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#00ff9d', '#00eaff', '#e94560']
        });
    }
}

function triggerBigConfetti() {
    if (typeof confetti !== 'function') return;

    var duration = 2 * 1000;
    var end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#00ff9d', '#00eaff']
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#e94560', '#fff']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

// --- 自定義下拉選單互動 ---

function setupCustomSelect() {
    const wrapper = document.querySelector('.custom-select');
    // 如果找不到元素就跳過 (避免錯誤)
    if (!wrapper) return;

    const trigger = wrapper.querySelector('.select-trigger');
    const options = wrapper.querySelectorAll('.custom-option');
    const hiddenInput = document.getElementById('selected-icon-value');

    // 1. 點擊開關選單
    trigger.addEventListener('click', function(e) {
        e.stopPropagation(); 
        wrapper.classList.toggle('open');
    });

    // 2. 點擊選項
    options.forEach(option => {
        option.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            
            trigger.innerHTML = `<i class="fa-solid ${value}"></i>`;
            hiddenInput.value = value;
            
            options.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');

            wrapper.classList.remove('open');
        });
    });

    // 3. 點擊畫面其他地方時關閉選單
    window.addEventListener('click', function(e) {
        if (!wrapper.contains(e.target)) {
            wrapper.classList.remove('open');
        }
    });
}

// --- 新手教學系統 (Tutorial System) ---

// 教學步驟設定
const tutorialSteps = [
    {
        title: "Welcome to Habitual Adventure!",
        desc: "這不是一個普通的代辦清單，這是一場 RPG 遊戲。完成現實生活中的任務，升級你的角色！",
        highlight: null
    },
    {
        title: "Check your status",
        desc: "這是你的 HUD (抬頭顯示器)。這裡顯示你的等級、稱號以及目前的經驗值 (XP)。",
        highlight: ".hud-display"
    },
    {
        title: "Accept new mission",
        desc: "在這裡輸入你想養成的習慣，選擇一個帥氣的 Icon，然後按下「+」號。",
        highlight: ".input-group"
    },
    {
        title: "View level rewards",
        desc: "點擊左上角的選單按鈕，可以查看未來的升級獎勵與解鎖功能。",
        highlight: ".menu-btn"
    },
    {
        title: "Adventure Guide",
        desc: "如果忘記怎麼操作，隨時點擊右上角的書本，就可以重新開啟這份教學。",
        highlight: ".tutorial-btn"
    },
    {
        title: "Let the adventure begin!",
        desc: "現在，試著新增你的第一個任務，或是完成預設的任務來獲得第一筆經驗值吧！",
        highlight: null
    }
];

let currentStep = 0;

function checkTutorial() {
    const hasSeen = localStorage.getItem('seenTutorial');
    
    if (!hasSeen) {
        setTimeout(() => {
            startTutorial();
        }, 1000);
    }
}

function startTutorial() {
    document.getElementById('tutorial-overlay').classList.add('active');
    renderStep();
}

function renderStep() {
    const step = tutorialSteps[currentStep];
    const title = document.getElementById('tut-title');
    const desc = document.getElementById('tut-desc');
    const dotsContainer = document.getElementById('tut-dots');
    
    // 取得按鈕 DOM
    const prevBtn = document.getElementById('tut-prev-btn');
    const nextBtn = document.getElementById('tut-next-btn');

    // 更新文字
    title.innerText = step.title;
    desc.innerText = step.desc;
    
    // 更新圓點
    dotsContainer.innerHTML = '';
    tutorialSteps.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `dot ${index === currentStep ? 'active' : ''}`;
        dotsContainer.appendChild(dot);
    });

    // --- 聚光燈特效邏輯 ---
    document.querySelectorAll('.highlight-element').forEach(el => {
        el.classList.remove('highlight-element');
    });
    if (step.highlight) {
        const target = document.querySelector(step.highlight);
        if (target) target.classList.add('highlight-element');
    }
    
    // --- 按鈕控制 ---

    // 1. 控制「上一步」按鈕
    if (currentStep === 0) {
        prevBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'block';
    }

    // 2. 控制「下一步/完成」按鈕
    if (currentStep === tutorialSteps.length - 1) {
        nextBtn.innerHTML = '開始冒險 <i class="fa-solid fa-check"></i>';
        nextBtn.onclick = endTutorial;
    } else {
        nextBtn.innerHTML = '下一步 <i class="fa-solid fa-chevron-right"></i>';
        nextBtn.onclick = nextTutorialStep;
    }
}

function prevTutorialStep() {
    if (currentStep > 0) {
        currentStep--;
        renderStep();
    }
}

function nextTutorialStep() {
    if (currentStep < tutorialSteps.length - 1) {
        currentStep++;
        renderStep();
    }
}

function endTutorial() {
    document.querySelectorAll('.highlight-element').forEach(el => {
        el.classList.remove('highlight-element');
    });
    document.getElementById('tutorial-overlay').classList.remove('active');
    localStorage.setItem('seenTutorial', 'true');
    triggerConfetti();
}

function restartTutorial() {
    currentStep = 0;
    document.getElementById('tutorial-overlay').classList.add('active');
    renderStep();
}

// LV.3 戰士專屬：左右夾擊火焰特效
function triggerFireConfetti() {
    if (typeof confetti !== 'function') return;
    const fireDefaults = {
        spread: 80,
        particleCount: 80,
        gravity: 0.5,
        decay: 0.94, 
        startVelocity: 60, 
        shapes: ['circle'], 
        colors: ['#FF4500', '#FF8C00', '#FFD700', '#FFFFFF'] // 紅、橘、金、白(最亮核心)
    };
    confetti({
        ...fireDefaults,
        angle: 60,
        origin: { x: 0, y: 0.8 } 
    });
    confetti({
        ...fireDefaults,
        angle: 120,
        origin: { x: 1, y: 0.8 }
    });
}

// LV.4 騎士專屬：切換主題功能
function toggleTheme() {
    // 只有等級 >= 4 才能切換
    if (currentLevel < 4) {
        alert("等級不足！請先升級到 LV.4 Knight 來解鎖此功能。");
        return;
    }
    document.body.classList.toggle('light-theme');
    
    // 儲存設定到 localStorage
    if (document.body.classList.contains('light-theme')) {
        localStorage.setItem('theme', 'light');
    } else {
        localStorage.setItem('theme', 'dark');
    }
    
    renderSidebar();
}

// --- LV.5 大師專屬：自訂背景系統 ---

// 打開自訂面板
function changeBackground() {
    // 只有等級 >= 5 才能使用
    if (currentLevel < 5) {
        alert("等級不足！請先升級到 LV.5 Master 來解鎖此功能。");
        return;
    }
    document.getElementById('theme-modal').classList.add('active');
}

// 關閉自訂面板
function closeThemeModal() {
    document.getElementById('theme-modal').classList.remove('active');
}

// 1. 套用純色背景
function applySolidBg() {
    const color = document.getElementById('solid-color-picker').value;

    document.body.style.background = color;
    document.body.classList.add('has-custom-bg');
    localStorage.setItem('bgType', 'solid');
    localStorage.setItem('bgValue', color);

    closeThemeModal();
    renderSidebar();
}

// 2. 套用漸層背景
function applyGradientBg() {
    const startColor = document.getElementById('grad-start').value;
    const endColor = document.getElementById('grad-end').value;
    const gradientValue = `linear-gradient(135deg, ${startColor}, ${endColor})`;
    
    document.body.style.background = gradientValue;
    document.body.style.backgroundAttachment = 'fixed';
    document.body.classList.add('has-custom-bg');
    
    localStorage.setItem('bgType', 'gradient');
    localStorage.setItem('bgValue', gradientValue);
    
    closeThemeModal();
    renderSidebar();
}

// 3. 恢復預設背景
function resetBackground() {
    document.body.style.background = '';
    document.body.classList.remove('has-custom-bg');
    
    // 清除儲存的資料
    localStorage.removeItem('bgType');
    localStorage.removeItem('bgValue');
    localStorage.removeItem('customBg');
    
    closeThemeModal();
    renderSidebar();
}

// --- LV.6 Legend 傳說獎勵系統 ---
function enableLegendaryMode() {
    if (currentLevel < 6) return;

    document.body.classList.add('legendary-mode');
    document.removeEventListener('mousemove', createLegendaryParticle);
    document.addEventListener('mousemove', createLegendaryParticle);
}

function createLegendaryParticle(e) {
    if (Math.random() > 0.3) return; 

    const particle = document.createElement('div');
    particle.classList.add('legend-particle');

    particle.style.left = `${e.clientX}px`;
    particle.style.top = `${e.clientY}px`;
    
    const hue = Math.floor(Math.random() * 360);
    const color = `hsl(${hue}, 70%, 80%)`;
    
    particle.style.background = color;
    particle.style.boxShadow = `0 0 10px ${color}`;

    const driftX = (Math.random() - 0.5) * 60; 
    const driftY = (Math.random() - 0.5) * 60 + 20;
    
    particle.style.setProperty('--drift-x', `${driftX}px`);
    particle.style.setProperty('--drift-y', `${driftY}px`);

    document.body.appendChild(particle);

    setTimeout(() => {
        particle.remove();
    }, 1200);
}