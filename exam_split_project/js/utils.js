function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalizeLineBreaks(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u00A0/g, " ")
    .replace(/\u3000/g, " ")
    .replace(/\t/g, " ")
    .replace(/^[ \t]+/gm, "")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanDocxText(text) {
  return normalizeLineBreaks(text);
}

function fixBrokenQuestionNumbers(text) {
  return String(text || "")
    .replace(/Q\s*(\d+)/gi, function(match, p1) {
      return "\nQ" + p1 + "\n"; 
    })
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function fixInlineQuestionFormat(text) {
  return String(text || "")
    .replace(/([^\n])([A-Z])[\.\)\:：、]\s*/g, "$1\n$2. ")
    .replace(/([^\n])(Answer|答案|answer_in_bank)\s*[\:：]\s*/gi, "$1\n$2: ")
    .replace(/([^\n])(Note|note|解析|說明)\s*[\:：]\s*/gi, "$1\n$2: ");
}

function escapeHtml(str) {
  return String(str).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

