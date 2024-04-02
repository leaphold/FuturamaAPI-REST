// API Urls
const BASE_URL = "https://da-demo.github.io/api/futurama/";

const API_URL = {
	characters: `${BASE_URL}characters`,
	episodes: `${BASE_URL}episodes`,
	questions: `${BASE_URL}questions`,
};

// Setup IndexedDB
let openRequest = indexedDB.open("futurama", 1);
let db;

openRequest.onupgradeneeded = function (e) {
	let db = e.target.result;
	db.createObjectStore("characters", { keyPath: "id" });
	db.createObjectStore("episodes", { keyPath: "id" });
	db.createObjectStore("questions", { keyPath: "id" });
};

// Checks if the IndexedDB is empty, if its empty it gets all the data from the API
openRequest.onsuccess = async function (e) {
	db = e.target.result;
};

// Load database
async function loadDatabase() {
	return new Promise(async (resolve, reject) => {
		const characters = await performDBOperation("characters", "readonly", "getAll");
		const episodes = await performDBOperation("episodes", "readonly", "getAll");
		const questions = await performDBOperation("questions", "readonly", "getAll");

		if (characters.length === 0) {
			await API.getCharacters();
		}

		if (episodes.length === 0) {
			await API.getEpisodes();
		}

		if (questions.length === 0) {
			await API.getQuestions();
		}
		resolve();
	});
}

// API Calls
const API = {
	// Getting all characters from the API and saves to a local IndexedDB
	async getCharacters() {
		const response = await fetch(API_URL.characters);

		if (!response.ok) {
			throw new Error(`Could not get characters. \nStatus: ${response.status}`);
		}

		const data = await response.json();

		// Save data to InexedDB
		let transaction = db.transaction("characters", "readwrite");
		let store = transaction.objectStore("characters");
		for (let character of data) {
			store.put(character);
		}

		return data;
	},

	// Getting all episodes from the API and saves to a local IndexedDB
	async getEpisodes() {
		const response = await fetch(API_URL.episodes);

		if (!response.ok) {
			throw new Error(`Could not get episodes. \nStatus: ${response.status}`);
		}

		let data = await response.json();

		// Add "false" season to episodes
		data = addSeasonToEpisodes(data);

		// Save data to InexedDB
		let transaction = db.transaction("episodes", "readwrite");
		let store = transaction.objectStore("episodes");
		for (let episode of data) {
			store.put(episode);
		}
		return data;
	},

	async getQuestions() {
		const response = await fetch(API_URL.questions);

		if (!response.ok) {
			throw new Error(`Could not get questions. \nStatus: ${response.status}`);
		}
		const data = await response.json();

		// Save data to InexedDB
		let transaction = db.transaction("questions", "readwrite");
		let store = transaction.objectStore("questions");

		for (let question of data) {
			store.put(question);
		}
		return data;
	},
};

// Function to add a false season to episodes (used in getEpisodes())
function addSeasonToEpisodes(episodes) {
	for (const episode of episodes) {
		const firstNumber = Number(episode.number.split(" - ")[0]);
		const season = Math.ceil(firstNumber / 10);
		episode.season = season;
	}
	return episodes;
}
