function updateQuestionCount() {
  el.totalQuestionCount.textContent = allQuestions.length;
}

function setOptions() {
  const total = allQuestions.length;
  
  const createOptions = (target) => {
    target.innerHTML = "";
    if (!total) {
      target.disabled = true;
      return;
    }
    const options = [];
    for (let i = 1; i <= total; i++) {
      options.push(`<option value="${i}">${i}</option>`);
    }
    target.innerHTML = options.join("");
    target.disabled = false;
  };

  createOptions(el.studyStart);
  createOptions(el.studyEnd);
  createOptions(el.rangeStart);
  createOptions(el.rangeEnd);

  if (total > 0) {
    el.studyStart.value = "1";
    el.studyEnd.value = String(Math.min(10, total));
    el.rangeStart.value = "1";
    el.rangeEnd.value = String(total);
    el.rangeCount.value = String(Math.min(10, total));
    el.rangeCount.disabled = false;
  } else {
    el.rangeCount.disabled = true;
  }
}

function enableStartButtons(enabled) {
  el.startExamBtn.disabled = !enabled;
  el.startStudyBtn.disabled = !enabled;
  el.startRangeBtn.disabled = !enabled;
  el.studyStart.disabled = !enabled;
  el.studyEnd.disabled = !enabled;
  el.rangeStart.disabled = !enabled;
  el.rangeEnd.disabled = !enabled;
  el.rangeCount.disabled = !enabled;
}

function setImportStatus(message, isError = false) {
  el.importStatus.textContent = message;
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  
  if (isError) {
    el.importStatus.style.borderColor = "rgba(239,68,68,0.45)";
    el.importStatus.style.color = isLight ? "#991b1b" : "#fecaca";
  } else {
    el.importStatus.style.borderColor = isLight ? "rgba(14,165,233,0.2)" : "rgba(56,189,248,0.28)";
    el.importStatus.style.color = isLight ? "#334155" : "#dbeafe";
  }
}

function hideParseDebug() {
  el.parseDebugBox.classList.add("hidden");
  el.parseDebugBox.innerHTML = "";
}

function showParseDebug(failed) {
  el.parseDebugBox.classList.remove("hidden");

  if (!failed.length) {
    el.parseDebugBox.innerHTML = `<strong style="color:#22c55e;">✅ 題庫解析完整，沒有解析失敗題</strong>`;
    return;
  }

  el.parseDebugBox.innerHTML = `
    <strong style="color:#ef4444;">⚠️ 以下題目解析失敗：</strong><br><br>
    ${failed.map(item => `
      <div style="margin-bottom:16px;">
        <strong>位置：</strong>第 ${item.blockIndex} 個題目區塊<br>
        <strong>題號推測：</strong>Q${escapeHtml(item.guessedQuestionNumber)}<br>
        <strong>首行：</strong>${escapeHtml(item.firstLine)}<br>
        <strong>缺少內容：</strong>${escapeHtml(item.missing.join("、"))}<br>
        <strong>附近內容：</strong>
        <pre style="white-space:pre-wrap; margin-top:8px;">${escapeHtml(item.preview)}</pre>
      </div>
    `).join("")}
  `;
}

function hideParsedQuestionDebug() {
  el.parsedQuestionBox.classList.add("hidden");
  el.parsedQuestionBox.innerHTML = "";
}

function showParsedQuestionDebug(parsed) {
  if (!parsed.length) {
    el.parsedQuestionBox.classList.remove("hidden");
    el.parsedQuestionBox.innerHTML = `<strong>讀到題號：</strong>無<br><strong>成功題數：</strong>0`;
    return;
  }
  const numbers = parsed.map(q => Number(q.question_number)).filter(n => !isNaN(n)).sort((a, b) => a - b);
  const uniqueNumbers = [...new Set(numbers)];
  const total = uniqueNumbers.length;
  const minNo = uniqueNumbers[0];
  const maxNo = uniqueNumbers[total - 1];
  const missing = [];
  for (let i = minNo; i <= maxNo; i++) {
    if (!uniqueNumbers.includes(i)) missing.push(i);
  }
  el.parsedQuestionBox.classList.remove("hidden");
  el.parsedQuestionBox.innerHTML = `
    <strong>讀到題號：</strong>${minNo}~${maxNo}<br>
    <strong>缺少題號：</strong>${missing.length ? missing.join(", ") : "沒有缺號"}<br>
    <strong>成功題數：</strong>${total}
  `;
}

function goHome() {
  state.mode = null;
  state.questions = [];
  state.currentIndex = 0;
  state.answers = [];
  state.incorrectPool = [];
  document.querySelector('.upload-card').classList.remove('hidden');
  el.setupView.classList.remove("hidden");
  el.quizView.classList.add("hidden");
  el.resultView.classList.add("hidden");
  resetQuestionArea();
}

function resetQuestionArea() {
  el.feedback.className = "feedback hidden";
  el.feedback.innerHTML = "";
  el.noteBox.className = "note-box hidden";
  el.noteBox.textContent = "";
  el.nextBtn.classList.add("hidden");
  el.submitBtn.classList.remove("hidden");
  el.submitBtn.disabled = false;
  el.showAnswerBtn.classList.toggle("hidden", !(state.mode === "study" || state.mode === "retry"));
}

function updateSidebar() {
  const total = state.questions.length || 1;
  const answered = state.answers.length;
  const correct = state.answers.filter(a => a.isCorrect).length;
  el.progressText.textContent = `${Math.min(state.currentIndex + 1, total)} / ${total}`;
  el.answeredText.textContent = `${answered} / ${total}`;
  el.correctText.textContent = `${correct} 題`;
  el.progressBar.style.width = `${answered / total * 100}%`;
}

