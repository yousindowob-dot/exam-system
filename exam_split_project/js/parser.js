function convertDocxHtmlToQuestionText(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  let imageIndex = 1;

  doc.querySelectorAll("img").forEach(img => {
    const marker = `[[IMG_${imageIndex}]]`;
    img.replaceWith(document.createTextNode("\n" + marker + "\n"));
    imageIndex++;
  });

  const text = doc.body.innerText || doc.body.textContent || "";
  return cleanDocxText(text);
}

async function extractTextFromDocx(file) {
  const arrayBuffer = await file.arrayBuffer();

  if (typeof mammoth === "undefined") {
    throw new Error("請先引入 mammoth.browser.min.js");
  }

  docxImageMap = {};
  let imageIndex = 1;

  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      convertImage: mammoth.images.inline(function(element) {
        return element.read("base64").then(function(imageBuffer) {
          const marker = `IMG_${imageIndex}`;
          const src = "data:" + element.contentType + ";base64," + imageBuffer;

          docxImageMap[marker] = src;
          imageIndex++;

          return {
            src
          };
        });
      })
    }
  );

  return convertDocxHtmlToQuestionText(result.value || "");
}

function normalizeAnswerText(text) {
  return String(text || "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .split("")
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .sort()
    .join("");
}

function parseQuestionBlock(block) {
  const text = String(block || "").trim();
  if (!text) return null;

  const lines = text
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  if (!lines.length) return null;

  const firstLineMatch = lines[0].match(/^Q\s*(\d+)(?:[\.\:：、\s]|$)(.*)$/i);
  if (!firstLineMatch) return null;

  const questionNumber = Number(firstLineMatch[1]);
  const firstLineRest = (firstLineMatch[2] || "").trim();

  const options = {};
  const emptyOptions = [];
  const formatErrors = [];
  const images = [];

  let answer = "";
  let note = "";

  const questionLines = [];
  if (firstLineRest) questionLines.push(firstLineRest);

  let i = 1;

  while (
    i < lines.length &&
    !/^[A-Z]\s+\S+/i.test(lines[i]) &&
    !/^([A-Z])(?:[\.\)\:：、]\s*(.*)|\s*)$/i.test(lines[i]) &&
    !/^(?:Answer|答案|answer_in_bank)\s*[\:：]\s*[A-Z,\s]+$/i.test(lines[i]) &&
    !/^(?:Note|note|解析|說明)\s*[\:：]/i.test(lines[i])
  ) {
    const imgMatch = lines[i].match(/^\[\[(IMG_\d+)\]\]$/i);

    if (imgMatch) {
      const imageKey = imgMatch[1].toUpperCase();

      if (docxImageMap[imageKey]) {
        images.push(docxImageMap[imageKey]);
      }
    } else {
      questionLines.push(lines[i]);
    }

    i++;
  }

  const question = questionLines.join(" ").trim();

  for (; i < lines.length; i++) {
    const line = lines[i];
    let m;

    if ((m = line.match(/^([A-Z])[\.\)\:：、]\s*(.*)$/i))) {
      const key = m[1].toUpperCase();
      const value = (m[2] || "").trim();

      options[key] = value;

      if (!value) {
        emptyOptions.push(`選項 ${key} 沒有內容`);
      }

    } else if ((m = line.match(/^([A-Z])$/i))) {
      const key = m[1].toUpperCase();

      options[key] = "";
      emptyOptions.push(`選項 ${key} 沒有內容`);

    } else if (/^[A-Z]\s+\S+/i.test(line)) {
      formatErrors.push(`選項格式錯誤：${line}`);

    } else if ((m = line.match(/^(?:Answer|答案|answer_in_bank)\s*[\:：]\s*([A-Z,\s]+)$/i))) {
      answer = normalizeAnswerText(m[1]);

    } else if ((m = line.match(/^(?:Note|note|解析|說明)\s*[\:：]\s*(.*)$/i))) {
      const noteLines = [m[1]];

      for (let j = i + 1; j < lines.length; j++) {
        noteLines.push(lines[j]);
      }

      note = noteLines.join(" ").trim();
      break;
    }
  }

  const missing = [];

  if (!question && !images.length) {
    missing.push("題目內容");
  }

  const optionCount = Object.keys(options).length;

  if (optionCount < 2) {
    missing.push("選項不足 2 個");
  }

  if (emptyOptions.length) {
    missing.push(...emptyOptions);
  }

  if (formatErrors.length) {
    missing.push(...formatErrors);
  }

  if (!answer) {
    missing.push("Answer 答案");
  }

  if (answer) {
    answer.split("").forEach(letter => {
      if (!options[letter]) {
        missing.push(`答案 ${letter} 找不到對應選項`);
      }
    });
  }

  if (missing.length) {
    return {
      parseError: true,
      question_number: questionNumber,
      firstLine: lines[0],
      missing,
      preview: lines.slice(0, 12).join("\n")
    };
  }

  return {
    question_number: questionNumber,
    question,
    images,
    options,
    answer_in_bank: answer,
    is_multiple: answer.length > 1,
    note
  };
}

function splitQuestionBlocks(text) {
  const normalized = normalizeLineBreaks(text);
  if (!normalized) return [];

  const lines = normalized.split("\n");
  const startIndexes = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (/^Q\s*\d+[\.\:：、]?(?:\s+.*)?$/i.test(line)) {
      startIndexes.push(i);
    }
  }

  const blocks = [];
  for (let i = startIndexes.length - 1; i >= 0; i--) {
    const start = startIndexes[i];
    const end = i < startIndexes.length - 1 ? startIndexes[i + 1] : lines.length;
    const block = lines.slice(start, end).join("\n").trim();
    if (block) blocks.unshift(block);
  }

  return blocks;
}

function debugParseQuestions(text) {
  const blocks = splitQuestionBlocks(text);
  const parsed = [];
  const failed = [];

  blocks.forEach((block, index) => {
    const q = parseQuestionBlock(block);

    if (q && !q.parseError) {
      parsed.push(q);
    } else {
      const firstLine = block.split("\n")[0]?.trim() || "(無法判定題號)";
      const matchedNumber = firstLine.match(/(\d+)/);

      failed.push({
        blockIndex: index + 1,
        guessedQuestionNumber: q?.question_number || (matchedNumber ? matchedNumber[1] : "未知"),
        firstLine: q?.firstLine || firstLine,
        missing: q?.missing || ["題目格式不符合 Q 開頭規則"],
        preview: q?.preview || block.slice(0, 300)
      });
    }
  });

  return { parsed, failed };
}

