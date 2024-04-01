// TODO: Function to manage statistics
// TODO: Print function for statistic (first page)
// TODO: Get function for questions/ print questions (run select random questions)
// TODO: Save to localstorage function
// TODO: Random function to select 10 questions
// TODO: Reset quiz button/function
// TODO: Print questions to modal function
// TODO: Counter for resaults
// TODO: Counter for total statistics

// ---------- IMPORTS ---------- //

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

	// Create a new statistics container
	const statisticsContainer = document.createElement("div");
	statisticsContainer.className = "statistics-container";
	statisticsContainer.innerHTML = "<h2>statistics</h2>";
	mainContainer.appendChild(statisticsContainer);

	let statistics = statisticsManager.getStatistics();

	console.log(statistics);
}

// ---------- QUIZ MODAL PAGE ---------- //
