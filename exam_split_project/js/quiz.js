function loadQuestionsFromText(text, sourceName = "題庫") {
  const { parsed, failed } = debugParseQuestions(text);
  const normalizedParsed = parsed.map((q, index) => ({ ...q, question_number: index + 1 }));
  allQuestions = normalizedParsed;
  updateQuestionCount();
  setOptions();
  enableStartButtons(normalizedParsed.length > 0);
  showParseDebug(failed);
  showParsedQuestionDebug(normalizedParsed);

  if (!normalizedParsed.length) {
    setImportStatus(`載入失敗：${sourceName} 無法解析題目`, true);
    return;
  }
  setImportStatus(`載入成功：${sourceName}，共 ${normalizedParsed.length} 題。`);
}

function startQuiz(mode, pool) {
  if (!allQuestions.length) {
    alert("請先匯入題庫 docx 或 txt。");
    return;
  }
  document.querySelector('.upload-card').classList.add('hidden');
  state.mode = mode;
  state.questions = pool;
  state.currentIndex = 0;
  state.answers = [];
  state.incorrectPool = [];
  el.setupView.classList.add("hidden");
  el.quizView.classList.remove("hidden");
  el.resultView.classList.add("hidden");
  el.modeLabel.textContent =
    mode === "exam" ? "正式考試模式" :
    mode === "study" ? "學習模式" :
    mode === "range" ? "範圍考試模式" :
    "錯題重測";
  renderQuestion();
}

function startExam() {
  state.shuffleOptions = false;
  startQuiz("exam", shuffle(allQuestions));
}

function startRange() {
  const start = Number(el.rangeStart.value);
  const end = Number(el.rangeEnd.value);
  const count = Number(el.rangeCount.value);
  const doShuffle = el.shuffleQuestions.checked;
  state.shuffleOptions = el.shuffleOptions.checked;

  if (start > end) {
    alert("起始題號不能大於結束題號。");
    return;
  }

  let pool = allQuestions.filter(q => q.question_number >= start && q.question_number <= end);
  if (!pool.length) {
    alert("此範圍內沒有題目。");
    return;
  }

  if (doShuffle) {
    pool = shuffle(pool);
  }
  
  pool = pool.slice(0, count);
  startQuiz("range", pool);
}

function startStudy() {
  state.shuffleOptions = false;
  const start = Number(el.studyStart.value);
  const end = Number(el.studyEnd.value);
  if (start > end) {
    alert("起始題號不能大於結束題號。");
    return;
  }
  const selectedQuestions = allQuestions.filter(q => q.question_number >= start && q.question_number <= end);
  if (!selectedQuestions.length) {
    alert("此區間沒有題目。");
    return;
  }
  state.studyStartNum = start;
  state.studyEndNum = end;
  startQuiz("study", selectedQuestions);
}

function startRetryWrong() {
  if (!state.incorrectPool.length) return;
  startQuiz("retry", state.incorrectPool);
}

function retryCurrentRange() {
  const selectedQuestions = allQuestions.filter(q => q.question_number >= state.studyStartNum && q.question_number <= state.studyEndNum);
  if (!selectedQuestions.length) return;
  startQuiz("study", selectedQuestions);
}

function continueNext() {
  const rangeSize = state.studyEndNum - state.studyStartNum + 1;
  const nextStart = state.studyEndNum + 1;
  const nextEnd = state.studyEndNum + rangeSize;
  if (nextStart > allQuestions.length) return;
  const actualEnd = Math.min(nextEnd, allQuestions.length);
  const selectedQuestions = allQuestions.filter(q => q.question_number >= nextStart && q.question_number <= actualEnd);
  if (!selectedQuestions.length) {
    alert("已是最後一題，沒有更多題目了。");
    return;
  }
  state.studyStartNum = nextStart;
  state.studyEndNum = actualEnd;
  startQuiz("study", selectedQuestions);
}

function renderQuestion() {
  resetQuestionArea();
  el.showAnswerBtn.textContent = "顯示答案";
  updateSidebar();

  const q = state.questions[state.currentIndex];

  if (!q) {
    showResults();
    return;
  }

  el.questionNumber.textContent = `第 ${state.currentIndex + 1} 題 / 題庫編號 Q${q.question_number}`;

  const imageHtml = (q.images || []).map((src, index) => `
    <img
      src="${src}"
      class="question-image"
      data-image-index="${index}"
      alt="題目圖片 ${index + 1}"
    >
  `).join("");

  el.questionText.innerHTML = `
    <div>${escapeHtml(q.question)}</div>
    ${imageHtml}
  `;

  let optionsArr = Object.entries(q.options);

  if (state.shuffleOptions) {
    optionsArr = shuffle(optionsArr);
  }

  const inputType = q.is_multiple ? "checkbox" : "radio";

  el.optionList.innerHTML = optionsArr.map(([originalKey, value]) => `
    <label class="option" data-key="${originalKey}">
      <input type="${inputType}" name="option" value="${originalKey}" />
      <div><strong>${originalKey}.</strong> ${escapeHtml(value)}</div>
    </label>
  `).join("");

  document.querySelectorAll('input[name="option"]').forEach(input => {
    input.addEventListener("change", () => {
      if (!q.is_multiple) {
        document.querySelectorAll(".option").forEach(opt => opt.classList.remove("selected"));
      }

      input.closest(".option").classList.toggle("selected", input.checked);
    });
  });
  document.querySelectorAll(".question-image").forEach(img => {
    img.addEventListener("click", () => {
      document.getElementById("modalImage").src = img.src;
      document.getElementById("imageModal").classList.remove("hidden");
    });
  });
}

function selectedAnswer() {
  const checked = [...document.querySelectorAll('input[name="option"]:checked')]
    .map(input => input.value)
    .sort();

  return checked.length ? checked.join("") : null;
}

function toggleAnswer() {
  const q = state.questions[state.currentIndex];
  const correctAnswer = normalizeAnswerText(q.answer_in_bank);
  const isVisible = !el.noteBox.classList.contains("hidden");

  if (isVisible) {
    el.noteBox.classList.add("hidden");
    el.noteBox.textContent = "";
    el.showAnswerBtn.textContent = "顯示答案";

    document.querySelectorAll(".option").forEach(opt => {
      opt.classList.remove("correct");
    });

    return;
  }

  document.querySelectorAll(".option").forEach(opt => {
    if (correctAnswer.includes(opt.dataset.key)) {
      opt.classList.add("correct");
    }
  });

  el.noteBox.classList.remove("hidden");
  el.noteBox.textContent = `答案：${correctAnswer}｜解析：${q.note || "本題未提供解析。"}`;
  el.showAnswerBtn.textContent = "隱藏答案";
}

function submitAnswer() {
  const q = state.questions[state.currentIndex];
  const picked = selectedAnswer();

  if (!picked) {
    alert("請先選擇答案。");
    return;
  }

  const correctAnswer = normalizeAnswerText(q.answer_in_bank);
  const pickedAnswer = normalizeAnswerText(picked);
  const isCorrect = pickedAnswer === correctAnswer;

  state.answers.push({
    question_number: q.question_number,
    picked: pickedAnswer,
    correct: correctAnswer,
    isCorrect,
    question: q.question,
    options: q.options,
    note: q.note || ""
  });

  if (state.mode === "exam" || state.mode === "range") {
    updateSidebar();
    nextQuestion();
    return;
  }

  document.querySelectorAll(".option").forEach(opt => {
    const key = opt.dataset.key;

    if (correctAnswer.includes(key)) {
      opt.classList.add("correct");
    }

    if (pickedAnswer.includes(key) && !correctAnswer.includes(key)) {
      opt.classList.add("wrong");
    }
  });

  el.feedback.className = `feedback ${isCorrect ? "good" : "bad"}`;
  el.feedback.classList.remove("hidden");

  el.feedback.innerHTML = isCorrect
    ? `答對了。正確答案是 <strong>${correctAnswer}</strong>。`
    : `答錯了。你選的是 <strong>${pickedAnswer}</strong>，正確答案是 <strong>${correctAnswer}</strong>。`;

  if (state.mode === "study" || state.mode === "retry") {
    el.noteBox.classList.remove("hidden");
    el.noteBox.textContent = q.note || "本題未提供解析。";
    el.showAnswerBtn.textContent = "隱藏答案";
  }

  el.submitBtn.disabled = true;
  el.submitBtn.classList.add("hidden");
  el.nextBtn.classList.remove("hidden");
  updateSidebar();
}

function nextQuestion() {
  state.currentIndex += 1;
  if (state.currentIndex >= state.questions.length) {
    showResults();
  } else {
    renderQuestion();
  }
}

function showResults() {
  const total = state.answers.length;
  const correct = state.answers.filter(a => a.isCorrect).length;
  const wrong = state.answers.filter(a => !a.isCorrect);
  state.incorrectPool = state.questions.filter(q => wrong.some(w => w.question_number === q.question_number));
  el.resultView.classList.remove("hidden");
  el.questionNumber.textContent = "測驗完成";
  el.questionText.textContent = "測驗已完成，以下是成績與錯題整理。";
  el.optionList.innerHTML = "";
  el.feedback.classList.add("hidden");
  el.noteBox.classList.add("hidden");
  el.submitBtn.classList.add("hidden");
  el.showAnswerBtn.classList.add("hidden");
  el.nextBtn.classList.add("hidden");
  const percentage = total ? Math.round((correct / total) * 100) : 0;
  el.scoreText.textContent = `${correct} / ${total}`;
  el.scoreSub.innerHTML = `正確率：<strong>${percentage}%</strong>　｜　錯題數：<strong>${wrong.length}</strong>`;
  el.retryWrongBtn.classList.toggle("hidden", wrong.length === 0);

  if (state.mode === "study") {
    el.retryCurrentRangeBtn.classList.remove("hidden");
    const rangeSize = state.studyEndNum - state.studyStartNum + 1;
    const nextStart = state.studyEndNum + 1;
    const hasMore = nextStart <= allQuestions.length;
    el.continueNextBtn.classList.toggle("hidden", !hasMore);
    if (hasMore) {
      const actualEnd = Math.min(state.studyEndNum + rangeSize, allQuestions.length);
      el.continueNextLabel.textContent = actualEnd - nextStart + 1;
    }
  } else {
    el.retryCurrentRangeBtn.classList.add("hidden");
    el.continueNextBtn.classList.add("hidden");
  }

  if (!wrong.length) {
    el.wrongSummary.innerHTML = `<div class="wrong-item"><h4>恭喜，全對。</h4><p>這一輪沒有錯題，可以直接重新選模式。</p></div>`;
    return;
  }
  el.wrongSummary.innerHTML = wrong.map(item => {
    const optionText = item.options[item.correct] || "";
    return `
      <div class="wrong-item">
        <h4>Q${item.question_number}</h4>
        <p><strong>題目：</strong>${escapeHtml(item.question)}</p>
        <p><strong>你的答案：</strong>${escapeHtml(item.picked)}　｜　<strong>正確答案：</strong>${escapeHtml(item.correct)}. ${escapeHtml(optionText)}</p>
        <p><strong>重點：</strong>${escapeHtml(item.note || "本題未提供解析。")}</p>
      </div>
    `;
  }).join("");
}
document.getElementById("imageModal").addEventListener("click", () => {
  document.getElementById("imageModal").classList.add("hidden");
});
