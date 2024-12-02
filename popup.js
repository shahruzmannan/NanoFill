function on() {
	document.getElementById("info-overlay").style.display = "block";
}

function off() {
	document.getElementById("info-overlay").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
	const profileList = document.getElementById("profile-list");

	// Fetch profiles from Chrome Storage
	chrome.storage.sync.get(["profiles"], function (data) {
		const profiles = data.profiles || [];

		profiles.forEach((profile) => {
			const listItem = document.createElement("div");
			listItem.className = "profile-item";

			// Header Row: Profile Name, Apply Button, and Delete Button
			const profileIcon = document.createElement("div");
			profileIcon.className = "profile-icon";
			profileIcon.textContent = `${profile.name[0]}`;
			listItem.appendChild(profileIcon);

			const header = document.createElement("div");
			header.className = "profile-info-container";

			const details =
				!profile.description || profile.description?.length < 42
					? `
			  <span class="profile-name"> ${profile.name}</span>
			  <span class="profile-description"> ${profile.description || ""}</span>
			`
					: `
				<span class="profile-name"> ${profile.name}</span>
				<span class="profile-description"> ${
					profile.description.substring(0, 42) + " ..."
				}</span>`;

			header.innerHTML = details;
			listItem.appendChild(header);

			const applyButton = document.createElement("button");
			applyButton.textContent = "Apply";
			applyButton.type = "button";

			applyButton.addEventListener("click", function (event) {
				chrome.storage.sync.set({ profile: profile }, function () {
					console.log(`Profile ${profile.name} selected`);
				});
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
