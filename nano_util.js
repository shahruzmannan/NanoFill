async function runPrompt(prompt, params) {
	try {
		const session = await chrome.aiOriginTrial.languageModel.create(params);
		return session.prompt(prompt);
	} catch (e) {
		console.log("Prompt failed");
		console.error(e);
		console.log("Prompt:", prompt);
		throw e;
	}
}

function getFieldsFromProfile(profile) {
	let out = [];
	Object.entries(profile.profileData).map(([k, v]) => out.push(k));
	return out.join(", ");
}

const sysPromptTemplate =
	'You are part of an autofill application. End every response with "...there you go". You receive html that includes an input field and respond with the type of information that it would be correct to autofill that field with as well as your confidence that you are correct. Valid types of information are %valid types%. Only ever respond with a valid information type. For example if you received <input id=username required> you might respond with "username:96%...there you go". If the input is not formatted as html, or you have no good guesses respond with "unidentifiable".';
let sysPrompt;
let params = {
	systemPrompt: sysPrompt,
	temperature: 0.1,
	topK: 2,
};

// Listen for requests from the main script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === "QUERY") {
		console.log("Message received from content script:", message);
		const profile = message.profile;
		console.log("profile: ", profile);
		const fields = getFieldsFromProfile(profile);
		if (fields) {
			sysPrompt = sysPromptTemplate.replace("%valid types%", fields);
			params.systemPrompt = sysPrompt;
			console.log("SysPrompt:", sysPrompt);
			try {
				runPrompt(message.message, params)
					.then((result) => {
						console.log(result);
						sendResponse({reply: result});
					})
					.catch((error) => {
						console.log(error);
						sendResponse({reply: "error: " + error});
					});
			} catch (error) {
				console.log(error);
				sendResponse({reply: "error: " + error});
			}
		} else {
			console.log("Profile was empty, returned nothing.");
			sendResponse({});
		}
	} else if (message.action === "openSettingsPage") {
		chrome.tabs.create({ url: chrome.runtime.getURL("settings.html") });
	}
	return true; // Keep the messaging channel open for asynchronous sendResponse
});

chrome.runtime.onConnect.addListener(function (port) {
	if (port.name === "popup") {
		popupPort = port;

		port.onMessage.addListener(function (msg) {
			if (msg.action === "forward") {
				// Handle messages from popup script
				chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
					if (tabs.length > 0) {
						chrome.tabs.sendMessage(tabs[0].id, msg.data);
					}
				});
			}
		});

		port.onDisconnect.addListener(function () {
			popupPort = null;
		});
	}
});
