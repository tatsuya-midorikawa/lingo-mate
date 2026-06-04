const test = require("node:test");
const assert = require("node:assert/strict");

const { getOrderedTargetLanguages } = require("./languageOptions.js");

test("puts English first, then navigator languages, then others", () => {
  const actual = getOrderedTargetLanguages(["ja-JP", "fr-FR", "en-US", "ja", "xx"]);
  const codes = actual.map((item) => item.code);

  assert.deepEqual(codes.slice(0, 3), ["en", "ja", "fr"]);
  assert.equal(new Set(codes).size, codes.length);
  assert.equal(codes.includes("es"), true);
});

test("falls back to English then remaining languages when navigator list is unavailable", () => {
  const actual = getOrderedTargetLanguages();
  const codes = actual.map((item) => item.code);

  assert.equal(codes[0], "en");
  assert.equal(new Set(codes).size, codes.length);
});
