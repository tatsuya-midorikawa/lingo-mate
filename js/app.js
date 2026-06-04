/*
 * Lingo Mate - application logic
 *
 * Plain browser JavaScript. No bundler, transpiler, or framework required:
 * open `index.html` directly in a browser and it just works.
 */
(function () {
  "use strict";

  var words = Array.isArray(window.LINGO_MATE_WORDS)
    ? window.LINGO_MATE_WORDS
    : [];

  var NO_WORDS_MESSAGE = "単語がありません";

  /* ----------------------------- helpers ------------------------------ */

  // Fisher-Yates shuffle on a copy of the given array.
  function shuffle(array) {
    var result = array.slice();
    for (var i = result.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = result[i];
      result[i] = result[j];
      result[j] = temp;
    }
    return result;
  }

  /* --------------------------- tab switching -------------------------- */

  var tabButtons = document.querySelectorAll(".tab-button");
  var modes = document.querySelectorAll(".mode");

  function activateMode(mode) {
    tabButtons.forEach(function (button) {
      button.classList.toggle("is-active", button.dataset.mode === mode);
    });
    modes.forEach(function (section) {
      section.classList.toggle("is-active", section.id === mode);
    });
    if (mode === "quiz") {
      startQuiz();
    }
  }

  tabButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activateMode(button.dataset.mode);
    });
  });

  /* ---------------------------- flashcards ---------------------------- */

  var card = document.getElementById("flashcard");
  var frontText = document.getElementById("card-front-text");
  var backText = document.getElementById("card-back-text");
  var exampleText = document.getElementById("card-example");
  var counter = document.getElementById("card-counter");
  var prevButton = document.getElementById("prev-card");
  var nextButton = document.getElementById("next-card");
  var shuffleButton = document.getElementById("shuffle-cards");

  var cardOrder = words.slice();
  var cardIndex = 0;

  function renderCard() {
    if (cardOrder.length === 0) {
      frontText.textContent = NO_WORDS_MESSAGE;
      backText.textContent = "-";
      exampleText.textContent = "";
      counter.textContent = "0 / 0";
      prevButton.disabled = true;
      nextButton.disabled = true;
      return;
    }

    var current = cardOrder[cardIndex];
    card.classList.remove("is-flipped");
    frontText.textContent = current.word;
    backText.textContent = current.meaning;
    exampleText.textContent = current.example || "";
    counter.textContent = cardIndex + 1 + " / " + cardOrder.length;
    prevButton.disabled = cardIndex === 0;
    nextButton.disabled = cardIndex === cardOrder.length - 1;
  }

  function flipCard() {
    if (cardOrder.length === 0) {
      return;
    }
    card.classList.toggle("is-flipped");
  }

  card.addEventListener("click", flipCard);
  card.addEventListener("keydown", function (event) {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      flipCard();
    }
  });

  prevButton.addEventListener("click", function () {
    if (cardIndex > 0) {
      cardIndex--;
      renderCard();
    }
  });

  nextButton.addEventListener("click", function () {
    if (cardIndex < cardOrder.length - 1) {
      cardIndex++;
      renderCard();
    }
  });

  shuffleButton.addEventListener("click", function () {
    cardOrder = shuffle(words);
    cardIndex = 0;
    renderCard();
  });

  /* ------------------------------- quiz ------------------------------- */

  var quizActive = document.getElementById("quiz-active");
  var quizResult = document.getElementById("quiz-result");
  var quizProgress = document.getElementById("quiz-progress");
  var quizQuestion = document.getElementById("quiz-question");
  var quizOptions = document.getElementById("quiz-options");
  var quizFeedback = document.getElementById("quiz-feedback");
  var quizNext = document.getElementById("quiz-next");
  var quizScore = document.getElementById("quiz-score");
  var quizRestart = document.getElementById("quiz-restart");

  var QUIZ_LENGTH = Math.min(5, words.length);
  var OPTION_COUNT = Math.min(4, words.length);

  var quizQuestions = [];
  var quizIndex = 0;
  var score = 0;

  function buildQuestions() {
    var pool = shuffle(words).slice(0, QUIZ_LENGTH);
    return pool.map(function (item) {
      var distractors = shuffle(
        words.filter(function (other) {
          return other.word !== item.word;
        })
      ).slice(0, OPTION_COUNT - 1);

      var options = shuffle(distractors.concat([item]));
      return {
        word: item.word,
        answer: item.meaning,
        options: options.map(function (option) {
          return option.meaning;
        })
      };
    });
  }

  function renderQuestion() {
    var current = quizQuestions[quizIndex];
    quizProgress.textContent =
      "問題 " + (quizIndex + 1) + " / " + quizQuestions.length;
    quizQuestion.textContent = current.word;
    quizFeedback.textContent = "";
    quizFeedback.className = "quiz-feedback";
    quizNext.hidden = true;
    quizOptions.innerHTML = "";

    current.options.forEach(function (optionText) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "quiz-option";
      button.textContent = optionText;
      button.addEventListener("click", function () {
        handleAnswer(button, optionText, current.answer);
      });
      quizOptions.appendChild(button);
    });
  }

  function handleAnswer(button, chosen, answer) {
    var buttons = quizOptions.querySelectorAll(".quiz-option");
    buttons.forEach(function (other) {
      other.disabled = true;
      if (other.textContent === answer) {
        other.classList.add("correct");
      }
    });

    if (chosen === answer) {
      score++;
      quizFeedback.textContent = "正解！ 🎉";
      quizFeedback.className = "quiz-feedback correct";
    } else {
      button.classList.add("wrong");
      quizFeedback.textContent = "残念… 正解は「" + answer + "」";
      quizFeedback.className = "quiz-feedback wrong";
    }

    quizNext.hidden = false;
    quizNext.focus();
  }

  function showResult() {
    quizActive.hidden = true;
    quizResult.hidden = false;
    quizScore.textContent =
      quizQuestions.length + " 問中 " + score + " 問正解";
  }

  function startQuiz() {
    if (words.length === 0) {
      quizActive.hidden = false;
      quizResult.hidden = true;
      quizProgress.textContent = "";
      quizQuestion.textContent = NO_WORDS_MESSAGE;
      quizOptions.innerHTML = "";
      quizFeedback.textContent = "";
      quizNext.hidden = true;
      return;
    }
    quizQuestions = buildQuestions();
    quizIndex = 0;
    score = 0;
    quizActive.hidden = false;
    quizResult.hidden = true;
    renderQuestion();
  }

  quizNext.addEventListener("click", function () {
    quizIndex++;
    if (quizIndex < quizQuestions.length) {
      renderQuestion();
    } else {
      showResult();
    }
  });

  quizRestart.addEventListener("click", startQuiz);

  /* ------------------------------ init -------------------------------- */

  renderCard();
})();
