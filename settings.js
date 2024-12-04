var profiles = []; // Define profiles in the global scope
function addProfileTab(profile, index) {
	var tab = document.createElement("button");
	tab.className = "profile-tab";
	tab.setAttribute("data-profile", profile.id);
	tab.id = `profile-tab_${profile.id}`;

	var tabText = document.createElement("span");
	tabText.textContent = profile.name;
	tabText.className = "profile-tab-text";
	tab.appendChild(tabText);

	var tabInput = document.createElement("input");
	tabInput.type = "text";
	tabInput.value = profile.name;
	tabInput.className = "profile-tab-input";
	tabInput.style.display = "none";
	tab.appendChild(tabInput);

	tab.addEventListener("click", function (event) {
		openProfile(event, profile);
	});

	tab.addEventListener("dblclick", function (event) {
		event.stopPropagation(); // Prevent the click event from firing
		tabText.style.display = "none";
		tabInput.style.display = "inline";
		tabInput.focus();
	});

	tabInput.addEventListener("blur", function () {
		profile.name = tabInput.value;
		chrome.storage.sync.set({ profiles: profiles }, function () {
			console.log(`Profile name updated to ${profile.name}`);
			tabText.textContent = profile.name;
			tabText.style.display = "inline";
			tabInput.style.display = "none";
		});
	});

	tabInput.addEventListener("keypress", function (event) {
		if (event.key === "Enter") {
			tabInput.blur();
		}
	});

	profileTabs.appendChild(tab);
}

function openTab(evt, tabName) {
	var i, tabcontent, tablinks;
	tabcontent = document.getElementsByClassName("tabcontent");
	for (i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = "none";
	}
	tablinks = document.getElementsByClassName("tablinks");
	for (i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(" active", "");
	}
	document.getElementById(tabName).style.display = "block";
	if (evt !== "") {
		evt.currentTarget.className += " active";
	}
}

function openProfile(evt, profile) {
	console.log(profile);
	var i, profileContent, profileTabs;
	profileContent = document.getElementsByClassName("profile-content");
	for (i = 0; i < profileContent.length; i++) {
		profileContent[i].style.display = "none";
	}
	profileTabs = document.getElementsByClassName("profile-tab");
	for (i = 0; i < profileTabs.length; i++) {
		profileTabs[i].className = profileTabs[i].className.replace(" active", "");
	}
	document.getElementById(profile.id).style.display = "block";

	// Open profile content
	document.getElementsByClassName(
		"profile-content-container"
	)[0].style.display = "block";

	document.getElementsByClassName("landing-content")[0].style.display = "none";

	if (evt !== "") {
		evt.currentTarget.className += " active";
	}

	openTab("", `PersonalInfo_${profile.id}`);
	document.querySelector(
		`.tablinks[data-tab="PersonalInfo_${profile.id}"]`
	).className += " active";
}

function closeProfile() {
	var i, profileContent, profileTabs;
	profileContent = document.getElementsByClassName("profile-content");
	for (i = 0; i < profileContent.length; i++) {
		profileContent[i].style.display = "none";
	}
	profileTabs = document.getElementsByClassName("profile-tab");
	for (i = 0; i < profileTabs.length; i++) {
		profileTabs[i].className = profileTabs[i].className.replace(" active", "");
	}

	document.getElementsByClassName(
		"profile-content-container"
	)[0].style.display = "none";
	document.getElementsByClassName("landing-content")[0].style.display = "flex";
}

function saveProfileData(profileId, profileType) {
	var profileIndex = profiles.findIndex((p) => p.id === profileId);
	var formElement = document.getElementById(`${profileType}Form_${profileId}`);
	if (!formElement) {
		console.error(
			`Form element with ID ${profileType}Form_${profileId} not found.`
		);
		return;
	}

	var formData = new FormData(formElement);

	formData.forEach((value, key) => {
		if (key !== "name" && key !== "description") {
			profiles[profileIndex].profileData[key] = value;
		} else {
			profiles[profileIndex][key] = value;
		}
	});

	if (profileType === "jobFillProfile") {
		var jobProfileNameValue = document.getElementById(
			`profileName_${profileId}`
		).value;
		var jobDescriptionValue = document.getElementById(
			`profileDescription_${profileId}`
		).value;

		document.getElementById(`profileHeadingName_${profileId}`).textContent =
			jobProfileNameValue;
		document.getElementById(
			`profileHeadingDescription_${profileId}`
		).textContent = jobDescriptionValue || "";

		document.querySelector(`#profile-tab_${profileId} span`).textContent =
			jobProfileNameValue;
	}
	chrome.storage.sync.set({ profiles: profiles }, function () {
		console.log(`${profileType} saved for profile ${profileId}`);
	});

	// Toast
	var x = document.getElementById("snackbar");
	x.className = "show";
	setTimeout(function () {
		x.className = x.className.replace("show", "");
	}, 3000);
}

function saveCustomFields(profileId) {
	console.log(`Saving custom fields for profile ${profileId}`);
	var profileIndex = profiles.findIndex((p) => p.id === profileId);
	var customFieldsContainer = document.getElementById(
		`customFieldsContainer_${profileId}`
	);
	if (!customFieldsContainer) {
		console.error(
			`Custom fields container with ID customFieldsContainer_${profileId} not found.`
		);
		return;
	}

	var newCustomFields = [];
	var fieldDivs = customFieldsContainer.children;

	// Loop through all field divs to collect updated custom fields
	for (var i = 0; i < fieldDivs.length; i++) {
		var fieldDiv = fieldDivs[i];
		var fieldName = fieldDiv
			.querySelector('input[name="customFieldName"]')
			.value.trim();
		var fieldValue = fieldDiv
			.querySelector('input[name="customFieldValue"]')
			.value.trim();

		if (fieldName) {
			newCustomFields.push({ name: fieldName, value: fieldValue });
		}
	}

	// Clear all existing custom fields and flat fields
	var currentProfile = profiles[profileIndex];
	currentProfile.customFields.forEach((field) => {
		if (field.name in currentProfile.profileData) {
			delete currentProfile.profileData[field.name];
		}
	});

	// Add new custom fields to the profile object
	newCustomFields.forEach((field) => {
		currentProfile.profileData[field.name] = field.value; // Flat field
	});

	// Update the customFields array
	currentProfile.customFields = newCustomFields;

	chrome.storage.sync.set({ profiles: profiles }, function () {
		console.log(`Custom fields saved for profile ${profileId}`);
	});

	// Toast
	var x = document.getElementById("snackbar");
	x.className = "show";
	setTimeout(function () {
		x.className = x.className.replace("show", "");
	}, 3000);
}

document.addEventListener("DOMContentLoaded", async function () {
	var profileTabs = document.getElementById("profileTabs");
	var profileContent = document.getElementById("profileContent");
	var addProfileButton = document.getElementById("addProfileButton");

	chrome.storage.sync.get(["profiles"], function (data) {
		profiles = data.profiles || [];
		profiles.forEach((profile, index) => {
			addProfileTab(profile, index);
			addProfileContent(profile, index);
		});
	});

	addProfileButton.addEventListener("click", function () {
		var newProfile = {
			id: "profile_" + Date.now(),
			name: "New Profile",
			profileData: {},
			// jobFillProfile: {},
			// educationProfile: {},
			// workExperienceProfile: {},
			// otherProfile: {},
			customFields: [],
		};
		addProfileTab(newProfile, profiles.length);
		addProfileContent(newProfile, profiles.length);
		profiles.push(newProfile);
		chrome.storage.sync.set({ profiles: profiles });

		openProfile("", newProfile);
		document.querySelector(
			`.profile-tab[data-profile="${newProfile.id}"]`
		).className += " active";
	});

	document.getElementById("create-btn").addEventListener("click", function () {
		var newProfile = {
			id: "profile_" + Date.now(),
			name: "New Profile",
			profileData: {},
			// jobFillProfile: {},
			// educationProfile: {},
			// workExperienceProfile: {},
			// otherProfile: {},
			customFields: [],
		};
		addProfileTab(newProfile, profiles.length);
		addProfileContent(newProfile, profiles.length);
		profiles.push(newProfile);
		chrome.storage.sync.set({ profiles: profiles });

		openProfile("", newProfile);
		document.querySelector(
			`.profile-tab[data-profile="${newProfile.id}"]`
		).className += " active";
	});

	function addProfileTab(profile, index) {
		var tab = document.createElement("button");
		tab.className = "profile-tab";
		tab.id = `profile-tab_${profile.id}`;
		// tab.textContent = profile.name;
		const content = `
      <svg width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#663b48" stroke="#663b48"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>profile_round [#663b48]</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-140.000000, -2159.000000)" fill="#663b48"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M100.562548,2016.99998 L87.4381713,2016.99998 C86.7317804,2016.99998 86.2101535,2016.30298 86.4765813,2015.66198 C87.7127655,2012.69798 90.6169306,2010.99998 93.9998492,2010.99998 C97.3837885,2010.99998 100.287954,2012.69798 101.524138,2015.66198 C101.790566,2016.30298 101.268939,2016.99998 100.562548,2016.99998 M89.9166645,2004.99998 C89.9166645,2002.79398 91.7489936,2000.99998 93.9998492,2000.99998 C96.2517256,2000.99998 98.0830339,2002.79398 98.0830339,2004.99998 C98.0830339,2007.20598 96.2517256,2008.99998 93.9998492,2008.99998 C91.7489936,2008.99998 89.9166645,2007.20598 89.9166645,2004.99998 M103.955674,2016.63598 C103.213556,2013.27698 100.892265,2010.79798 97.837022,2009.67298 C99.4560048,2008.39598 100.400241,2006.33098 100.053171,2004.06998 C99.6509769,2001.44698 97.4235996,1999.34798 94.7348224,1999.04198 C91.0232075,1998.61898 87.8750721,2001.44898 87.8750721,2004.99998 C87.8750721,2006.88998 88.7692896,2008.57398 90.1636971,2009.67298 C87.1074334,2010.79798 84.7871636,2013.27698 84.044024,2016.63598 C83.7745338,2017.85698 84.7789973,2018.99998 86.0539717,2018.99998 L101.945727,2018.99998 C103.221722,2018.99998 104.226185,2017.85698 103.955674,2016.63598" id="profile_round-[#663b48]"> </path> </g> </g> </g> </g></svg>
      <span class="profile-tab-name"> ${profile.name || ""}</span>
    `;
		tab.innerHTML = content;
		tab.setAttribute("data-profile", profile.id);
		tab.addEventListener("click", function (event) {
			openProfile(event, profile);
		});
		profileTabs.appendChild(tab);
	}

	function addProfileContent(profile, index) {
		var content = document.createElement("div");
		content.className = "profile-content";
		content.id = profile.id;
		content.innerHTML = `
	<div class="options-tab">
		<button id="back-btn_${profile.id}" class="back-btn">
			<svg
				width="30px"
				height="30px"
				viewBox="0 0 512 512"
				version="1.1"
				xml:space="preserve"
				xmlns="http://www.w3.org/2000/svg"
				xmlns:xlink="http://www.w3.org/1999/xlink"
				fill="#000000"
			>
				<g id="SVGRepo_bgCarrier" stroke-width="0"></g>
				<g
					id="SVGRepo_tracerCarrier"
					stroke-linecap="round"
					stroke-linejoin="round"
				></g>
				<g id="SVGRepo_iconCarrier">
					<style type="text/css">
						.st0 {
							fill: #333333;
						}
					</style>
					<g id="Layer_1"></g>
					<g id="Layer_2">
						<g>
							<path
								class="st0"
								d="M217,129.88c-6.25-6.25-16.38-6.25-22.63,0L79.61,244.64c-0.39,0.39-0.76,0.8-1.11,1.23 c-0.11,0.13-0.2,0.27-0.31,0.41c-0.21,0.28-0.42,0.55-0.62,0.84c-0.14,0.21-0.26,0.43-0.39,0.64c-0.14,0.23-0.28,0.46-0.41,0.7 c-0.13,0.24-0.24,0.48-0.35,0.73c-0.11,0.23-0.22,0.45-0.32,0.68c-0.11,0.26-0.19,0.52-0.28,0.78c-0.08,0.23-0.17,0.46-0.24,0.69 c-0.09,0.29-0.15,0.58-0.22,0.86c-0.05,0.22-0.11,0.43-0.16,0.65c-0.08,0.38-0.13,0.76-0.17,1.14c-0.02,0.14-0.04,0.27-0.06,0.41 c-0.11,1.07-0.11,2.15,0,3.22c0.01,0.06,0.02,0.12,0.03,0.18c0.05,0.46,0.12,0.92,0.21,1.37c0.03,0.13,0.07,0.26,0.1,0.39 c0.09,0.38,0.18,0.76,0.29,1.13c0.04,0.13,0.09,0.26,0.14,0.4c0.12,0.36,0.25,0.73,0.4,1.09c0.05,0.11,0.1,0.21,0.15,0.32 c0.17,0.37,0.34,0.74,0.53,1.1c0.04,0.07,0.09,0.14,0.13,0.21c0.21,0.38,0.44,0.76,0.68,1.13c0.02,0.03,0.04,0.06,0.06,0.09 c0.55,0.81,1.18,1.58,1.89,2.29l114.81,114.81c3.12,3.12,7.22,4.69,11.31,4.69s8.19-1.56,11.31-4.69c6.25-6.25,6.25-16.38,0-22.63 l-87.5-87.5h291.62c8.84,0,16-7.16,16-16s-7.16-16-16-16H129.51L217,152.5C223.25,146.26,223.25,136.13,217,129.88z"
							></path>
						</g>
					</g>
				</g>
			</svg>
		</button>
		<div class="dropdown">
			<button class="dropdown-btn">⋮</button>
			<div class="dropdown-content">
				<button id="delete-btn_${profile.id}" class="delete-btn">Delete</button>
			</div>
		</div>
	</div>
    <div id="profileHeadingName_${profile.id}" class="profile-name-heading">${
			profile.name
		}</div>
    <div id="profileHeadingDescription_${
			profile.id
		}" class="profile-description-text">${profile.description || ""}</div>
    <div class="tab">
      <button class="tablinks" data-tab="PersonalInfo_${
				profile.id
			}">Personal Info</button>
      <button class="tablinks" data-tab="Education_${
				profile.id
			}">Education</button>
      <button class="tablinks" data-tab="WorkExperience_${
				profile.id
			}">Work</button>
      <button class="tablinks" data-tab="Other_${profile.id}">Other</button>
      <button class="tablinks" data-tab="Custom_${profile.id}">Custom</button>
    </div>
    <div id="PersonalInfo_${profile.id}" class="tabcontent">
      <form class="personal-info-form" id="jobFillProfileForm_${profile.id}">
        <div class="profile-name">
          <label for="profileName_${profile.id}">Profile Name</label>
          <input type="text" maxlength="32" id="profileName_${
						profile.id
					}" name="name" value="${profile.name}">
        </div>
        <div class="profile-description">
          <label for="profileDescription_${
						profile.id
					}">Profile Description</label>
          <textarea maxlength="200" id="profileDescription_${
						profile.id
					}" name="description">${profile.description || ""}</textarea>
        </div>
        <div class="profile-prefix">
          <label for="prefix_${profile.id}">Prefix</label>
          <select id="prefix_${profile.id}" name="prefix">
          	<option value="None">None</option>
            <option value="Mr">Mr</option>
            <option value="Mrs">Mrs</option>
            <option value="Miss">Miss</option>
            <option value="Ms">Ms</option>
            <option value="Mx">Mx</option>
            <option value="Sir">Sir</option>
            <option value="Dame">Dame</option>
            <option value="Dr">Dr</option>
            <option value="Cllr">Cllr</option>
            <option value="Lady">Lady</option>
          </select>
        </div>
        <div class="profile-first-name">
          <label for="firstName_${profile.id}">First Name</label>
          <input type="text" id="firstName_${
						profile.id
					}" name="firstName" value="${profile.profileData.firstName || ""}">
        </div>
        <div class="profile-middle-name">
          <label for="middleName_${profile.id}">Middle Name</label>
          <input type="text" id="middleName_${
						profile.id
					}" name="middleName" value="${profile.profileData.middleName || ""}">
        </div>
        <div class="profile-last-name">
          <label for="lastName_${profile.id}">Last Name</label>
          <input type="text" id="lastName_${
						profile.id
					}" name="lastName" value="${profile.profileData.lastName || ""}">
        </div>
        <div class="profile-address">
          <label for="address_${profile.id}">Address</label>
          <input type="text" id="address_${profile.id}" name="address" value="${
			profile.profileData.address || ""
		}">
        </div>
        <div class="profile-city">
          <label for="city_${profile.id}">City</label>
          <input type="text" id="city_${profile.id}" name="city" value="${
			profile.profileData.city || ""
		}">
        </div>
        <div class="profile-state">
          <label for="state_${profile.id}">State</label>
          <input type="text" id="state_${profile.id}" name="state" value="${
			profile.profileData.state || ""
		}">
        </div>
        <div class="profile-postal-code">
          <label for="postalCode_${profile.id}">Postal Code</label>
          <input type="text" id="postalCode_${
						profile.id
					}" name="postalCode" value="${profile.profileData.postalCode || ""}">
        </div>
        <div class="profile-country">
          <label for="country_${profile.id}">Country</label>
          <input type="text" id="country_${profile.id}" name="country" value="${
			profile.profileData.country || ""
		}">
        </div>
        <div class="profile-email">
          <label for="email_${profile.id}">Email</label>
          <input type="email" id="email_${profile.id}" name="email" value="${
			profile.profileData.email || ""
		}">
        </div>
        <div class="profile-phone">
          <label for="phone_${profile.id}">Phone</label>
          <input type="tel" id="phone_${profile.id}" name="phone" value="${
			profile.profileData.phone || ""
		}">
        </div>
        <div class="profile-nationality">
          <label for="nationality_${profile.id}">Nationality</label>
          <input type="text" id="nationality_${
						profile.id
					}" name="nationality" value="${
			profile.profileData.nationality || ""
		}">
        </div>
        <div class="profile-linkedin">
          <label for="linkedin_${profile.id}">LinkedIn</label>
          <input type="url" id="linkedin_${
						profile.id
					}" name="linkedin" value="${profile.profileData.linkedin || ""}">
        </div>
        <div class="profile-twitter">
          <label for="twitter_${profile.id}">Twitter</label>
          <input type="url" id="twitter_${profile.id}" name="twitter" value="${
			profile.profileData.twitter || ""
		}">
        </div>
        <div class="profile-github">
          <label for="github_${profile.id}">GitHub</label>
          <input type="url" id="github_${profile.id}" name="github" value="${
			profile.profileData.github || ""
		}">
        </div>
        <div class="profile-website">
          <label for="website_${profile.id}">Website</label>
          <input type="url" id="website_${profile.id}" name="website" value="${
			profile.profileData.website || ""
		}">
        </div>
        <div class="profile-gender">
          <label for="gender_${profile.id}">Gender</label>
          <input type="text" id="gender_${profile.id}" name="gender" value="${
			profile.profileData.gender || ""
		}">
        </div>
        <button class="submit-btn" type="submit" id="saveSettings_${
					profile.id
				}">Save</button>
      </form>
    </div>
    <div id="Education_${profile.id}" class="tabcontent">
      <form class="education-form" id="educationProfileForm_${profile.id}">
        <div class="profile-school">
          <label for="school_${profile.id}">School or Institution</label>
          <input type="text" id="school_${profile.id}" name="school" value="${
			profile.profileData.school || ""
		}">
        </div>
        <div class="profile-degree">
          <label for="degree_${profile.id}">Degree</label>
          <input type="text" id="degree_${profile.id}" name="degree" value="${
			profile.profileData.degree || ""
		}">
        </div>
        <div class="profile-major">
          <label for="major_${profile.id}">Major</label>
          <input type="text" id="major_${profile.id}" name="major" value="${
			profile.profileData.major || ""
		}">
        </div>
        <div class="profile-school-start">
          <label for="startDate_${profile.id}">Start Date</label>
          <input type="date" id="startDate_${
						profile.id
					}" name="startDate" value="${profile.profileData.startDate || ""}">
        </div>
        <div class="profile-school-end">
          <label for="endDate_${profile.id}">End Date</label>
          <input type="date" id="endDate_${profile.id}" name="endDate" value="${
			profile.profileData.endDate || ""
		}">
        </div>
        <button class="submit-btn" type="submit" id="saveEducation_${
					profile.id
				}">Save</button>
      </form>
    </div>
    <div id="WorkExperience_${profile.id}" class="tabcontent">
      <form class="work-form" id="workExperienceProfileForm_${profile.id}">
        <div class="profile-company">
          <label for="company_${profile.id}">Company</label>
          <input type="text" id="company_${profile.id}" name="company" value="${
			profile.profileData.company || ""
		}">
        </div>
        <div class="profile-job-title">
          <label for="jobTitle_${profile.id}">Job Title</label>
          <input type="text" id="jobTitle_${
						profile.id
					}" name="jobTitle" value="${profile.profileData.jobTitle || ""}">
        </div>
        <div class="profile-work-start">
          <label for="workStartDate_${profile.id}">Start Date</label>
          <input type="date" id="workStartDate_${
						profile.id
					}" name="workStartDate" value="${
			profile.profileData.workStartDate || ""
		}">
        </div>
        <div class="profile-work-end">
          <label for="workEndDate_${profile.id}">End Date</label>
          <input type="date" id="workEndDate_${
						profile.id
					}" name="workEndDate" value="${
			profile.profileData.workEndDate || ""
		}">
        </div>
        <div class="profile-work-description">
          <label for="description_${profile.id}">Description</label>
          <textarea id="description_${profile.id}" name="workDescription">${
			profile.profileData.workDescription || ""
		}</textarea>
        </div>
        <button class="submit-btn" type="submit" id="saveWorkExperience_${
					profile.id
				}">Save</button>
      </form>
    </div>
    <div id="Other_${profile.id}" class="tabcontent">
      <form class="other-form" id="otherProfileForm_${profile.id}">
        <div class="profile-current-salary">
          <label for="currentSalary_${profile.id}">Current Salary</label>
          <input type="text" id="currentSalary_${
						profile.id
					}" name="currentSalary" value="${
			profile.profileData.currentSalary || ""
		}">
        </div>
        <div class="profile-expected-salary">
          <label for="expectedSalary_${profile.id}">Expected Salary</label>
          <input type="text" id="expectedSalary_${
						profile.id
					}" name="expectedSalary" value="${
			profile.profileData.expectedSalary || ""
		}">
        </div>
        <div class="profile-notice-period">
          <label for="noticePeriod_${profile.id}">Notice Period</label>
          <input type="text" id="noticePeriod_${
						profile.id
					}" name="noticePeriod" value="${
			profile.profileData.noticePeriod || ""
		}">
        </div>
        <div class="profile-other-start">
          <label for="earliestAvailableDate_${
						profile.id
					}">Earliest Available Date</label>
          <input type="date" id="earliestAvailableDate_${
						profile.id
					}" name="earliestAvailableDate" value="${
			profile.profileData.earliestAvailableDate || ""
		}">
        </div>
        <div class="profile-cover-letter">
          <label for="coverLetter_${profile.id}">Cover Letter</label>
          <textarea id="coverLetter_${
						profile.id
					}" name="coverLetter" rows="10">${
			profile.profileData.coverLetter || ""
		}</textarea>
        </div>
        <div class="profile-gender-identity">
          <label for="genderIdentity_${profile.id}">Gender Identity</label>
          <input type="text" id="genderIdentity_${
						profile.id
					}" name="genderIdentity" value="${
			profile.profileData.genderIdentity || ""
		}">
        </div>
        <div class="profile-ethnicity">
          <label for="raceEthnicity_${profile.id}">Race/Ethnicity</label>
          <input type="text" id="raceEthnicity_${
						profile.id
					}" name="raceEthnicity" value="${
			profile.profileData.raceEthnicity || ""
		}">
        </div>
        <div class="profile-orientation">
          <label for="sexualOrientation_${
						profile.id
					}">Sexual Orientation</label>
          <input type="text" id="sexualOrientation_${
						profile.id
					}" name="sexualOrientation" value="${
			profile.profileData.sexualOrientation || ""
		}">
        </div>
        <div class="profile-disability">
          <label for="disabilityStatus_${profile.id}">Disability Status</label>
          <input type="text" id="disabilityStatus_${
						profile.id
					}" name="disabilityStatus" value="${
			profile.profileData.disabilityStatus || ""
		}">
        </div>
        <div class="profile-veteran-status">
          <label for="veteranStatus_${profile.id}">Veteran Status</label>
          <input type="text" id="veteranStatus_${
						profile.id
					}" name="veteranStatus" value="${
			profile.profileData.veteranStatus || ""
		}">
		</div>
        <button class="submit-btn other-btn" type="submit" id="saveOther_${
					profile.id
				}">Save</button>
      </form>
    </div>
    <div id="Custom_${profile.id}" class="tabcontent">
      <form class="custom-form" id="customFieldsForm_${profile.id}">
        <div id="customFieldsContainer_${profile.id}"></div>
        <button class="custom-add-btn" type="button" id="addCustomField_${
					profile.id
				}">Add Custom Field</button>
        <button class="submit-btn" type="submit" id="saveCustom_${
					profile.id
				}">Save</button>
      </form>
    </div>
  `;
		profileContent.appendChild(content);

		for (var i = 0; i < profile.customFields.length; i++) {
			var customFieldsContainer = document.getElementById(
				`customFieldsContainer_${profile.id}`
			);
			var fieldDiv = document.createElement("div");
			fieldDiv.className = "custom-field";
			fieldDiv.id = `custom-field_${i}`;
			var labelNameDiv = document.createElement("div");
			var nameLabel = document.createElement("label");
			nameLabel.textContent = "Field Name";
			var nameInput = document.createElement("input");
			nameInput.type = "text";
			nameInput.name = "customFieldName";
			nameInput.value = profile.customFields[i].name;
			labelNameDiv.appendChild(nameLabel);
			labelNameDiv.appendChild(nameInput);

			var fieldValueDiv = document.createElement("div");
			var valueLabel = document.createElement("label");
			valueLabel.textContent = "Field Value";
			var valueInput = document.createElement("input");
			valueInput.type = "text";
			valueInput.name = "customFieldValue";
			valueInput.value = profile.customFields[i].value;
			fieldValueDiv.appendChild(valueLabel);
			fieldValueDiv.appendChild(valueInput);

			var deleteButton = document.createElement("button");
			deleteButton.textContent = "Delete";
			deleteButton.type = "button";
			deleteButton.className = "delete-button";

			deleteButton.addEventListener(
				"click",
				(function (currentFieldDiv, fieldIndex) {
					return function () {
						// Remove from DOM
						customFieldsContainer.removeChild(currentFieldDiv);

						// Remove from customFields array
						profile.customFields.splice(fieldIndex, 1);

						// Remove individual flat field from profile object
						var fieldName = nameInput.value.trim(); // Get the field name
						if (fieldName in profile.profileData) {
							delete profile.profileData[fieldName];
						}

						// Update in storage
						chrome.storage.sync.set({ profiles }, function () {
							console.log(`Custom field "${fieldName}" deleted.`);
						});
					};
				})(fieldDiv, i) // Pass the fieldDiv and the current index
			);

			fieldDiv.appendChild(labelNameDiv);
			fieldDiv.appendChild(fieldValueDiv);
			fieldDiv.appendChild(deleteButton);
			customFieldsContainer.appendChild(fieldDiv);
		}

		// Add event listeners for form submissions and custom field additions
		const jobFillForm = document.getElementById(
			`jobFillProfileForm_${profile.id}`
		);
		if (jobFillForm) {
			jobFillForm.addEventListener("submit", function (event) {
				event.preventDefault();
				saveProfileData(profile.id, "jobFillProfile");
			});
		}

		const educationForm = document.getElementById(
			`educationProfileForm_${profile.id}`
		);
		if (educationForm) {
			educationForm.addEventListener("submit", function (event) {
				event.preventDefault();
				saveProfileData(profile.id, "educationProfile");
			});
		}

		const workExperienceForm = document.getElementById(
			`workExperienceProfileForm_${profile.id}`
		);
		if (workExperienceForm) {
			workExperienceForm.addEventListener("submit", function (event) {
				event.preventDefault();
				saveProfileData(profile.id, "workExperienceProfile");
			});
		}

		const otherForm = document.getElementById(`otherProfileForm_${profile.id}`);
		if (otherForm) {
			otherForm.addEventListener("submit", function (event) {
				event.preventDefault();
				saveProfileData(profile.id, "otherProfile");
			});
		}

		const customForm = document.getElementById(
			`customFieldsForm_${profile.id}`
		);
		if (customForm) {
			customForm.addEventListener("submit", function (event) {
				event.preventDefault();
				saveCustomFields(profile.id);
			});
		}

		const addCustomFieldButton = document.getElementById(
			`addCustomField_${profile.id}`
		);
		if (addCustomFieldButton) {
			addCustomFieldButton.addEventListener("click", function () {
				var customFieldsContainer = document.getElementById(
					`customFieldsContainer_${profile.id}`
				);
				var fieldDiv = document.createElement("div");
				fieldDiv.className = "custom-field";
				var labelNameDiv = document.createElement("div");
				var nameLabel = document.createElement("label");
				nameLabel.textContent = "Field Name";
				var nameInput = document.createElement("input");
				nameInput.type = "text";
				nameInput.name = "customFieldName";
				labelNameDiv.appendChild(nameLabel);
				labelNameDiv.appendChild(nameInput);

				var fieldValueDiv = document.createElement("div");
				var valueLabel = document.createElement("label");
				valueLabel.textContent = "Field Value";
				var valueInput = document.createElement("input");
				valueInput.type = "text";
				valueInput.name = "customFieldValue";
				fieldValueDiv.appendChild(valueLabel);
				fieldValueDiv.appendChild(valueInput);

				var deleteButton = document.createElement("button");
				deleteButton.textContent = "Delete";
				deleteButton.type = "button";
				deleteButton.className = "delete-button";
				deleteButton.addEventListener("click", function () {
					console.log(fieldDiv);
					customFieldsContainer.removeChild(fieldDiv);
					// saveCustomFields(profile.id);
				});

				fieldDiv.appendChild(labelNameDiv);
				fieldDiv.appendChild(fieldValueDiv);
				fieldDiv.appendChild(deleteButton);
				customFieldsContainer.appendChild(fieldDiv);
			});
		}

		// Add event listeners for the tabs
		var tablinks = content.getElementsByClassName("tablinks");
		for (var i = 0; i < tablinks.length; i++) {
			tablinks[i].addEventListener("click", function (event) {
				openTab(event, this.getAttribute("data-tab"));
			});
		}

		var backButtons = content.getElementsByClassName("back-btn");
		for (var i = 0; i < backButtons.length; i++) {
			backButtons[i].addEventListener("click", function (event) {
				closeProfile();
			});
		}

		var deleteButtons = content.getElementsByClassName("delete-btn");
		for (var i = 0; i < deleteButtons.length; i++) {
			deleteButtons[i].addEventListener("click", function (event) {
				if (this.id == `delete-btn_${profile.id}`) {
					const profileTab = document.querySelector(
						`.profile-tab[data-profile="${profile.id}"]`
					);
					document.getElementById("profileTabs").removeChild(profileTab);

					const updatedProfiles = profiles.filter((p) => p.id != profile.id);
					chrome.storage.sync.set({ profiles: updatedProfiles }, function () {
						console.log(`Profile ${profile.name} deleted`);
					});
					profiles = updatedProfiles;

					chrome.storage.sync.get(["profile"], function (data) {
						const selectedProfile = data.profile;
						if (selectedProfile.id === profile.id) {
							var newSelectedProfile = {};
							if (profiles.length != 0) {
								newSelectedProfile = profiles[0];
							}
							chrome.storage.sync.set({ profile: newSelectedProfile });
						}
					});

					closeProfile();
				}
			});
		}
	}
});
