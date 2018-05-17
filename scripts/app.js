// Global variables

const http = new XMLHttpRequest();

const mainBox = document.getElementById('main-box');
const startScreen = document.getElementById('start-screen');
const answerScreen = document.getElementById('answer-screen');
const endScreen = document.getElementById('end-screen');

const startButton = document.getElementById('start-button');
const questionElem = document.getElementById('question');
const buttonAnswerA = document.getElementById('answerA-button');
const buttonAnswerB = document.getElementById('answerB-button');
const restartButton = document.getElementById('restart-button');
const resultElem = document.getElementById('result');

const progressBar = document.getElementById('quiz-progress');
const correctAnswerOverlay = document.getElementById('correct-answer--overlay');
const wrongAnswerOverlay = document.getElementById('wrong-answer--overlay');
const correctAnswer = document.getElementById('correct-answer');
const wrongAnswer = document.getElementById('wrong-answer');

const correctAnswerSound = document.createElement('audio');
correctAnswerSound.setAttribute('src', 'sounds/correctAnswerSound.mp3');
const wrongAnswerSound = document.createElement('audio');
wrongAnswerSound.setAttribute('src', 'sounds/wrongAnswerSound.mp3');
const endGameSound = document.createElement('audio');
endGameSound.setAttribute('src', 'sounds/endGameSound.mp3');


// Objects

const animation = {
  toggleClass(elem, value) {
    elem.classList.toggle(value);
  },

  play(overlay, answer) {
    animation.toggleClass(overlay, 'display-none');
    animation.toggleClass(answer, 'answer-animation');

    setTimeout(() => {
      animation.toggleClass(overlay, 'display-none');
      animation.toggleClass(answer, 'answer-animation');
    }, 700);
  }
};

const flashcardsApp = {
  dataUrl: 'https://gist.githubusercontent.com/vergilius/6d869a7448e405cb52d782120b77b82c/raw/e75dc7c19b918a9f0f5684595899dba2e5ad4f43/history-flashcards.json',
  data: null,

  numberOfCorrectAnswers: 0,
  numberOfIncorrectAnswers: 0,
  questionDeck: null,
  answerA: null,
  answerB: null,

  loadData() {
    if (http.readyState === 4 && http.status === 200) {
      flashcardsApp.data = JSON.parse(http.response);
      flashcardsApp.questionDeck = [...flashcardsApp.data];
    } else if (http.readyState === 4 && http.status === 404) {
      alert('&#9888; 404 Data Not Found.');
    } else if (http.readyState === 4 && http.status === 500) {
      alert('&#9888; 500 Internal Server Error.');
    } else if (http.readyState === 4) {
      alert('&#9888; Wczytywanie danych, nie powiodło się.');
    }
  },

  displayNextQuestion() {
    if (this.numberOfCorrectAnswers === 10) {
      animation.toggleClass(answerScreen, 'display-none');
      animation.toggleClass(endScreen, 'display-none');
      endGameSound.play();
      resultElem.innerHTML = (
        `correct answers: <span class="green">${this.numberOfCorrectAnswers}</span><br>
         wrong answers: <span class="red">${this.numberOfIncorrectAnswers}</span>`
      );
    } else {
      questionElem.textContent = this.questionDeck[0].question;
      buttonAnswerA.textContent = this.questionDeck[0].answers[0].answer;
      buttonAnswerB.textContent = this.questionDeck[0].answers[1].answer;
    }
  },

  getAnswers() {
    if (this.questionDeck.length > 0) {
      this.answerA = this.questionDeck[0].answers[0].correct;
      this.answerB = this.questionDeck[0].answers[1].correct;
    }
  },

  checkAnswer(selectedAnswer) {
    const firstItem = this.questionDeck.shift();

    if (selectedAnswer) {
      this.numberOfCorrectAnswers += 1;
      progressBar.style.width = `${this.numberOfCorrectAnswers * 10}%`;
      correctAnswerSound.play();

      animation.play(correctAnswerOverlay, correctAnswer);
    } else {
      this.numberOfIncorrectAnswers += 1;
      this.questionDeck.push(firstItem);
      wrongAnswerSound.play();

      animation.play(wrongAnswerOverlay, wrongAnswer);
    }
  },

  restartQuiz() {
    this.numberOfCorrectAnswers = 0;
    this.numberOfIncorrectAnswers = 0;
    this.questionDeck = [...flashcardsApp.data];
    this.answerA = null;
    this.answerB = null;
    progressBar.style.width = `${this.numberOfCorrectAnswers * 10}%`;
  }
};


// Fetch data

http.open('GET', flashcardsApp.dataUrl, true);
http.send();

// Events

http.onreadystatechange = flashcardsApp.loadData;

startButton.addEventListener('click', () => {
  animation.toggleClass(startScreen, 'display-none');

  flashcardsApp.displayNextQuestion.call(flashcardsApp);
  flashcardsApp.getAnswers.call(flashcardsApp);

  animation.toggleClass(answerScreen, 'display-none');
});

buttonAnswerA.addEventListener('click', () => {
  const selectedAnswer = flashcardsApp.answerA;

  flashcardsApp.checkAnswer.call(flashcardsApp, selectedAnswer);
  flashcardsApp.displayNextQuestion.call(flashcardsApp);
  flashcardsApp.getAnswers.call(flashcardsApp);
});

buttonAnswerB.addEventListener('click', () => {
  const selectedAnswer = flashcardsApp.answerB;

  flashcardsApp.checkAnswer.call(flashcardsApp, selectedAnswer);
  flashcardsApp.displayNextQuestion.call(flashcardsApp);
  flashcardsApp.getAnswers.call(flashcardsApp);
});

restartButton.addEventListener('click', () => {
  animation.toggleClass(endScreen, 'display-none');
  animation.toggleClass(startScreen, 'display-none');
  flashcardsApp.restartQuiz.call(flashcardsApp);
});

function setMinHeight() {
  mainBox.style.minHeight = `${window.innerHeight - 140}px`;
}

window.onresize = setMinHeight;
setMinHeight();
