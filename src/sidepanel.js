const MIN_DETECTION_CHARS = 8;
const LINE_BREAK_PATTERN = /(\r\n|\n|\r)/;
const LINE_BREAK_ONLY_PATTERN = /^(?:\r\n|\n|\r)$/;
const EMOJI_PATTERN = /\p{Extended_Pictographic}|\p{Regional_Indicator}/u;
const SUPPORTED_AVAILABILITY = new Set(["available", "downloadable", "downloading"]);

const SUPPORTED_LANGUAGES = [
  { code: "ar", name: "Arabic" },
  { code: "bg", name: "Bulgarian" },
  { code: "bn", name: "Bengali" },
  { code: "cs", name: "Czech" },
  { code: "da", name: "Danish" },
  { code: "de", name: "German" },
  { code: "el", name: "Greek" },
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fi", name: "Finnish" },
  { code: "fr", name: "French" },
  { code: "hi", name: "Hindi" },
  { code: "hr", name: "Croatian" },
  { code: "hu", name: "Hungarian" },
  { code: "id", name: "Indonesian" },
  { code: "it", name: "Italian" },
  { code: "iw", name: "Hebrew" },
  { code: "ja", name: "Japanese" },
  { code: "kn", name: "Kannada" },
  { code: "ko", name: "Korean" },
  { code: "lt", name: "Lithuanian" },
  { code: "mr", name: "Marathi" },
  { code: "nl", name: "Dutch" },
  { code: "no", name: "Norwegian" },
  { code: "pl", name: "Polish" },
  { code: "pt", name: "Portuguese" },
  { code: "ro", name: "Romanian" },
  { code: "ru", name: "Russian" },
  { code: "sk", name: "Slovak" },
  { code: "sl", name: "Slovenian" },
  { code: "sv", name: "Swedish" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "th", name: "Thai" },
  { code: "tr", name: "Turkish" },
  { code: "uk", name: "Ukrainian" },
  { code: "vi", name: "Vietnamese" },
  { code: "zh", name: "Chinese" },
  { code: "zh-Hant", name: "Chinese (Traditional)" }
];

const elements = {
  apiStatus: document.querySelector("#apiStatus"),
  characterCount: document.querySelector("#characterCount"),
  clearButton: document.querySelector("#clearButton"),
  confidenceValue: document.querySelector("#confidenceValue"),
  copyButton: document.querySelector("#copyButton"),
  detectedLanguage: document.querySelector("#detectedLanguage"),
  detectionHint: document.querySelector("#detectionHint"),
  downloadProgress: document.querySelector("#downloadProgress"),
  progressLabel: document.querySelector("#progressLabel"),
  progressSection: document.querySelector("#progressSection"),
  progressValue: document.querySelector("#progressValue"),
  resultText: document.querySelector("#resultText"),
  sourceText: document.querySelector("#sourceText"),
  statusFooter: document.querySelector(".status-footer"),
  statusMessage: document.querySelector("#statusMessage"),
  targetLanguage: document.querySelector("#targetLanguage"),
  translateButton: document.querySelector("#translateButton")
};

const displayNames = createDisplayNames();
const orderedTargetCodes = createOrderedTargetCodes();
const targetAvailabilityCache = new Map();
const translatorCache = new Map();

let detectorPromise = null;
let detectTimer = 0;
let detectionRun = 0;
let targetRun = 0;
let translationRun = 0;
let currentSourceLanguage = "";
let currentTargets = [];
let isTranslating = false;

initialize();

function initialize() {
  elements.sourceText.addEventListener("input", handleInput);
  elements.targetLanguage.addEventListener("change", updateTranslateButton);
  elements.translateButton.addEventListener("click", handleTranslate);
  elements.clearButton.addEventListener("click", clearInput);
  elements.copyButton.addEventListener("click", copyResult);

  renderTargetOptions([], "");
  updateCharacterCount();
  updateTranslateButton();
  checkApiAvailability();
}

async function checkApiAvailability() {
  const missingApis = [];

  if (!("LanguageDetector" in self)) {
    missingApis.push("Language Detector API");
  }

  if (!("Translator" in self)) {
    missingApis.push("Translator API");
  }

  if (missingApis.length > 0) {
    elements.apiStatus.textContent = "Built-in AI API は未対応です";
    setStatus(`${missingApis.join(" / ")} がこのブラウザで利用できません。`, "error");
    return;
  }

  try {
    const detectorAvailability = await LanguageDetector.availability();
    elements.apiStatus.textContent = `Detector: ${formatAvailability(detectorAvailability)}`;
  } catch (error) {
    elements.apiStatus.textContent = "API 確認に失敗しました";
    setStatus(`API の状態を確認できませんでした: ${getErrorMessage(error)}`, "error");
  }
}

function handleInput() {
  updateCharacterCount();
  elements.resultText.value = "";
  elements.copyButton.disabled = true;
  currentSourceLanguage = "";
  currentTargets = [];
  renderDetectedLanguage(null);
  renderTargetOptions([], "");
  updateTranslateButton();
  prepareDetector();

  window.clearTimeout(detectTimer);
  detectTimer = window.setTimeout(() => {
    detectInputLanguage({ force: false });
  }, 450);
}

function prepareDetector() {
  if (!("LanguageDetector" in self) || detectorPromise) {
    return;
  }

  getDetector().catch(() => {
    detectorPromise = null;
  });
}

function updateCharacterCount() {
  const count = [...elements.sourceText.value].length;
  elements.characterCount.textContent = `${count.toLocaleString()} 字`;
}

async function detectInputLanguage({ force }) {
  const rawText = elements.sourceText.value;
  const text = rawText.trim();
  const runId = ++detectionRun;

  if (!text) {
    renderDetectedLanguage(null);
    setStatus("入力すると言語を自動判定します。");
    return null;
  }

  if (!force && [...text].length < MIN_DETECTION_CHARS) {
    elements.detectionHint.textContent = "判定待ち";
    setStatus("もう少し入力すると言語を判定します。");
    return null;
  }

  if (!("LanguageDetector" in self) || !("Translator" in self)) {
    setStatus("このブラウザでは必要な Built-in AI API が利用できません。", "error");
    return null;
  }

  elements.detectionHint.textContent = "判定中";
  setStatus("入力言語を判定しています。");

  try {
    const detector = await getDetector();
    const results = await detector.detect(text);

    if (runId !== detectionRun) {
      return null;
    }

    const bestResult = Array.isArray(results) ? results[0] : null;
    const sourceLanguage = toSupportedLanguageCode(bestResult?.detectedLanguage);

    if (!bestResult || !sourceLanguage) {
      currentSourceLanguage = "";
      renderDetectedLanguage(null);
      renderTargetOptions([], "");
      setStatus("対応している入力言語を判定できませんでした。", "error");
      return null;
    }

    currentSourceLanguage = sourceLanguage;
    renderDetectedLanguage({
      code: sourceLanguage,
      confidence: bestResult.confidence ?? 0
    });

    await refreshTargetLanguages(sourceLanguage);
    return sourceLanguage;
  } catch (error) {
    if (runId !== detectionRun) {
      return null;
    }

    detectorPromise = null;
    currentSourceLanguage = "";
    renderDetectedLanguage(null);
    renderTargetOptions([], "");
    setStatus(`言語判定に失敗しました: ${getErrorMessage(error)}`, "error");
    return null;
  } finally {
    updateTranslateButton();
  }
}

async function refreshTargetLanguages(sourceLanguage) {
  const runId = ++targetRun;
  const previousTarget = elements.targetLanguage.value;

  elements.targetLanguage.disabled = true;
  elements.targetLanguage.replaceChildren(new Option("対応言語を確認中", ""));
  setStatus("翻訳先の対応状況を確認しています。");

  try {
    const targets = await getAvailableTargets(sourceLanguage);

    if (runId !== targetRun) {
      return;
    }

    currentTargets = targets;
    renderTargetOptions(targets, previousTarget);

    if (targets.length === 0) {
      setStatus("この入力言語から翻訳できる対象言語が見つかりませんでした。", "error");
      return;
    }

    setStatus("翻訳できます。", "success");
  } catch (error) {
    if (runId !== targetRun) {
      return;
    }

    currentTargets = [];
    renderTargetOptions([], "");
    setStatus(`翻訳先を確認できませんでした: ${getErrorMessage(error)}`, "error");
  } finally {
    updateTranslateButton();
  }
}

async function getAvailableTargets(sourceLanguage) {
  if (targetAvailabilityCache.has(sourceLanguage)) {
    return targetAvailabilityCache.get(sourceLanguage);
  }

  const candidates = orderedTargetCodes.filter((targetLanguage) => {
    return !isSameLanguage(sourceLanguage, targetLanguage);
  });

  const checks = await Promise.allSettled(
    candidates.map(async (targetLanguage) => {
      const availability = await Translator.availability({
        sourceLanguage,
        targetLanguage
      });

      if (!SUPPORTED_AVAILABILITY.has(availability)) {
        return null;
      }

      return { code: targetLanguage, availability };
    })
  );

  const targets = checks
    .map((result) => result.status === "fulfilled" ? result.value : null)
    .filter(Boolean);

  targetAvailabilityCache.set(sourceLanguage, targets);
  return targets;
}

function renderDetectedLanguage(result) {
  if (!result) {
    elements.detectedLanguage.textContent = "未検出";
    elements.confidenceValue.textContent = "";
    elements.detectionHint.textContent = "未検出";
    return;
  }

  const confidence = Math.max(0, Math.min(1, result.confidence));
  const percent = Math.round(confidence * 100);

  elements.detectedLanguage.textContent = `${getLanguageName(result.code)} (${result.code})`;
  elements.confidenceValue.textContent = `信頼度 ${percent}%`;
  elements.detectionHint.textContent = `${getLanguageName(result.code)} / ${percent}%`;
}

function renderTargetOptions(targets, preferredTarget) {
  elements.targetLanguage.replaceChildren();

  if (targets.length === 0) {
    elements.targetLanguage.append(new Option("入力後に選択", ""));
    elements.targetLanguage.disabled = true;
    return;
  }

  for (const target of targets) {
    const option = new Option(`${getLanguageName(target.code)} (${target.code})`, target.code);
    option.dataset.availability = target.availability;
    elements.targetLanguage.append(option);
  }

  const hasPreferredTarget = targets.some((target) => target.code === preferredTarget);
  elements.targetLanguage.value = hasPreferredTarget ? preferredTarget : targets[0].code;
  elements.targetLanguage.disabled = false;
}

async function handleTranslate() {
  if (isTranslating) {
    return;
  }

  const rawText = elements.sourceText.value;
  const text = rawText.trim();

  if (!text) {
    setStatus("翻訳するテキストを入力してください。", "error");
    return;
  }

  if (!("LanguageDetector" in self) || !("Translator" in self)) {
    setStatus("このブラウザでは必要な Built-in AI API が利用できません。", "error");
    return;
  }

  const runId = ++translationRun;
  isTranslating = true;
  setBusy(true);

  try {
    let sourceLanguage = currentSourceLanguage;

    if (!sourceLanguage) {
      sourceLanguage = await detectInputLanguage({ force: true });
    }

    if (!sourceLanguage) {
      throw new Error("入力言語を判定できませんでした。");
    }

    if (currentTargets.length === 0) {
      await refreshTargetLanguages(sourceLanguage);
    }

    const targetLanguage = elements.targetLanguage.value;

    if (!targetLanguage) {
      throw new Error("翻訳先言語を選択できませんでした。");
    }

    setStatus("翻訳しています。");

    const translator = await getTranslator(sourceLanguage, targetLanguage);
    const translatedText = await translatePreservingLineBreaks(translator, rawText);

    if (runId !== translationRun) {
      return;
    }

    elements.resultText.value = translatedText;
    elements.copyButton.disabled = translatedText.length === 0;
    setStatus("翻訳しました。", "success");
  } catch (error) {
    if (runId !== translationRun) {
      return;
    }

    elements.copyButton.disabled = true;
    setStatus(`翻訳に失敗しました: ${getErrorMessage(error)}`, "error");
  } finally {
    if (runId === translationRun) {
      isTranslating = false;
      setBusy(false);
      hideProgress();
    }
  }
}

async function translatePreservingLineBreaks(translator, text) {
  const translatedParts = [];

  for (const part of text.split(LINE_BREAK_PATTERN)) {
    if (!part || LINE_BREAK_ONLY_PATTERN.test(part) || part.trim().length === 0) {
      translatedParts.push(part);
      continue;
    }

    translatedParts.push(await translatePreservingEmoji(translator, part));
  }

  return translatedParts.join("");
}

async function translatePreservingEmoji(translator, text) {
  if (!EMOJI_PATTERN.test(text)) {
    return translator.translate(text);
  }

  const translatedSegments = [];

  for (const segment of splitEmojiSegments(text)) {
    if (segment.isEmoji || segment.text.trim().length === 0) {
      translatedSegments.push(segment.text);
      continue;
    }

    translatedSegments.push(await translator.translate(segment.text));
  }

  return translatedSegments.join("");
}

function splitEmojiSegments(text) {
  const graphemes = toGraphemes(text);
  const segments = [];
  let buffer = "";

  for (const grapheme of graphemes) {
    if (EMOJI_PATTERN.test(grapheme)) {
      if (buffer) {
        segments.push({ text: buffer, isEmoji: false });
        buffer = "";
      }

      segments.push({ text: grapheme, isEmoji: true });
      continue;
    }

    buffer += grapheme;
  }

  if (buffer) {
    segments.push({ text: buffer, isEmoji: false });
  }

  return segments;
}

function toGraphemes(text) {
  if ("Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return [...segmenter.segment(text)].map((entry) => entry.segment);
  }

  return [...text];
}

async function getDetector() {
  if (detectorPromise) {
    return detectorPromise;
  }

  detectorPromise = LanguageDetector.create({
    monitor(monitor) {
      monitor.addEventListener("downloadprogress", (event) => {
        showProgress("言語検出モデル", event.loaded);
      });
    }
  });

  try {
    const detector = await detectorPromise;

    if (detector.ready instanceof Promise) {
      await detector.ready;
    }

    hideProgress();
    return detector;
  } catch (error) {
    detectorPromise = null;
    hideProgress();
    throw error;
  }
}

async function getTranslator(sourceLanguage, targetLanguage) {
  const key = `${sourceLanguage}:${targetLanguage}`;

  if (translatorCache.has(key)) {
    return translatorCache.get(key);
  }

  const availability = await Translator.availability({
    sourceLanguage,
    targetLanguage
  });

  if (!SUPPORTED_AVAILABILITY.has(availability)) {
    throw new Error(`${sourceLanguage} から ${targetLanguage} への翻訳は利用できません。`);
  }

  const translatorPromise = Translator.create({
    sourceLanguage,
    targetLanguage,
    monitor(monitor) {
      monitor.addEventListener("downloadprogress", (event) => {
        showProgress(`${getLanguageName(sourceLanguage)} → ${getLanguageName(targetLanguage)}`, event.loaded);
      });
    }
  });

  translatorCache.set(key, translatorPromise);

  try {
    const translator = await translatorPromise;

    if (translator.ready instanceof Promise) {
      await translator.ready;
    }

    hideProgress();
    return translator;
  } catch (error) {
    translatorCache.delete(key);
    hideProgress();
    throw error;
  }
}

function clearInput() {
  elements.sourceText.value = "";
  elements.resultText.value = "";
  elements.copyButton.disabled = true;
  currentSourceLanguage = "";
  currentTargets = [];
  window.clearTimeout(detectTimer);
  updateCharacterCount();
  renderDetectedLanguage(null);
  renderTargetOptions([], "");
  setStatus("入力すると言語を自動判定します。");
  updateTranslateButton();
  elements.sourceText.focus();
}

async function copyResult() {
  const text = elements.resultText.value;

  if (!text) {
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    setStatus("翻訳結果をコピーしました。", "success");
  } catch (error) {
    setStatus(`コピーに失敗しました: ${getErrorMessage(error)}`, "error");
  }
}

function setBusy(isBusy) {
  elements.translateButton.textContent = isBusy ? "翻訳中" : "翻訳";
  updateTranslateButton();
}

function updateTranslateButton() {
  const hasText = elements.sourceText.value.trim().length > 0;
  const hasTarget = elements.targetLanguage.value.length > 0;
  const hasApis = "LanguageDetector" in self && "Translator" in self;
  elements.translateButton.disabled = isTranslating || !hasText || !hasTarget || !hasApis;
}

function setStatus(message, tone = "neutral") {
  elements.statusMessage.textContent = message;
  elements.statusFooter.dataset.tone = tone;
}

function showProgress(label, loaded) {
  const percent = Math.round(Math.max(0, Math.min(1, loaded || 0)) * 100);
  elements.progressSection.hidden = false;
  elements.progressLabel.textContent = label;
  elements.progressValue.textContent = `${percent}%`;
  elements.downloadProgress.value = percent;
}

function hideProgress() {
  elements.progressSection.hidden = true;
  elements.downloadProgress.value = 0;
  elements.progressValue.textContent = "0%";
}

function createDisplayNames() {
  if (!("DisplayNames" in Intl)) {
    return null;
  }

  try {
    return new Intl.DisplayNames(navigator.languages, { type: "language" });
  } catch {
    return null;
  }
}

function getLanguageName(code) {
  const language = SUPPORTED_LANGUAGES.find((item) => item.code === code);
  const displayCode = code === "iw" ? "he" : code;

  try {
    return displayNames?.of(displayCode) || language?.name || code;
  } catch {
    return language?.name || code;
  }
}

function createOrderedTargetCodes() {
  const ordered = [];

  addCode(ordered, "en");

  for (const userLanguage of navigator.languages || []) {
    const match = SUPPORTED_LANGUAGES.find((language) => {
      return language.code !== "en" && languageMatches(userLanguage, language.code);
    });

    if (match) {
      addCode(ordered, match.code);
    }
  }

  for (const language of SUPPORTED_LANGUAGES) {
    addCode(ordered, language.code);
  }

  return ordered;
}

function addCode(list, code) {
  if (!list.includes(code)) {
    list.push(code);
  }
}

function toSupportedLanguageCode(code) {
  if (!code) {
    return "";
  }

  const exactMatch = SUPPORTED_LANGUAGES.find((language) => {
    return normalizeLanguageTag(language.code) === normalizeLanguageTag(code);
  });

  if (exactMatch) {
    return exactMatch.code;
  }

  const broadMatch = SUPPORTED_LANGUAGES.find((language) => languageMatches(code, language.code));
  return broadMatch?.code || "";
}

function isSameLanguage(sourceLanguage, targetLanguage) {
  return normalizeLanguageTag(sourceLanguage) === normalizeLanguageTag(targetLanguage);
}

function languageMatches(userLanguage, supportedLanguage) {
  const userTag = normalizeLanguageTag(userLanguage);
  const supportedTag = normalizeLanguageTag(supportedLanguage);

  if (!userTag || !supportedTag) {
    return false;
  }

  if (userTag === supportedTag) {
    return true;
  }

  const userParts = userTag.split("-");
  const supportedParts = supportedTag.split("-");
  const userBase = userParts[0];
  const supportedBase = supportedParts[0];

  if (userBase !== supportedBase) {
    return false;
  }

  if (supportedTag === "zh-hant") {
    return userParts.includes("hant") || userParts.includes("tw") || userParts.includes("hk") || userParts.includes("mo");
  }

  if (supportedTag === "zh") {
    return !userParts.includes("hant") && !userParts.includes("tw") && !userParts.includes("hk") && !userParts.includes("mo");
  }

  return supportedParts.length === 1;
}

function normalizeLanguageTag(languageTag) {
  if (!languageTag) {
    return "";
  }

  const normalized = languageTag.trim().replace(/_/g, "-");

  try {
    return Intl.getCanonicalLocales(normalized)[0].toLowerCase().replace(/^iw\b/, "he");
  } catch {
    return normalized.toLowerCase().replace(/^iw\b/, "he");
  }
}

function formatAvailability(availability) {
  switch (availability) {
    case "available":
      return "利用可能";
    case "downloadable":
      return "ダウンロード可能";
    case "downloading":
      return "ダウンロード中";
    case "unavailable":
      return "未対応";
    default:
      return availability || "不明";
  }
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}