### 專案名稱：Gamified Habit Tracker (遊戲化習慣追蹤器)
**(Gamified Habit Tracker - 8-Bit Retro Productivity App)**
---

#### 💡 專案簡介 (Project Overview)
這是一個結合「番茄鐘/習慣追蹤」與「RPG 遊戲機制」的輕量級 Web 應用。旨在解決傳統習慣追蹤 App 過於枯燥的問題，透過導入生命值 (HP)、經驗值 (EXP)、等級提升與虛擬商店等遊戲化 (Gamification) 元素，提供使用者持續達成目標的強烈動機與正向回饋。

**🌟 個人最大亮點：扎實的原生前端開發與 UI/UX 互動設計**
此專案**完全不依賴任何現代前端框架 (No React/Vue)，純粹以 Vanilla JavaScript 手工打造**。從底層的狀態管理、DOM 元素動態渲染，到精緻的 CSS 像素風 (8-Bit) 視覺與音效串接。

**🛠️ 使用技術 (Tech Stack)**
* **前端邏輯：** `Vanilla JavaScript` (純原生 JS ES6+)
* **視覺與動畫：** `HTML5`, `CSS3` (CSS Variables, Flexbox, Keyframe Animations)
* **資料儲存：** `Window.localStorage` (無後端輕量化資料持久性設計)
* **互動回饋：** HTML5 Audio API (遊戲音效)、Confetti 特效

---

#### 👨‍💻 核心功能與開發亮點 (Core Features)

##### 1. 遊戲化狀態與核心機制 (RPG Gamification Engine)
> **相關模組：** `script.js` (狀態管理模組)

* **功能描述：** 建立了一套完整的遊戲數值運算邏輯。當使用者完成習慣時可獲得 EXP 與金幣，累積滿 EXP 會觸發升級動畫；反之，若未達成習慣則會扣除 HP，當 HP 歸零時將面臨「Game Over」並重置等級，創造具挑戰性的獎懲機制。
* **技術亮點：** 運用 JS 物件封裝 `user` 狀態，精準控制各項數值的增減與邊界條件 (如最高血量限制、升級所需的經驗值曲線)。

##### 2. 無後端資料持久化 (Local Storage Persistence)
* **功能描述：** 為了讓這個小工具達到「開箱即用」且不需伺服器建置成本，我實作了基於瀏覽器的資料儲存機制。
* **技術亮點：** 透過 `JSON.stringify` 與 `JSON.parse` 搭配 `localStorage` API，確保使用者的等級、金幣、已建立的習慣與自訂獎勵清單，在每次重新整理或關閉瀏覽器後都能完美還原 (`loadData()` 與 `saveData()`)。

##### 3. 復古 8-Bit 像素風視覺與微互動 (Retro 8-Bit UI & Micro-interactions)
> **相關模組：** `style.css`

* **視覺設計：** 導入 `Press Start 2P` 像素字體，並巧妙利用 `box-shadow` 與底色搭配，純用 CSS 刻劃出濃厚的復古電玩按鈕與介面風格。
* **動畫回饋：** 大量使用 CSS Keyframes。例如：受到傷害時的視窗震動 (`shake`)、升級時的彈跳特效 (`bounce`) 以及進度條平滑過渡，極大地提升了使用者的沉浸感。

![畫面截圖](https://mikeyc-wang.github.io/MyPortfolio/images/HabitTracker_Dashboard.png)
---
