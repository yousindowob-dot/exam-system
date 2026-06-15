el.fileInput.addEventListener("change", async event => {
  const file = event.target.files[0];
  if (!file) return;
  const fileName = file.name || "題庫";
  const lowerName = fileName.toLowerCase();
  try {
    setImportStatus(`正在讀取：${fileName} ...`);
    hideParseDebug();
    hideParsedQuestionDebug();
    if (lowerName.endsWith(".txt")) {
      const text = await file.text();
      loadQuestionsFromText(text, fileName);
    } else if (lowerName.endsWith(".docx")) {
        let text = await extractTextFromDocx(file);

        text = fixBrokenQuestionNumbers(text);
        text = fixInlineQuestionFormat(text);

        loadQuestionsFromText(text, fileName);
    } else {
      setImportStatus("只支援 .txt 或 .docx", true);
    }
  } catch (error) {
    setImportStatus(`讀取失敗：${error.message || "未知錯誤"}`, true);
  }
});

el.loadSampleBtn.addEventListener("click", () => {
  hideParseDebug();
  hideParsedQuestionDebug();
  loadQuestionsFromText(sampleTxt, "範例題庫");
});

el.downloadFormatBtn.addEventListener("click", () => {
  el.formatPreview.classList.toggle("hidden");
  el.formatPreview.textContent = `題庫格式範例：
Q1
題目內容...
A. 選項A
B. 選項B
C. 選項C
D. 選項D
Answer: A
支援 A~Z 最多 26 個選項
多選題答案格式 : [AC] [A,C] [A C]三種(不要打[])
Note: 解析內容...`;
});

el.startExamBtn.addEventListener("click", startExam);
el.startRangeBtn.addEventListener("click", startRange);
el.startStudyBtn.addEventListener("click", startStudy);
el.showAnswerBtn.addEventListener("click", toggleAnswer);
el.submitBtn.addEventListener("click", submitAnswer);
el.nextBtn.addEventListener("click", nextQuestion);
el.retryWrongBtn.addEventListener("click", startRetryWrong);
el.retryCurrentRangeBtn.addEventListener("click", retryCurrentRange);
el.continueNextBtn.addEventListener("click", continueNext);
el.restartBtn.addEventListener("click", goHome);
el.backHomeBtn.addEventListener("click", () => {
  if (confirm("確定要返回模式選擇嗎？目前作答進度不會保留。")) goHome();
});

// 亮暗模式切換

initTheme();
updateQuestionCount();
setOptions();
enableStartButtons(false);
hideParseDebug();
hideParsedQuestionDebug();
goHome();
