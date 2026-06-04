(function () {
  const sourceTextElement = document.getElementById("sourceText");
  const targetLanguageElement = document.getElementById("targetLanguage");
  const translateButtonElement = document.getElementById("translateButton");
  const detectedLanguageElement = document.getElementById("detectedLanguage");
  const translatedTextElement = document.getElementById("translatedText");

  const { getOrderedTargetLanguages } = LingoMateLanguageOptions;

  function populateTargetLanguages() {
    const orderedTargetLanguages = getOrderedTargetLanguages(navigator.languages);

    for (const language of orderedTargetLanguages) {
      const option = document.createElement("option");
      option.value = language.code;
      option.textContent = language.label;
      targetLanguageElement.appendChild(option);
    }
  }

  async function detectLanguage(text) {
    if (!text.trim()) {
      return "";
    }

    if (!globalThis.ai?.languageDetector?.create) {
      throw new Error("Language Detector API is not available");
    }

    const detector = await globalThis.ai.languageDetector.create();
    const detectionResults = await detector.detect(text);
    return detectionResults?.[0]?.detectedLanguage || "";
  }

  async function translateText(sourceLanguage, targetLanguage, text) {
    if (!globalThis.ai?.translator?.create) {
      throw new Error("Translator API is not available");
    }

    const translator = await globalThis.ai.translator.create({
      sourceLanguage,
      targetLanguage
    });

    return translator.translate(text);
  }

  async function handleTranslate() {
    const sourceText = sourceTextElement.value;
    const targetLanguage = targetLanguageElement.value;

    translatedTextElement.textContent = "";
    detectedLanguageElement.textContent = "";

    if (!sourceText.trim()) {
      return;
    }

    try {
      const detectedLanguage = await detectLanguage(sourceText);
      detectedLanguageElement.textContent = detectedLanguage
        ? `検出言語: ${detectedLanguage}`
        : "検出言語: 不明";

      const translatedText = await translateText(detectedLanguage, targetLanguage, sourceText);
      translatedTextElement.textContent = translatedText;
    } catch (error) {
      translatedTextElement.textContent = error instanceof Error ? error.message : String(error);
    }
  }

  populateTargetLanguages();
  translateButtonElement.addEventListener("click", handleTranslate);
})();
