(function (global) {
  const SUPPORTED_LANGUAGES = [
    { code: "en", label: "English" },
    { code: "ja", label: "日本語" },
    { code: "es", label: "Español" },
    { code: "fr", label: "Français" },
    { code: "de", label: "Deutsch" },
    { code: "it", label: "Italiano" },
    { code: "pt", label: "Português" },
    { code: "ko", label: "한국어" },
    { code: "zh", label: "中文" },
    { code: "ru", label: "Русский" }
  ];

  function normalizeLanguageCode(languageCode) {
    return String(languageCode || "")
      .toLowerCase()
      .split("-")[0];
  }

  function getOrderedTargetLanguages(navigatorLanguages) {
    const languages = Array.isArray(navigatorLanguages) ? navigatorLanguages : [];
    const supportedByCode = new Map(SUPPORTED_LANGUAGES.map((lang) => [lang.code, lang]));
    const result = [];
    const usedCodes = new Set();

    const english = supportedByCode.get("en");
    if (english) {
      result.push(english);
      usedCodes.add("en");
    }

    for (const language of languages) {
      const code = normalizeLanguageCode(language);
      if (!code || usedCodes.has(code) || !supportedByCode.has(code)) {
        continue;
      }

      result.push(supportedByCode.get(code));
      usedCodes.add(code);
    }

    for (const language of SUPPORTED_LANGUAGES) {
      if (usedCodes.has(language.code)) {
        continue;
      }

      result.push(language);
      usedCodes.add(language.code);
    }

    return result;
  }

  const exported = {
    SUPPORTED_LANGUAGES,
    normalizeLanguageCode,
    getOrderedTargetLanguages
  };

  global.LingoMateLanguageOptions = exported;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = exported;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
