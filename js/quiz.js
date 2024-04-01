// TODO: Function to manage statistics
// TODO: Print function for statistic (first page)
// TODO: Get function for questions/ print questions (run select random questions)
// TODO: Save to localstorage function
// TODO: Random function to select 10 questions
// TODO: Reset quiz button/function
// TODO: Print questions to modal function
// TODO: Counter for resaults
// TODO: Counter for total statistics

// ---------- COMMON FUNCTIONS/EVENT LISTNERS ---------- //

// ---------- STATISTICS PAGE (first page for quiz) ---------- //

// Manage statistics (initialize, update, get)
function manageStatistics() {
	// If there is no statistics saved in localStorage
	if (!localStorage.getItem("statistics")) {
		const initialStatistics = {
			questionsAnswered: 0,
			correctAnswers: 0,
			incorrectAnswers: 0,
		};
		localStorage.setItem("statistics", JSON.stringify(initialStatistics));
	}

	// Update the statistics in localStorage
	this.updateStatistics = function (correct) {
		const statistics = JSON.parse(localStorage.getItem("statistics"));
		statistics.questionsAnswered += 1;
		if (correct) {
			statistics.correctAnswers += 1;
		} else {
			statistics.incorrectAnswers += 1;
		}
		localStorage.setItem("statistics", JSON.stringify(statistics));
	};

	// Get current sstatistics
	this.getStatistics = function () {
		return JSON.parse(localStorage.getItem("statistics"));
	};

	// TODO: Maybe add a reset function for statistics
}

// Run an instancs of manageStatistics
const statisticsManager = new manageStatistics();

function printStatistics() {
	// Clear the main container
	mainContainer.innerHTML = "";

	document.querySelector(".add-episode-button").style.display = "none";
	document.querySelector(".add-character-button").style.display = "none";
	document.querySelector(".start-quiz-button").style.display = "block";

	// Create a new statistics container
	const statisticsContainer = document.createElement("div");
	statisticsContainer.className = "statistics-container";
	statisticsContainer.innerHTML = "<h2>Statistics</h2>";
	mainContainer.appendChild(statisticsContainer);

	// Create a new circles container
	const circlesContainer = document.createElement("div");
	circlesContainer.className = "circles-container";
	statisticsContainer.appendChild(circlesContainer);

	let statistics = statisticsManager.getStatistics();

	// Create circles for each statistic
	const answeredCircle = document.createElement("div");
	answeredCircle.className = "statistic-circle answered";
	answeredCircle.innerText = `Answered: ${statistics.questionsAnswered}`;
	circlesContainer.appendChild(answeredCircle);

	const correctCircle = document.createElement("div");
	correctCircle.className = "statistic-circle correct";
	correctCircle.innerText = `Correct: ${statistics.correctAnswers}`;
	circlesContainer.appendChild(correctCircle);

	const incorrectCircle = document.createElement("div");
	incorrectCircle.className = "statistic-circle incorrect";
	incorrectCircle.innerText = `Incorrect: ${statistics.incorrectAnswers}`;
	circlesContainer.appendChild(incorrectCircle);
}

// selecting 10 random questions
function selectRandomQuestions(questions, count) {
	const shuffled = questions.sort(() => 0.5 - Math.random());
	return shuffled.slice(0, count);
}

// ---------- QUIZ MODAL PAGE ---------- //

async function startQuiz() {
	try {
		let questions = await performDBOperation("questions", "readonly", "getAll");
		if (questions.length === 0) {
			await API.getQuestions();
			questions = await performDBOperation("questions", "readonly", "getAll");
		}

		const selectedQuestions = selectRandomQuestions(questions, 10);

		showQuestionInModal(selectedQuestions, 0);
	} catch (error) {
		console.error("Failed to start the quiz:", error);
	}
}

function showQuestionInModal(questions, index) {
	if (index >= questions.length) {
		alert("Quiz completed!");
		closeTheModal();
		return;
	}

	const question = questions[index];
	const modalContentCard = document.querySelector("#modal .modal-content-card");
	modalContentCard.innerHTML = `
        <h3>${question.question}</h3>
        ${question.possibleAnswers
			.map(
				(answer) =>
					`<button class="quiz-answer" onclick="handleAnswerClick('${answer === question.correctAnswer}', ${index}, ${JSON.stringify(
						questions
					).replace(/"/g, "&quot;")})">
                    ${answer}
                </button>`
			)
			.join("")}
    `;
}

function handleAnswerClick(isCorrect, index, questions) {
	const correct = isCorrect === "true";

	if (correct) {
		alert("Correct!");
	} else {
		alert("Incorrect!");
	}
	showQuestionInModal(questions, index + 1); // show next question
}
