// Detect autofill input fields (same logic as before)
const detectAutofillFields = () => {
	const inputs = document.querySelectorAll("input, select, textarea");
	const autofillFields = [];

	const fieldPatterns = {
		name: /name/i,
		email: /email/i,
		address: /address/i,
		phone: /phone|tel/i,
		city: /city/i,
		state: /state/i,
		zip: /zip|postal/i,
	};

	inputs.forEach((input) => {
		const name = input.getAttribute("name");
		const id = input.getAttribute("id");
		const placeholder = input.getAttribute("placeholder");
		const type = input.getAttribute("type");

		// Check if the input field matches the typical patterns for personal data
		if (
			Object.values(fieldPatterns).some((pattern) =>
				pattern.test(name || id || placeholder || type)
			)
		) {
			autofillFields.push(input);
		}

		// Optionally, check for placeholder attribute text to hint at the data type
		if (
			placeholder &&
			/name|email|address|phone/.test(placeholder.toLowerCase())
		) {
			autofillFields.push(input);
		}

		// Check for specific input types that usually correspond to personal data
		if (type === "email" || type === "tel" || type === "text") {
			autofillFields.push(input);
		}
	});

	return autofillFields;
};

// Function to create a popup-action
const createPopupAction = (input) => {
	var profile = {};
	chrome.storage.sync.get(["profile"], function (data) {
		profile = data.profile;
	});
	// Fetch profiles from Chrome Storage
	chrome.storage.sync.get(["profiles"], function (data) {
		const profiles = data.profiles || [];

		// Create a popup-action div
		const popupAction = document.createElement("div");
		popupAction.classList.add("popup-action");

		popupAction.innerHTML = `
      <div class="profile-item">
        <div class="profile-icon">
          ${profile.name[0].toUpperCase()}
        </div>
        <div class="profile-info-container"></div>
        <button type="button" class="apply-button">
          Apply
        </button>
      </div>
      <div class="linebreak"></div>
      <div class="option-buttons">
        <button id="settings-button" class="icon-button">
					<svg
						fill="#65558f"
						height="25px"
						width="25px"
						version="1.1"
						id="Layer_1"
						xmlns="http://www.w3.org/2000/svg"
						xmlns:xlink="http://www.w3.org/1999/xlink"
						viewBox="0 0 512 512"
						xml:space="preserve"
						stroke="#65558f"
					>
						<g id="SVGRepo_bgCarrier" stroke-width="0"></g>
						<g
							id="SVGRepo_tracerCarrier"
							stroke-linecap="round"
							stroke-linejoin="round"
						></g>
						<g id="SVGRepo_iconCarrier">
							<g>
								<g>
									<path
										d="M495.304,205.912H450.05c-4.649-17.919-11.927-35.355-21.481-51.456l33.795-33.795c6.52-6.52,6.52-17.091,0-23.611 l-47.416-47.416c-6.518-6.519-17.09-6.52-23.611,0l-33.795,33.795c-16.102-9.553-33.538-16.831-51.456-21.48V16.696 c0-9.22-7.475-16.696-16.696-16.696h-66.783c-9.22,0-16.696,7.475-16.696,16.696V61.95c-17.919,4.648-35.355,11.926-51.456,21.48 l-33.795-33.794c-6.519-6.52-17.091-6.52-23.611,0L49.635,97.051c-6.52,6.519-6.52,17.091,0,23.611l33.794,33.795 c-9.553,16.102-16.83,33.538-21.48,51.456H16.696C7.475,205.913,0,213.388,0,222.609v66.783c0,9.22,7.475,16.696,16.696,16.696 H61.95c4.648,17.918,11.926,35.354,21.48,51.457l-33.794,33.795c-6.52,6.52-6.52,17.091,0,23.611l47.416,47.416 c3.131,3.131,7.377,4.891,11.805,4.891c4.428,0,8.675-1.76,11.805-4.891l33.794-33.795c16.104,9.553,33.54,16.831,51.457,21.479 v45.254c0,9.22,7.475,16.696,16.696,16.696h66.783c9.22,0,16.696-7.475,16.696-16.696V450.05 c17.919-4.649,35.354-11.926,51.456-21.479l33.794,33.795c6.515,6.516,17.092,6.519,23.611,0l47.417-47.417 c6.516-6.515,6.52-17.092,0-23.611l-33.795-33.795c9.553-16.102,16.831-33.538,21.481-51.457h45.255 c9.22,0,16.696-7.475,16.696-16.696v-66.783C512,213.387,504.525,205.912,495.304,205.912z M478.609,272.696h-41.962 c-8.068,0-14.983,5.77-16.426,13.708c-4.105,22.578-13.331,44.683-26.677,63.928c-4.602,6.635-3.797,15.612,1.913,21.321 l31.492,31.491l-23.806,23.805l-31.491-31.491c-5.709-5.709-14.685-6.516-21.32-1.913c-19.245,13.348-41.351,22.573-63.928,26.677 c-7.937,1.443-13.708,8.357-13.708,16.425v41.962h-33.391v-41.962c0-8.07-5.771-14.983-13.708-16.426 c-22.576-4.105-44.683-13.33-63.93-26.677c-6.636-4.604-15.61-3.795-21.319,1.913l-31.491,31.492l-23.805-23.805l31.491-31.491 c5.71-5.709,6.516-14.685,1.914-21.32c-13.349-19.247-22.573-41.353-26.677-63.928c-1.443-7.938-8.358-13.709-16.426-13.709 H33.391v-33.391h41.962c8.068,0,14.983-5.77,16.426-13.708c4.105-22.577,13.331-44.683,26.677-63.928 c4.601-6.635,3.795-15.61-1.914-21.32l-31.491-31.492l23.805-23.805l31.492,31.491c5.709,5.71,14.685,6.516,21.32,1.913 c19.243-13.348,41.348-22.573,63.928-26.676c7.937-1.443,13.708-8.357,13.708-16.426V33.391h33.391v41.962 c0,8.07,5.771,14.983,13.708,16.426c22.577,4.105,44.683,13.329,63.928,26.676c6.635,4.601,15.612,3.795,21.32-1.913 l31.492-31.491l23.805,23.805l-31.492,31.492c-5.71,5.709-6.516,14.685-1.913,21.32c13.346,19.245,22.571,41.35,26.677,63.928 c1.444,7.938,8.358,13.708,16.426,13.708h41.962V272.696z"
									></path>
								</g>
							</g>
							<g>
								<g>
									<path
										d="M256.024,155.934c-55.236,0-100.174,44.938-100.174,100.174s44.938,100.174,100.174,100.174 s100.174-44.938,100.174-100.174S311.26,155.934,256.024,155.934z M256.024,322.891c-36.824,0-66.783-29.959-66.783-66.783 s29.959-66.783,66.783-66.783c36.824,0,66.783,29.959,66.783,66.783S292.848,322.891,256.024,322.891z"
									></path>
								</g>
							</g>
						</g>
					</svg>
				</button>
        <div class="dropdown">
          <button class="dropdown-btn">
            <svg width="25px" height="25px" 
              viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" 
              fill="#FFF">
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g id="SVGRepo_tracerCarrier" stroke-linecap="round" 
              stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> 
              <rect x="0" fill="none" width="24" height="24"></rect> 
              <g> <path d="M4 19h16v-2H4v2zm10-6H4v2h10v-2zM4 
              9v2h16V9H4zm10-4H4v2h10V5z"></path> </g> </g>
            </svg>
          </button>
          <div class="dropdown-content"></div>
        </div>
      </div>
    `;

		// Append the popup-action to the body
		document.body.appendChild(popupAction);

		const currentProfileInfo = popupAction.querySelector(
			".profile-info-container"
		);

		const profileNameText = profile.name.substring(0, 15);
		const profileNameExtension = profile.name.length >= 15 ? " ..." : "";
		const profileDescText = profile.description?.substring(0, 53);
		const profileDescExtension =
			profile.description?.length >= 53 ? " ..." : "";

		const details =
			(!profile.description || profile.description?.length < 53) &&
			profile.name < 15
				? `
			  <span class="profile-name"> ${profile.name}</span>
			  <span class="profile-description"> ${profile.description || ""}</span>
			`
				: `
				<span class="profile-name"> ${profileNameText + profileNameExtension}</span>
				<span class="profile-description"> ${
					profileDescText + profileDescExtension
				}</span>`;
		currentProfileInfo.innerHTML = details;

		const applyButtonElement = popupAction.querySelector(".apply-button");
		applyButtonElement.addEventListener("click", function (event) {
			chrome.storage.sync.get(["profile"], function (data) {
				profile = data.profile;
				console.log(`${profile.name} applied`);
				autofill(profile);
			});
		});

		const dropdownContentElement =
			document.getElementsByClassName("dropdown-content")[0];

		profiles.forEach((cuProfile) => {
			var dropdownOption = document.createElement("button");
			dropdownOption.id = cuProfile.id;
			dropdownOption.className = "profile-btn";
			dropdownOption.textContent = cuProfile.name;
			dropdownOption.addEventListener("click", function (event) {
				chrome.storage.sync.set({ profile: cuProfile }, function () {
					console.log(`${cuProfile.name} selected`);
				});
				popupAction.querySelector(".profile-icon").textContent =
					cuProfile.name[0].toUpperCase();

				const profileNameText = cuProfile.name.substring(0, 15);
				const profileNameExtension = cuProfile.name.length >= 15 ? " ..." : "";
				const profileDescText = cuProfile.description?.substring(0, 53);
				const profileDescExtension =
					cuProfile.description?.length >= 53 ? " ..." : "";

				popupAction.querySelector(".profile-name").textContent =
					profileNameText + profileNameExtension;
				var descriptionText =
					!cuProfile.description || cuProfile.description?.length < 53
						? cuProfile.description || ""
						: profileDescText + profileDescExtension;
				popupAction.querySelector(".profile-description").textContent =
					descriptionText;
			});
			dropdownContentElement.appendChild(dropdownOption);
		});

		const settingsButton = document.getElementById("settings-button");
		settingsButton.addEventListener("click", () => {
			chrome.runtime.sendMessage({ action: "openSettingsPage" });
		});

		// Position the popup-action near the input field
		const inputRect = input.getBoundingClientRect();
		const popupWidth = popupAction.offsetWidth;
		// const popupHeight = popupAction.offsetHeight;

		popupAction.style.position = "absolute";
		popupAction.style.top = `${
			inputRect.top + window.scrollY + inputRect.height
		}px`; // TODO: fix positioning so that our popup moves as the site scrolls (it should be a child of the input field)
		popupAction.style.left = `${
			inputRect.left + window.scrollX + inputRect.width / 2 - popupWidth / 2
		}px`; // Centered

		// // Handle profile selection
		// const profileSelect = popupAction.querySelector(".popup-action-select");
		// profileSelect.addEventListener("change", function () {
		// 	// TODO: I (xvade) don't think we should have the profile switcher in the popup, and regardless we shouldn't fill anything upon switching profiles
		// 	const selectedProfileId = this.value;
		// 	const selectedProfile = profiles.find(
		// 		(profile) => profile.id === selectedProfileId
		// 	);
		// 	if (selectedProfile) {
		// 		autofillInputFields(selectedProfile);
		// 	}
		// });
	});
};

// Function to remove the popup-action
const removePopupAction = () => {
	const existingPopupAction = document.querySelector(".popup-action");
	if (existingPopupAction) {
		existingPopupAction.remove();
	}
};

// Asks the background (nano_util.js) for the AI's opinion on the input
async function getAIOpinion(input, profile) {
	return new Promise((resolve) => {
		chrome.runtime.sendMessage(
			{ type: "QUERY", message: input.outerHTML, profile: profile },
			(response) => {
				resolve(response.reply);
			}
		);
	});
}

// Add event listeners for detecting clicks on autofill fields and get the AI's opinion on them
const autofillInputs = detectAutofillFields();
let autoFillVals = {};
function initAutoFillVals() {
	chrome.storage.sync.get("profiles").then((profiles) => {
		for (let profile of profiles.profiles) {
			autoFillVals[profile.id] = [];
			for (let field of autofillInputs.keys()) {
				getAIOpinion(autofillInputs[field], profile).then((aiOpinion) => {
					if (aiOpinion) {
						autoFillVals[profile.id][field] =
							profile.profileData[aiOpinion.split(":", 1)];
					}
				});
			}
		}
	});
}

function autofill(profile) {
	for (let key of autofillInputs.keys()) {
		// console.log(autoFillVals);
		// console.log(profile);
		// console.log(autoFillVals[profile.id]);
		// console.log(autoFillVals[profile.id][key]);
		if (autofillInputs[key].value === "" && autoFillVals[profile.id][key]) {
			autofillInputs[key].value = autoFillVals[profile.id][key];
		}
	}
}

autofillInputs.forEach((input) => {
	input.addEventListener("click", () => {
		// Remove any existing popup-action before showing a new one
		removePopupAction();

		// Create and show the popup-action for this input field
		createPopupAction(input);
	});
});

initAutoFillVals();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	console.log("Message received in content script:", message);
	if (message.action === "autofill") {
		console.log("recieved autofill message");
		autofill(message.profile);
		sendResponse({ reply: "successfully autofilled" });
	}
	return true;
});

// Optional: You can handle popup-action button clicks here
document.body.addEventListener("click", (event) => {
	//TODO: this should be on focus, not on click (accessibility)
	if (event.target.classList.contains("popup-action-button")) {
		const action = event.target.id;
		if (action === "action-clear") {
			const input = document.querySelector("input:focus");
			if (input) {
				input.value = "";
			}
		}
	}

	// Close the popup-action if clicking outside the popup-action or input field
	if (
		!event.target.closest(".popup-action") &&
		!event.target.closest("input")
	) {
		// TODO: you should be able to click anywhere on the page, not just on valid html
		removePopupAction();
	}
});
