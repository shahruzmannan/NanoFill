function on() {
	document.getElementById("info-overlay").style.display = "block";
}

function off() {
	document.getElementById("info-overlay").style.display = "none";
}

const port = chrome.runtime.connect({ name: "popup" });

document.addEventListener("DOMContentLoaded", () => {
	const profileList = document.getElementById("profile-list");

	// Fetch profiles from Chrome Storage
	chrome.storage.sync.get(["profiles"], function (data) {
		const profiles = data.profiles || [];

		if (profiles.length > 0) {
			profiles.forEach((profile) => {
				const listItem = document.createElement("div");
				listItem.className = "profile-item";

				// Header Row: Profile Name, Apply Button, and Delete Button
				const profileIcon = document.createElement("div");
				profileIcon.className = "profile-icon";
				profileIcon.textContent = `${profile.name[0].toUpperCase()}`;
				listItem.appendChild(profileIcon);

				const header = document.createElement("div");
				header.className = "profile-info-container";

				// Extract name and description with fallback handling
				const profileNameText = profile.name.substring(0, 15);
				const profileNameExtension = profile.name.length >= 15 ? " ..." : "";
				const profileDescText = profile.description?.substring(0, 53) ?? "";
				const profileDescExtension =
					profile.description?.length >= 53 ? " ..." : "";

				// Check conditions and create details
				const details =
					(!profile.description || profile.description?.length < 53) &&
					profile.name.length < 20
						? `
      <span class="profile-name"> ${profile.name}</span>
      <span class="profile-description"> ${profile.description || ""}</span>
    `
						: `
      <span class="profile-name"> ${
				profileNameText + profileNameExtension
			}</span>
      <span class="profile-description"> ${
				profileDescText + profileDescExtension
			}</span>
    `;

				header.innerHTML = details;
				listItem.appendChild(header);

				const applyButton = document.createElement("button");
				applyButton.textContent = "Apply";
				applyButton.type = "button";

				applyButton.addEventListener("click", function (event) {
					chrome.storage.sync.set({ profile: profile }, function () {
						console.log(`Profile ${profile.name} selected`);
					});
					port.postMessage({
						action: "forward",
						data: { action: "autofill", profile: profile },
					});
					console.log("asked for autofill");

					// Toast
					var x = document.getElementById("snackbar");
					x.className = "show";
					setTimeout(function () {
						x.className = x.className.replace("show", "");
					}, 3000);
				});

				applyButton.className = "apply-button";

				listItem.appendChild(applyButton);

				profileList.appendChild(listItem);
			});
		} else {
			const noProfileContainer = document.createElement("div");
			noProfileContainer.id = "no-profile-container";
			const details = `
				<svg width="128" height="128" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<g clip-path="url(#clip0_232_599)">
					<path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM13 5H19V11H16L17 7L13 8V5ZM5 5H11V8L7 7L8 11H5V5ZM11 19H5V13H8L7 17L11 16V19ZM19 19H13V16L17 17L16 13H19V19ZM14.63 14.63L12 13.72L9.37 14.63L10.28 12L9.37 9.37L12 10.28L14.63 9.37L13.72 12L14.63 14.63Z" fill="black"/>
					</g>
					<defs>
					<clipPath id="clip0_232_599">
					<rect width="24" height="24" fill="white"/>
					</clipPath>
					</defs>
				</svg>
				<p class="create-profile-text">Click here to make your first profile!</p>
				<button id="create-btn" class="create-btn">
					<svg fill="#FFFFFF" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="20px" height="20px" viewBox="0 0 45.402 45.402" xml:space="preserve" stroke="#FFFFFF"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M41.267,18.557H26.832V4.134C26.832,1.851,24.99,0,22.707,0c-2.283,0-4.124,1.851-4.124,4.135v14.432H4.141 c-2.283,0-4.139,1.851-4.138,4.135c-0.001,1.141,0.46,2.187,1.207,2.934c0.748,0.749,1.78,1.222,2.92,1.222h14.453V41.27 c0,1.142,0.453,2.176,1.201,2.922c0.748,0.748,1.777,1.211,2.919,1.211c2.282,0,4.129-1.851,4.129-4.133V26.857h14.435 c2.283,0,4.134-1.867,4.133-4.15C45.399,20.425,43.548,18.557,41.267,18.557z"></path> </g> </g></svg>
					<span>Create Profile</span>
				</button>				
			`;

			noProfileContainer.innerHTML = details;
			profileList.appendChild(noProfileContainer);

			document.querySelector("#create-btn").addEventListener("click", () => {
				chrome.tabs.create({ url: chrome.runtime.getURL("settings.html") });
			});
		}
	});

	const settingsButton = document.getElementById("settings-button");
	settingsButton.addEventListener("click", () => {
		chrome.tabs.create({ url: chrome.runtime.getURL("settings.html") });
	});

	const infoButton = document.getElementById("info-button");
	infoButton.addEventListener("click", () => {
		document.querySelector(".popup-content").style.display = "none";
		document.querySelector("body").style.minHeight = "445px";

		on();
		// Show additional info or help dialog
	});

	const closeOverlayButton = document.getElementById("close-overlay-button");
	closeOverlayButton.addEventListener("click", () => {
		document.querySelector(".popup-content").style.display = "block";
		document.querySelector("body").style.minHeight = "400px";
		off();
	});
});
