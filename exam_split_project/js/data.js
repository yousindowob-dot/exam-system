let allQuestions = [];
let docxImageMap = {};

const sampleTxt = `Q1
小明平時不認真讀書，考前才熬夜抱佛腳，希望能考高分，這種行為最適合用哪個成語形容？
A. 按部就班
B. 臨渴掘井
C. 精益求精
D. 持之以恆
Answer: B
Note: A. 按部就班。意思：按照一定的步驟和順序做事。比喻做事有條理、有計畫。
C. 精益求精。意思：已經很好了，還要求更好。形容不斷追求進步與完美。
D. 持之以恆。意思：長久堅持下去，不半途而廢。形容做事有毅力、有耐心。

Q2
這位科學家為了研究新技術，不斷嘗試各種方法，即使失敗也不放棄，最適合用哪個成語形容？
A. 半途而廢
B. 自暴自棄
C. 鍥而不捨
D. 坐享其成
Answer: C
Note:A. 半途而廢。意思：事情做到一半就停止，不再繼續。形容缺乏毅力，無法堅持到底。
B. 自暴自棄。意思：自己看不起自己，放棄努力。形容失去信心，不求上進。
D. 坐享其成。意思：自己不付出努力，直接享受別人的成果。形容不勞而獲。`;

const state = {
  mode: null,
  questions: [],
  currentIndex: 0,
  answers: [],
  incorrectPool: [],
  studyStartNum: 1,
  studyEndNum: 10,
  shuffleOptions: true
};

const el = {
  fileInput: document.getElementById("fileInput"),
  loadSampleBtn: document.getElementById("loadSampleBtn"),
  downloadFormatBtn: document.getElementById("downloadFormatBtn"),
  formatPreview: document.getElementById("formatPreview"),
  importStatus: document.getElementById("importStatus"),
  parseDebugBox: document.getElementById("parseDebugBox"),
  parsedQuestionBox: document.getElementById("parsedQuestionBox"),
  totalQuestionCount: document.getElementById("totalQuestionCount"),
  studyStart: document.getElementById("studyStart"),
  studyEnd: document.getElementById("studyEnd"),
  rangeStart: document.getElementById("rangeStart"),
  rangeEnd: document.getElementById("rangeEnd"),
  rangeCount: document.getElementById("rangeCount"),
  shuffleQuestions: document.getElementById("shuffleQuestions"),
  shuffleOptions: document.getElementById("shuffleOptions"),
  startExamBtn: document.getElementById("startExamBtn"),
  startRangeBtn: document.getElementById("startRangeBtn"),
  startStudyBtn: document.getElementById("startStudyBtn"),
  setupView: document.getElementById("setupView"),
  quizView: document.getElementById("quizView"),
  modeLabel: document.getElementById("modeLabel"),
  progressText: document.getElementById("progressText"),
  answeredText: document.getElementById("answeredText"),
  correctText: document.getElementById("correctText"),
  progressBar: document.getElementById("progressBar"),
  questionNumber: document.getElementById("questionNumber"),
  questionText: document.getElementById("questionText"),
  optionList: document.getElementById("optionList"),
  showAnswerBtn: document.getElementById("showAnswerBtn"),
  submitBtn: document.getElementById("submitBtn"),
  nextBtn: document.getElementById("nextBtn"),
  feedback: document.getElementById("feedback"),
  noteBox: document.getElementById("noteBox"),
  resultView: document.getElementById("resultView"),
  scoreText: document.getElementById("scoreText"),
  scoreSub: document.getElementById("scoreSub"),
  wrongSummary: document.getElementById("wrongSummary"),
  retryWrongBtn: document.getElementById("retryWrongBtn"),
  retryCurrentRangeBtn: document.getElementById("retryCurrentRangeBtn"),
  continueNextBtn: document.getElementById("continueNextBtn"),
  continueNextLabel: document.getElementById("continueNextLabel"),
  restartBtn: document.getElementById("restartBtn"),
  backHomeBtn: document.getElementById("backHomeBtn"),
  themeToggle: document.getElementById("themeToggle"),
  themeIcon: document.getElementById("themeIcon")
};
