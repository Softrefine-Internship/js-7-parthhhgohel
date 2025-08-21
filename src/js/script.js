// write javascript here

// Screen Containers
const customContainer = document.querySelector(".custom-container");
const quizContainer = document.querySelector(".quiz-container");
const resultsContainer = document.querySelector(".results-container");

// inputs
const numQuestionsInput = document.querySelector("#num-questions");
const categoryInput = document.querySelector("#category");
const difficultyInput = document.querySelector("#difficulty");
const typeInput = document.querySelector("#type");

// form
const quizForm = document.querySelector("#quiz-form");

// buttons
const startButton = document.querySelector("#start-quiz");
const quitButton = document.querySelector("#quit-quiz");
const nextButton = document.querySelector("#next-question");
const playAgainButton = document.querySelector("#play-again");

// elements
const score = document.querySelector(".score");
const questionNumber = document.querySelector(".question-number");
const totalQuestions = document.querySelector(".total-questions");
const questionTitle = document.querySelector(".question");
const optionsContainer = document.querySelector(".options-container");
const correctAnswer = document.querySelector(".correct-answer");


// variables
let currentQuestion = 0;
let totalScore = 0;
let numQuestions;
let category;
let difficulty;
let type;


// functions

const fetchCategories = async function () {
    try{
        const response = await fetch(`https://opentdb.com/api_category.php`);
        const data = await response.json();
        return data.trivia_categories;
    }
    catch(error){
        console.log(error);
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
    try {
        console.log('Fetching questions with:', numQuestions, category, difficulty, type);
        const response = await fetch(`https://opentdb.com/api.php?amount=${numQuestions}&category=${category}&difficulty=${difficulty}&type=${type}`);
        const data = await response.json();
        console.log(data.results);
        return data.results;
    } catch (error) {
        console.log(error);
        showAlert('error', 'Error: Something went wrong.');
    }
};

const displayQuestion = function (question) {
    let options = [...question.incorrect_answers, question.correct_answer];
    questionNumber.textContent = currentQuestion + 1;
    totalQuestions.textContent = ` / ${numQuestions}`;
    questionTitle.textContent = question.question;
    
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
                score.textContent = totalScore;
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

        // Next btn
        nextButton.addEventListener('click', () => {
            currentQuestion++;
            if (currentQuestion < questions.length + 1) {
                displayQuestion(questions[currentQuestion]);
            } else {
                setTimeout(() => {
                    resultsDisplay();
                }, 2000)
                showAlert('success', 'Best of Luck!');
            }
        });
        quitButton.addEventListener('click', () => {
            setTimeout(() => {
                toggleContainers();
            }, 1000);
        });
    } catch (error) {
        console.log(error);
        showAlert('error', 'Error: Something went wrong.');
    }
};

const resultsDisplay = function () {
    nextButton.style.display = "none";
    customContainer.classList.remove("hidden");
    quizContainer.classList.remove("active");
    resultsContainer.classList.add("active");
    totalQuestions.textContent = numQuestions;

    if(totalScore === 0){
        score.textContent = '';
    }
    else if((numQuestionsInput / totalScore) < 0.5){
        score.textContent = `😊 Your score is: ${totalScore}`;
    }
    else{
        score.textContent = `🥳  Your score is: ${totalScore}`;
    }

    playAgainButton.addEventListener("click", () => {
        location.reload();
    });
}



// event listeners
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

// toggle between containers
const toggleContainers = () => {
    customContainer.classList.toggle("hidden");
    quizContainer.classList.toggle("active");
}

quitButton.addEventListener('click', () => {
    toggleContainers();
});

// Browser Load
window.addEventListener("load", () => {
    dropdownCategories();
});


//////////////////////
/// alert messages ///
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
  }, 4000);
}

// Example usage
// showAlert('success', 'Success: Operation completed successfully!');
// showAlert('error', 'Error: Something went wrong.');
