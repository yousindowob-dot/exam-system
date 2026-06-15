麻雀蛋吐司測驗系統 - 拆分版

開啟方式：
1. 直接開 index.html 可使用。
2. DOCX 功能目前仍透過網路載入 mammoth.browser.min.js。
3. 若要離線使用，請下載 mammoth.browser.min.js 放到 js/，並把 index.html 第一個 script 改成：
   <script src="./js/mammoth.browser.min.js"></script>

檔案說明：
- index.html：頁面結構
- css/style.css：樣式
- js/data.js：全域資料、狀態、DOM 元素、範例題庫
- js/utils.js：通用工具函式
- js/parser.js：TXT/DOCX 題庫解析、圖片處理、答案正規化
- js/ui.js：畫面更新與除錯訊息
- js/quiz.js：測驗流程、作答判斷、結果與錯題
- js/theme.js：亮暗模式
- js/app.js：事件綁定與初始化
