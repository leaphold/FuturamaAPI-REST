// Getting main container (needed to be outside functions)
const mainContainer = document.querySelector(".main-container");

// ----------- COMMON FUNCTIONS AND EVENT LISTERS ----------- //

// Event listners
document.addEventListener("DOMContentLoaded", function () {
	// Event listeners for navigation buttons
	document.querySelector(".characters-button").addEventListener("click", printCharacters);
	document.querySelector(".episodes-button").addEventListener("click", printEpisodes);
	document.querySelector(".questions-button").addEventListener("click", printStatistics);
	document.querySelector(".start-quiz-button").addEventListener("click", function () {
		document.getElementById("modal").style.display = "block";

		startQuiz();

		// Hide edit and delete buttons in modal
		let = editDeleteButtons = document.querySelectorAll(".edit-delete");
		editDeleteButtons.forEach((button) => (button.style.display = "none"));
	});
	document.querySelector(".add-character-button").addEventListener("click", function () {
		document.getElementById("modal").style.display = "block";

		// Hide edit and delete buttons in modal
		let = editDeleteButtons = document.querySelectorAll(".edit-delete");
		editDeleteButtons.forEach((button) => (button.style.display = "none"));
		// Display add character form
		addCharacterForm();
	});
	document.querySelector(".add-episode-button").addEventListener("click", function () {
		document.getElementById("modal").style.display = "block";
		// Hide edit and delete buttons in modal
		let = editDeleteButtons = document.querySelectorAll(".edit-delete");
		editDeleteButtons.forEach((button) => (button.style.display = "none"));
		// Display add episode form
		addEpisodeForm();
	});
});

// Function to close the modal
let closeButtonElement = document.querySelector("#modal .close");
closeButtonElement.addEventListener("click", closeTheModal);

function closeTheModal() {
	let characterModal = document.getElementById("modal");
	characterModal.style.display = "none";
}

// Shared for edit and delete buttons
let deleteButton = document.querySelector(".delete");
let deleteFunction = null;
let editButton = document.querySelector(".edit");
let editFunction = null;

// ----------- CHARACTERS ----------- //

// Function to print all characters
async function printCharacters() {
	// Clear the main container
	mainContainer.innerHTML = "";
	//Display add character button
	document.querySelector(".start-quiz-button").style.display = "none";
	document.querySelector(".add-episode-button").style.display = "none";
	document.querySelector(".add-character-button").style.display = "block";

	// Create a new characters container
	const charactersContainer = document.createElement("div");
	charactersContainer.className = "characters-container";
	charactersContainer.innerHTML = "<h2>Characters</h2>";
	mainContainer.appendChild(charactersContainer);

	let characters = await performDBOperation("characters", "readonly", "getAll");

	// Remap the characters
	characters = characters.map(remapCharacters);

	const container = document.getElementsByClassName("characters-container")[0];

	for (const character of characters) {
		const characterElement = document.createElement("div");
		characterElement.className = "card";
		characterElement.innerHTML = `
		<h3>${character.fullName}</h3>
		<p>Occupation: ${character.occupation}</p>
		<p>Homeplanet: ${character.homePlanet}</p>
		`;
		characterElement.addEventListener("click", () => printCharacter(character.id));
		container.appendChild(characterElement);
	}
}

//Show a specific character in modal
async function printCharacter(id) {
	let character = await performDBOperation("characters", "readonly", "get", id);

	// Remap the character
	character = remapCharacters(character);
	// Populate modal with character details
	let characterCard = document.querySelector("#modal .modal-content-card");
	let randomSayings = getRandomSayings(character.sayings);
	characterCard.innerHTML = `
	<h3>${character.fullName}</h3>
	<p><b>Occupation:</b> ${character.occupation}</p>
	<p><b>Homeplanet:</b> ${character.homePlanet}</p>
	<img src="${character.images.main}" alt="${character.fullName}">
	<ul>
		${randomSayings.map((saying) => `<li>${saying}</li>`).join("")}
	</ul>
	`;
	// Show edit and delete buttons in modal
	let editDeleteButtons = document.querySelectorAll(".edit-delete");
	editDeleteButtons.forEach((button) => (button.style.display = "inline"));

	let characterModal = document.getElementById("modal");
	characterModal.style.display = "block";
	// Event listeners for delete and edit buttons
	if (deleteFunction) {
		deleteButton.removeEventListener("click", deleteFunction);
	}

	deleteFunction = () => deleteCharacter(id);
	deleteButton.addEventListener("click", deleteFunction);

	if (editFunction) {
		editButton.removeEventListener("click", editFunction);
	}

	editFunction = () => editCharacterForm(id);
	editButton.addEventListener("click", editFunction);
}

// Remap for characters
function remapCharacters(character) {
	const fullName = `${character.name.first || " "} ${character.name.middle || " "} ${character.name.last || " "}`;
	return {
		...character,
		name: {
			first: character.name.first || " ",
			middle: character.name.middle || " ",
			last: character.name.last || " ",
		},
		fullName: fullName,
		occupation: character.occupation || "Slacker",
		homePlanet: character.homePlanet || "The universe!",
	};
}

// Function to get random sayings
function getRandomSayings(sayings) {
	let randomSayings = [];
	for (let i = 0; i < 1; i++) {
		let randomIndex = Math.floor(Math.random() * sayings.length);
		randomSayings.push(sayings[randomIndex]);
		sayings.splice(randomIndex, 1);
	}
	return randomSayings;
}

// Function to display add character form
async function addCharacterForm() {
	// Create form element
	const form = document.createElement("form");
	form.id = "addCharacterForm";

	// Event listener for form submission
	form.addEventListener("submit", async function (event) {
		event.preventDefault();

		// Get form input values
		const firstName = document.getElementById("firstName").value;
		const lastName = document.getElementById("lastName").value;
		const homePlanet = document.getElementById("homePlanet").value;

		// Create new character object
		const newCharacter = {
			name: {
				first: firstName,
				middle: "",
				last: lastName,
			},
			images: {
				"head-shot": "",
				main: "./images/default.webp",
			},
			gender: "",
			species: "",
			occupation: "",
			sayings: ["Monkey say, monkey do!"],
			id: await getNextCharacterId(),
			age: "",
			homePlanet: homePlanet,
		};
		try {
			// Add character to database
			await addCharacter(newCharacter);
			console.log("Character added successfully IN ADDCHARFORM!");
			form.reset();
			await printCharacters(); // Update the character list after adding
		} catch (error) {
			console.error("Error adding character:", error);
		}
	});

	// Populate modal with add character form
	let modalFormCard = document.querySelector("#modal .modal-content-card");
	modalFormCard.innerHTML = "";
	modalFormCard.appendChild(form);

	form.innerHTML = `
		<form class="add-character-form">
			<div class="label-input-form">
				<label for="firstName">First Name:</label>
				<input type="text" id="firstName" name="firstName" placeholder="First name" required>
			</div>
			<div class="label-input-form">
				<label for="lastName">Last Name:</label>
				<input type="text" id="lastName" name="lastName" placeholder="Last name">
			</div>
			<div class="label-input-form">
				<label for="homePlanet">Home Planet:</label>
				<input type="text" id="homePlanet" name="homePlanet" placeholder="Home planet">
			</div>
			<input class="submitButton" type="submit" value="Submit">
		</form>
	`;
}

// Function to display edit character form
async function editCharacterForm(id) {
	// Fetch character from database
	let character = await performDBOperation("characters", "readonly", "get", id);

	let firstName = character.name.first;
	let lastName = character.name.last;
	let homePlanet = character.homePlanet;

	// Create form element
	const form = document.createElement("form");
	form.id = "editCharacterForm";

	form.addEventListener("submit", async function (event) {
		event.preventDefault();

		firstName = document.getElementById("firstName").value;
		lastName = document.getElementById("lastName").value;
		homePlanet = document.getElementById("homePlanet").value;

		const newCharacter = {
			name: {
				first: firstName,
				last: lastName,
			},
			homePlanet: homePlanet,
		};
		try {
			await updateCharacter(id, newCharacter);
			console.log("Character edited successfully IN ADDCHARFORM!");
			await printCharacter(id);
			await printCharacters();
		} catch (error) {
			console.error("Error editing character:", error);
		}
	});

	let modalFormCard = document.querySelector("#modal .modal-content-card");
	modalFormCard.innerHTML = "";
	modalFormCard.appendChild(form);

	form.innerHTML = `
		<form class="edit-character-form">
			<div class="label-input-form">
				<label for="firstName">First Name:</label>
				<input type="text" id="firstName" name="firstName" value="${firstName}" required>
			</div>
			<div class="label-input-form">
				<label for="lastName">Last Name:</label>
				<input type="text" id="lastName" name="lastName" value="${lastName}">
			</div>
			<div class="label-input-form">
				<label for="homePlanet">Home Planet:</label>
				<input type="text" id="homePlanet" name="homePlanet" value="${homePlanet}">
			</div>
			<input class="submitButton" type="submit" value="Submit">
		</form>
	`;
}

// ---------------- EPISODES ---------------- //

// Function to print all episodes
async function printEpisodes() {
	// Clear the main container
	mainContainer.innerHTML = "";
	//display add episode button and hide add character button
	document.querySelector(".start-quiz-button").style.display = "none";
	document.querySelector(".add-character-button").style.display = "none";
	document.querySelector(".add-episode-button").style.display = "block";

	// Create a new episodes container
	const episodesContainer = document.createElement("div");
	episodesContainer.className = "episodes-container";
	episodesContainer.innerHTML = `
	<h2>Episodes</h2>
	`;
	mainContainer.appendChild(episodesContainer);

	let episodes = await performDBOperation("episodes", "readonly", "getAll");

	console.log(episodes);

	const container = document.getElementsByClassName("episodes-container")[0];

	for (const episode of episodes) {
		let episodeNumber = episode.number.split(" - ")[0];

		const episodeElement = document.createElement("div");
		episodeElement.className = "card";
		episodeElement.innerHTML = `
    	<h3>${episode.title}</h3>
    	<p>Season: ${episode.season} -- Episode: ${episodeNumber}</p>
	`;

		episodeElement.addEventListener("click", () => printEpisode(episode.id));

		container.appendChild(episodeElement);
	}
}

// Function to print single episode
async function printEpisode(id) {
	let episode = await performDBOperation("episodes", "readonly", "get", id);
	let episodeNumber = episode.number.split(" - ")[0];

	let characterCard = document.querySelector("#modal .modal-content-card");
	characterCard.innerHTML = `
	<h3>${episode.title}</h3>
	<h4>Season: ${episode.season} Episode: ${episodeNumber} Date: ${episode.originalAirDate}</h4>
	<p>Description:</p>
	<p>${episode.desc}</p>
	<p>Writers: ${episode.writers}</p>
	`;

	let editDeleteButtons = document.querySelectorAll(".edit-delete");
	editDeleteButtons.forEach((button) => (button.style.display = "inline"));
	let modal = document.getElementById("modal");
	modal.style.display = "block";

	if (deleteFunction) {
		deleteButton.removeEventListener("click", deleteFunction);
	}

	deleteFunction = () => deleteEpisode(id);
	deleteButton.addEventListener("click", deleteFunction);

	if (editFunction) {
		editButton.removeEventListener("click", editFunction);
	}

	editFunction = () => editEpisodeForm(id);
	editButton.addEventListener("click", editFunction);
}

// Function to print episode form
async function addEpisodeForm() {
	const form = document.createElement("form");
	form.id = "addEpisodeForm";

	form.addEventListener("submit", async function (event) {
		event.preventDefault();

		const title = document.getElementById("titleEpisode").value;
		const season = document.getElementById("season").value;
		const episode = document.getElementById("episode").value;

		const newEpisode = {
			number: episode,
			title: title,
			writers: "",
			originalAirDate: "",
			desc: "",
			id: await getNextEpisodeId(),
			season: season,
		};

		try {
			// Add episode to database
			await addEpisode(newEpisode);
			console.log("Episode added successfully IN AddEpisodeForm!");
			form.reset();
			await printEpisodes(); // Update the character list after adding
		} catch (error) {
			console.error("Error adding character:", error);
		}
	});

	// Populate modal with add episode form
	let modalFormCard = document.querySelector("#modal .modal-content-card");
	modalFormCard.innerHTML = "";
	modalFormCard.appendChild(form);

	form.innerHTML = `
	<form class="add-episode-form">
		<div class="label-input-form">
			<label for="titleEpisode">Title:</label>
			<input type="text" id="titleEpisode" name="title" placeholder="Title" required>
		</div>
		<div class="label-input-form">
			<label for="season">Season:</label>
			<input type="text" id="season" name="season" placeholder="Season">
		</div>
		<div class="label-input-form">
			<label for="episode">Episode:</label>
			<input type="text" id="episode" name="episode" placeholder="Episode">
		</div>
		<input class="submitButton" type="submit" value="Submit">
	</form>
	`;
}

// Function to display edit episode form
async function editEpisodeForm(id) {
	let episode = await performDBOperation("episodes", "readonly", "get", id);
	let title = episode.title;
	let season = episode.season;
	let episodeNumber = episode.number;

	const form = document.createElement("form");
	form.id = "editEpisodeForm";

	form.addEventListener("submit", async function (event) {
		event.preventDefault();

		title = document.getElementById("titleEpisode").value;
		season = document.getElementById("season").value;
		episodeNumber = document.getElementById("episode").value;

		const newEpisode = {
			number: episodeNumber,
			title: title,
			season: season,
		};

		try {
			// Update episode in database
			await updateEpisode(id, newEpisode);
			console.log("Episode updated successfully!");
			await printEpisode(id);
			await printEpisodes();
		} catch (error) {
			console.error("Error updating episode:", error);
		}
	});

	let modalFormCard = document.querySelector("#modal .modal-content-card");
	modalFormCard.innerHTML = "";
	modalFormCard.appendChild(form);

	form.innerHTML = `
	<form class="edit-episode-form">
		<div class="label-input-form">
			<label for="titleEpisode">Title:</label>
			<input type="text" id="titleEpisode" name="title" value="${title}" required>
		</div>
		<div class="label-input-form">
			<label for="season">Season:</label>
			<input type="text" id="season" name="season" value="${season}" required>
		</div>
		<div class="label-input-form">
			<label for="episode">Episode:</label>
			<input type="text" id="episode" name="episode" value="${episodeNumber}" required>
		</div>
		<!-- Include other input fields you want to edit -->
		<input class="submitButton" type="submit" value="Submit">
	</form>
	`;
}

// Function to load database and print characters on window load (START)
window.onload = async function () {
	await loadDatabase();
	await printCharacters();
};

//--------------------Questions-------------------//

// Function to print all questions
async function getQuestions() {
	mainContainer.innerHTML = "";

	const questionsContainer = document.createElement("div");
	questionsContainer.className = "questions-container";
	questionsContainer.innerHTML = "<h2>Questions</h2>";

	mainContainer.appendChild(questionsContainer);

	let questions = await performDBOperation("questions", "readonly", "getAll");

	console.log(questions);

	for (const question of questions) {
		const container = document.getElementsByClassName("questions-container")[0];

		const questionsElement = document.createElement("div");
		questionsElement.className = "card";
		questionsElement.innerHTML = `
    	<p>Question: ${question.question}</p>
  `;
		container.appendChild(questionsElement);
	}
}
