// write javascript here

const customContainer = document.querySelector(".custom-container");
const quizForm = document.querySelector("#quiz-form");
const quizContainer = document.querySelector(".quiz-container");
const resultsContainer = document.querySelector(".results-container");

const numQuestionsInput = document.querySelector("#num-questions");
const categoryInput = document.querySelector("#category");
const difficultyInput = document.querySelector("#difficulty");
const typeInput = document.querySelector("#type");


const startButton = document.querySelector("#start-quiz");
const quitButton = document.querySelector("#quit-quiz");
const nextButton = document.querySelector("#next-question");
const playAgainButton = document.querySelector("#play-again");

const score = document.querySelector(".score");
const questionNumber = document.querySelector(".question-number");
const totalQuestions = document.querySelector(".total-questions");
const questionTitle = document.querySelector(".question");
const optionsContainer = document.querySelector(".options-container");
const correctAnswer = document.querySelector(".correct-answer");
const resultScore = document.querySelector(".result_score");
const overlay = document.querySelector(".overlay");
let currentQuestion = 0;
let totalScore = 0;
let numQuestions;
let category;
let difficulty;
let type;

const fetchCategories = async function () {
    overlay.classList.remove('hidden');
    try{
        const response = await fetch(`https://opentdb.com/api_category.php`);
        const data = await response.json();
        overlay.classList.add('hidden');
        return data.trivia_categories;
    }
    catch(error){
        console.log(error);
        overlay.classList.add('hidden');
        showAlert('error', 'Failed to fetch categories. Please try again.');
    }
}

const dropdownCategories = async () => {
    try {
        const categories = await fetchCategories();
        categories.forEach((category) => {
            const option = document.createElement('option');
            option.value = category.id;

            let categoryName = category.name;
            if (categoryName.indexOf('Entertainment: ') !== -1) {
                categoryName = categoryName.replace('Entertainment: ', '').trim();
            }
            option.textContent = categoryName;
            categoryInput.appendChild(option);
        });
    } catch (error) {
        console.log(error);
        showAlert('error', 'Failed to fetch categories. Please try again.');
    }
}

const fetchQuestions = async function () {
    overlay.classList.remove('hidden');
    try {
        console.log('Fetching questions with:', numQuestions, category, difficulty, type);
        const response = await fetch(`https://opentdb.com/api.php?amount=${numQuestions}&category=${category}&difficulty=${difficulty}&type=${type}`);
        const data = await response.json();
        console.log(data.results);
        overlay.classList.add('hidden');
        return data.results;
    } catch (error) {
        console.log(error);
        overlay.classList.add('hidden');
        showAlert('error', 'Error: Something went wrong.');
    }
};

const displayQuestion = function (question) {
    let options = [...question.incorrect_answers, question.correct_answer];
    totalQuestions.textContent = `Total Questions: ${numQuestions}`;
    questionTitle.innerHTML = `Q${currentQuestion + 1}: &nbsp; ${question.question}`;

    optionsContainer.innerHTML = '';

    options = options.sort(() => Math.random() - 0.5);

    options.forEach((option) => {
        const optionElement = document.createElement("div");
        optionElement.classList.add("option");
        optionElement.textContent = option;

        optionElement.addEventListener("click", () => {
            if (option === question.correct_answer) {
                optionElement.style.backgroundColor = "#81e6d9";
                optionElement.style.color = "#2d3748";
                showAlert('success', 'correct answer, +1 point');
                totalScore++;
                score.innerHTML = `Score : ${totalScore}`;
            } else {
                optionElement.style.backgroundColor = "#e53e3e";
                optionElement.style.color = "#f7fafc !important";
                showAlert('error', 'Correct Answer is: ' + question.correct_answer);
            }
            optionsContainer.querySelectorAll('.option').forEach(el => el.style.pointerEvents = 'none');
        });
        optionsContainer.appendChild(optionElement);
    });
};

const displayQuestions = async () => {
    try {
        const questions = await fetchQuestions();

        displayQuestion(questions[currentQuestion]);

        nextButton.addEventListener('click', () => {
            currentQuestion++;
            if (currentQuestion < questions.length) {
                displayQuestion(questions[currentQuestion]);
            } else {
                resultsDisplay();
            }
        });
    } catch (error) {
        console.log(error);
        showAlert('error', 'Error: Something went wrong.');
    }
};

const resultsDisplay = function () {
    nextButton.style.display = "none";
    customContainer.classList.remove("active");
    quizContainer.classList.remove("active");
    resultsContainer.classList.add("active");
    totalQuestions.textContent = numQuestions;

    if(totalScore === 0){
        resultScore.innerHTML = `😞 Your score is: ${totalScore}`;
    }
    else if((totalScore / numQuestionsInput) < 0.5){
        resultScore.innerHTML = `😊 Your score is: ${totalScore}`;
    }
    else{
        resultScore.innerHTML = `🥳 Your score is: ${totalScore}`;
    }
    playAgainButton.addEventListener("click", () => {
        setTimeout(() => {
            location.reload();
        }, 2000);
        showAlert('success', 'Best of luck! for the new quiz.');
    });
}

quizForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    numQuestions = numQuestionsInput.value;
    category = categoryInput.value;
    difficulty = difficultyInput.value;
    type = typeInput.value;
    
    console.log('Form values:', numQuestions, category, difficulty, type);
    
    const questions = await displayQuestions();
    
    console.log(questions);
    
    customContainer.classList.add("hidden");
    quizContainer.classList.add("active");
});

const toggleContainers = () => {
    customContainer.classList.toggle("hidden");
    quizContainer.classList.toggle("active");
}

quitButton.addEventListener('click', () => {
    toggleContainers();
});

window.addEventListener("load", () => {
    dropdownCategories();
});

//////////////////////
/// alert messages /////
//////////////////////

function showAlert(type, message) {
  const alert = document.createElement('div');
  alert.classList.add('alert', `alert-${type}`);
  alert.textContent = message;

  document.body.appendChild(alert);

  setTimeout(() => {
    alert.classList.add('show');
  }, 10);

  setTimeout(() => {
    alert.classList.add('fade-out');
    setTimeout(() => alert.remove(), 600);
  }, 40000);
}