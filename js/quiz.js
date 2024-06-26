// ---------- STATISTICS PAGE (first page for quiz) ---------- //

// Manage statistics (initialize, update, get)
function manageStatistics() {
	// If there is no statistics saved in localStorage
	if (!localStorage.getItem("statistics")) {
		const initialStatistics = {
			questionsAnswered: 0,
			correctAnswers: 0,
			incorrectAnswers: 0,
			totalQuestionsAnswered: 0,
			totalCorrectAnswers: 0,
			totalIncorrecsAnswers: 0,
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

	this.updateTotalStatistics = function (correct) {
		const statistics = JSON.parse(localStorage.getItem("statistics"));
		statistics.totalQuestionsAnswered += 1;
		if (correct) {
			statistics.totalCorrectAnswers += 1;
		} else {
			statistics.totalIncorrecsAnswers += 1;
		}
		localStorage.setItem("statistics", JSON.stringify(statistics));
	};

	// Get current statistics
	this.getStatistics = function () {
		return JSON.parse(localStorage.getItem("statistics"));
	};

	// Reset total statistics
	this.resetStatistics = function () {
		const statistics = {
			totalQuestionsAnswered: 0,
			totalCorrectAnswers: 0,
			totalIncorrecsAnswers: 0,
		};
		localStorage.setItem("statistics", JSON.stringify(statistics));
	};
}

// Run an instancs of manageStatistics
const statisticsManager = new manageStatistics();

function printStatistics() {
	// Clear the main container
	mainContainer.innerHTML = "";

	//hide and show correct buttons
	document.querySelector(".add-episode-button").style.display = "none";
	document.querySelector(".add-character-button").style.display = "none";
	document.querySelector(".start-quiz-button").style.display = "block";

	// Create a new statistics container
	const statisticsContainer = document.createElement("div");
	statisticsContainer.className = "statistics-container";
	statisticsContainer.innerHTML = "<h2>Quiz total statistics</h2>";
	mainContainer.appendChild(statisticsContainer);

	// Create a new circles container
	const circlesContainer = document.createElement("div");
	circlesContainer.className = "circles-container";
	statisticsContainer.appendChild(circlesContainer);

	let statistics = statisticsManager.getStatistics();

	// Create circles for each statistic
	const answeredCircle = document.createElement("div");
	answeredCircle.className = "statistic-circle answered";
	answeredCircle.innerText = `Answered: ${statistics.totalQuestionsAnswered}`;
	circlesContainer.appendChild(answeredCircle);

	const correctCircle = document.createElement("div");
	correctCircle.className = "statistic-circle correct";
	correctCircle.innerText = `Correct: ${statistics.totalCorrectAnswers}`;
	circlesContainer.appendChild(correctCircle);

	const incorrectCircle = document.createElement("div");
	incorrectCircle.className = "statistic-circle incorrect";
	incorrectCircle.innerText = `Incorrect: ${statistics.totalIncorrecsAnswers}`;
	circlesContainer.appendChild(incorrectCircle);

	// Create a reset button
	const resetButton = document.createElement("button");
	resetButton.className = "resetButton";
	resetButton.innerText = "Reset Statistics";
	resetButton.addEventListener("click", function () {
		// Reset the statistics
		statisticsManager.resetStatistics();

		// Reprint the statistics
		printStatistics();
	});
	statisticsContainer.appendChild(resetButton);
}

// selecting 10 random questions
function selectRandomQuestions(questions, count) {
	const shuffled = questions.sort(() => 0.5 - Math.random());
	return shuffled.slice(0, count);
}

// ---------- QUIZ MODAL PAGE ---------- //
let correctAnswerCount = 0;
let questions = []; // Declare questions as a global variable

async function startQuiz() {
	try {
		let allQuestions = await performDBOperation("questions", "readonly", "getAll");
		questions = selectRandomQuestions(allQuestions, 10); // Select 10 random questions

		let currentStatistics = JSON.parse(localStorage.getItem("statistics"));

		let statistics = {
			questionsAnswered: 0,
			correctAnswers: 0,
			incorrectAnswers: 0,
			totalQuestionsAnswered: currentStatistics.totalQuestionsAnswered,
			totalCorrectAnswers: currentStatistics.totalCorrectAnswers,
			totalIncorrecsAnswers: currentStatistics.totalIncorrecsAnswers,
		};
		localStorage.setItem("statistics", JSON.stringify(statistics));

		showQuestionInModal(questions, 0);
	} catch (error) {
		console.error("Failed to start the quiz:", error);
	}
}

function showQuestionInModal(questions, index) {
	const modalContentCard = document.querySelector("#modal .modal-content-card");
	let statistics = JSON.parse(localStorage.getItem("statistics"));

	if (index >= questions.length) {
		modalContentCard.innerHTML = `
		<h2>Quiz completed!</h2>
		<div class="circle correct">
				<span class="circle-text">${statistics.correctAnswers}</span>
				<span class="circle-label">Correct</span>
			</div>
			<div class="circle incorrect">
				<span class="circle-text">${statistics.incorrectAnswers}</span>
				<span class="circle-label">Incorrect</span>
			</div>
		<button class="closeButton" onclick="closeTheModal()">Close</button>
		`;
		return;
	}

	const question = questions[index];

	modalContentCard.innerHTML = `
		<div class="statistics-circles-quiz">
			<div class="circle answered">
				<span class="circle-text">${questions.length - index}</span>
				<span class="circle-label">Remaining</span>
			</div>
			<div class="circle correct">
				<span class="circle-text">${statistics.correctAnswers}</span>
				<span class="circle-label">Correct</span>
			</div>
			<div class="circle incorrect">
				<span class="circle-text">${statistics.incorrectAnswers}</span>
				<span class="circle-label">Incorrect</span>
			</div>
		</div>
        <h4>${question.question}</h4>
        ${question.possibleAnswers
			.map(
				(answer, i) =>
					`<button class="quiz-answer" onclick="handleAnswerClick('${answer === question.correctAnswer}', ${index}, ${i})">
					${answer}
                </button>
			`
			)
			.join("")}
    `;
}

function handleAnswerClick(isCorrect, questionIndex) {
	const correct = isCorrect === "true";

	if (correct) {
		statisticsManager.updateStatistics(true);
		statisticsManager.updateTotalStatistics(true);
	} else {
		statisticsManager.updateStatistics(false);
		statisticsManager.updateTotalStatistics(false);
	}
	showQuestionInModal(questions, questionIndex + 1); // show next question
	printStatistics();
}
