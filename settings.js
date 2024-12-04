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
			<select id="country_${profile.id}" name="country">
				<option value="None">None</option>
				<option value="United States">United States</option>
				<option value="Afghanistan">Afghanistan</option>
				<option value="Albania">Albania</option>
				<option value="Algeria">Algeria</option>
				<option value="American Samoa">American Samoa</option>
				<option value="Andorra">Andorra</option>
				<option value="Angola">Angola</option>
				<option value="Anguilla">Anguilla</option>
				<option value="Antartica">Antarctica</option>
				<option value="Antigua and Barbuda">Antigua and Barbuda</option>
				<option value="Argentina">Argentina</option>
				<option value="Armenia">Armenia</option>
				<option value="Aruba">Aruba</option>
				<option value="Australia">Australia</option>
				<option value="Austria">Austria</option>
				<option value="Azerbaijan">Azerbaijan</option>
				<option value="Bahamas">Bahamas</option>
				<option value="Bahrain">Bahrain</option>
				<option value="Bangladesh">Bangladesh</option>
				<option value="Barbados">Barbados</option>
				<option value="Belarus">Belarus</option>
				<option value="Belgium">Belgium</option>
				<option value="Belize">Belize</option>
				<option value="Benin">Benin</option>
				<option value="Bermuda">Bermuda</option>
				<option value="Bhutan">Bhutan</option>
				<option value="Bolivia">Bolivia</option>
				<option value="Bosnia and Herzegowina">Bosnia and Herzegowina</option>
				<option value="Botswana">Botswana</option>
				<option value="Bouvet Island">Bouvet Island</option>
				<option value="Brazil">Brazil</option>
				<option value="British Indian Ocean Territory">British Indian Ocean Territory</option>
				<option value="Brunei Darussalam">Brunei Darussalam</option>
				<option value="Bulgaria">Bulgaria</option>
				<option value="Burkina Faso">Burkina Faso</option>
				<option value="Burundi">Burundi</option>
				<option value="Cambodia">Cambodia</option>
				<option value="Cameroon">Cameroon</option>
				<option value="Canada">Canada</option>
				<option value="Cape Verde">Cape Verde</option>
				<option value="Cayman Islands">Cayman Islands</option>
				<option value="Central African Republic">Central African Republic</option>
				<option value="Chad">Chad</option>
				<option value="Chile">Chile</option>
				<option value="China">China</option>
				<option value="Christmas Island">Christmas Island</option>
				<option value="Cocos Islands">Cocos (Keeling) Islands</option>
				<option value="Colombia">Colombia</option>
				<option value="Comoros">Comoros</option>
				<option value="Congo">Congo</option>
				<option value="Congo">Congo, the Democratic Republic of the</option>
				<option value="Cook Islands">Cook Islands</option>
				<option value="Costa Rica">Costa Rica</option>
				<option value="Cota D'Ivoire">Cote d'Ivoire</option>
				<option value="Croatia">Croatia (Hrvatska)</option>
				<option value="Cuba">Cuba</option>
				<option value="Cyprus">Cyprus</option>
				<option value="Czech Republic">Czech Republic</option>
				<option value="Denmark">Denmark</option>
				<option value="Djibouti">Djibouti</option>
				<option value="Dominica">Dominica</option>
				<option value="Dominican Republic">Dominican Republic</option>
				<option value="East Timor">East Timor</option>
				<option value="Ecuador">Ecuador</option>
				<option value="Egypt">Egypt</option>
				<option value="El Salvador">El Salvador</option>
				<option value="Equatorial Guinea">Equatorial Guinea</option>
				<option value="Eritrea">Eritrea</option>
				<option value="Estonia">Estonia</option>
				<option value="Ethiopia">Ethiopia</option>
				<option value="Falkland Islands">Falkland Islands (Malvinas)</option>
				<option value="Faroe Islands">Faroe Islands</option>
				<option value="Fiji">Fiji</option>
				<option value="Finland">Finland</option>
				<option value="France">France</option>
				<option value="France Metropolitan">France, Metropolitan</option>
				<option value="French Guiana">French Guiana</option>
				<option value="French Polynesia">French Polynesia</option>
				<option value="French Southern Territories">French Southern Territories</option>
				<option value="Gabon">Gabon</option>
				<option value="Gambia">Gambia</option>
				<option value="Georgia">Georgia</option>
				<option value="Germany">Germany</option>
				<option value="Ghana">Ghana</option>
				<option value="Gibraltar">Gibraltar</option>
				<option value="Greece">Greece</option>
				<option value="Greenland">Greenland</option>
				<option value="Grenada">Grenada</option>
				<option value="Guadeloupe">Guadeloupe</option>
				<option value="Guam">Guam</option>
				<option value="Guatemala">Guatemala</option>
				<option value="Guinea">Guinea</option>
				<option value="Guinea-Bissau">Guinea-Bissau</option>
				<option value="Guyana">Guyana</option>
				<option value="Haiti">Haiti</option>
				<option value="Heard and McDonald Islands">Heard and Mc Donald Islands</option>
				<option value="Holy See">Holy See (Vatican City State)</option>
				<option value="Honduras">Honduras</option>
				<option value="Hong Kong">Hong Kong</option>
				<option value="Hungary">Hungary</option>
				<option value="Iceland">Iceland</option>
				<option value="India">India</option>
				<option value="Indonesia">Indonesia</option>
				<option value="Iran">Iran (Islamic Republic of)</option>
				<option value="Iraq">Iraq</option>
				<option value="Ireland">Ireland</option>
				<option value="Israel">Israel</option>
				<option value="Italy">Italy</option>
				<option value="Jamaica">Jamaica</option>
				<option value="Japan">Japan</option>
				<option value="Jordan">Jordan</option>
				<option value="Kazakhstan">Kazakhstan</option>
				<option value="Kenya">Kenya</option>
				<option value="Kiribati">Kiribati</option>
				<option value="Democratic People's Republic of Korea">Korea, Democratic People's Republic of</option>
				<option value="Korea">Korea, Republic of</option>
				<option value="Kuwait">Kuwait</option>
				<option value="Kyrgyzstan">Kyrgyzstan</option>
				<option value="Lao">Lao People's Democratic Republic</option>
				<option value="Latvia">Latvia</option>
				<option value="Lebanon">Lebanon</option>
				<option value="Lesotho">Lesotho</option>
				<option value="Liberia">Liberia</option>
				<option value="Libyan Arab Jamahiriya">Libyan Arab Jamahiriya</option>
				<option value="Liechtenstein">Liechtenstein</option>
				<option value="Lithuania">Lithuania</option>
				<option value="Luxembourg">Luxembourg</option>
				<option value="Macau">Macau</option>
				<option value="Macedonia">Macedonia, The Former Yugoslav Republic of</option>
				<option value="Madagascar">Madagascar</option>
				<option value="Malawi">Malawi</option>
				<option value="Malaysia">Malaysia</option>
				<option value="Maldives">Maldives</option>
				<option value="Mali">Mali</option>
				<option value="Malta">Malta</option>
				<option value="Marshall Islands">Marshall Islands</option>
				<option value="Martinique">Martinique</option>
				<option value="Mauritania">Mauritania</option>
				<option value="Mauritius">Mauritius</option>
				<option value="Mayotte">Mayotte</option>
				<option value="Mexico">Mexico</option>
				<option value="Micronesia">Micronesia, Federated States of</option>
				<option value="Moldova">Moldova, Republic of</option>
				<option value="Monaco">Monaco</option>
				<option value="Mongolia">Mongolia</option>
				<option value="Montserrat">Montserrat</option>
				<option value="Morocco">Morocco</option>
				<option value="Mozambique">Mozambique</option>
				<option value="Myanmar">Myanmar</option>
				<option value="Namibia">Namibia</option>
				<option value="Nauru">Nauru</option>
				<option value="Nepal">Nepal</option>
				<option value="Netherlands">Netherlands</option>
				<option value="Netherlands Antilles">Netherlands Antilles</option>
				<option value="New Caledonia">New Caledonia</option>
				<option value="New Zealand">New Zealand</option>
				<option value="Nicaragua">Nicaragua</option>
				<option value="Niger">Niger</option>
				<option value="Nigeria">Nigeria</option>
				<option value="Niue">Niue</option>
				<option value="Norfolk Island">Norfolk Island</option>
				<option value="Northern Mariana Islands">Northern Mariana Islands</option>
				<option value="Norway">Norway</option>
				<option value="Oman">Oman</option>
				<option value="Pakistan">Pakistan</option>
				<option value="Palau">Palau</option>
				<option value="Panama">Panama</option>
				<option value="Papua New Guinea">Papua New Guinea</option>
				<option value="Paraguay">Paraguay</option>
				<option value="Peru">Peru</option>
				<option value="Philippines">Philippines</option>
				<option value="Pitcairn">Pitcairn</option>
				<option value="Poland">Poland</option>
				<option value="Portugal">Portugal</option>
				<option value="Puerto Rico">Puerto Rico</option>
				<option value="Qatar">Qatar</option>
				<option value="Reunion">Reunion</option>
				<option value="Romania">Romania</option>
				<option value="Russia">Russian Federation</option>
				<option value="Rwanda">Rwanda</option>
				<option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option> 
				<option value="Saint Lucia">Saint LUCIA</option>
				<option value="Saint Vincent">Saint Vincent and the Grenadines</option>
				<option value="Samoa">Samoa</option>
				<option value="San Marino">San Marino</option>
				<option value="Sao Tome and Principe">Sao Tome and Principe</option> 
				<option value="Saudi Arabia">Saudi Arabia</option>
				<option value="Senegal">Senegal</option>
				<option value="Seychelles">Seychelles</option>
				<option value="Sierra">Sierra Leone</option>
				<option value="Singapore">Singapore</option>
				<option value="Slovakia">Slovakia (Slovak Republic)</option>
				<option value="Slovenia">Slovenia</option>
				<option value="Solomon Islands">Solomon Islands</option>
				<option value="Somalia">Somalia</option>
				<option value="South Africa">South Africa</option>
				<option value="South Georgia">South Georgia and the South Sandwich Islands</option>
				<option value="Span">Spain</option>
				<option value="Sri Lanka">Sri Lanka</option>
				<option value="St. Helena">St. Helena</option>
				<option value="St. Pierre and Miguelon">St. Pierre and Miquelon</option>
				<option value="Sudan">Sudan</option>
				<option value="Suriname">Suriname</option>
				<option value="Svalbard">Svalbard and Jan Mayen Islands</option>
				<option value="Swaziland">Swaziland</option>
				<option value="Sweden">Sweden</option>
				<option value="Switzerland">Switzerland</option>
				<option value="Syria">Syrian Arab Republic</option>
				<option value="Taiwan">Taiwan, Province of China</option>
				<option value="Tajikistan">Tajikistan</option>
				<option value="Tanzania">Tanzania, United Republic of</option>
				<option value="Thailand">Thailand</option>
				<option value="Togo">Togo</option>
				<option value="Tokelau">Tokelau</option>
				<option value="Tonga">Tonga</option>
				<option value="Trinidad and Tobago">Trinidad and Tobago</option>
				<option value="Tunisia">Tunisia</option>
				<option value="Turkey">Turkey</option>
				<option value="Turkmenistan">Turkmenistan</option>
				<option value="Turks and Caicos">Turks and Caicos Islands</option>
				<option value="Tuvalu">Tuvalu</option>
				<option value="Uganda">Uganda</option>
				<option value="Ukraine">Ukraine</option>
				<option value="United Arab Emirates">United Arab Emirates</option>
				<option value="United Kingdom">United Kingdom</option>
				<option value="United States Minor Outlying Islands">United States Minor Outlying Islands</option>
				<option value="Uruguay">Uruguay</option>
				<option value="Uzbekistan">Uzbekistan</option>
				<option value="Vanuatu">Vanuatu</option>
				<option value="Venezuela">Venezuela</option>
				<option value="Vietnam">Viet Nam</option>
				<option value="Virgin Islands (British)">Virgin Islands (British)</option>
				<option value="Virgin Islands (U.S)">Virgin Islands (U.S.)</option>
				<option value="Wallis and Futana Islands">Wallis and Futuna Islands</option>
				<option value="Western Sahara">Western Sahara</option>
				<option value="Yemen">Yemen</option>
				<option value="Serbia">Serbia</option>
				<option value="Zambia">Zambia</option>
				<option value="Zimbabwe">Zimbabwe</option>
			</select>
        </div>
        <div class="profile-email">
          <label for="email_${profile.id}">Email</label>
          <input type="email" id="email_${profile.id}" name="email" value="${
			profile.profileData.email || ""
		}">
        </div>
        <div class="profile-phone">
          <label for="phone_${profile.id}">Phone</label>
          <input type="number" id="phone_${profile.id}" name="phone" value="${
			profile.profileData.phone || ""
		}">
        </div>
        <div class="profile-nationality">
          <label for="nationality_${profile.id}">Nationality</label>
			<select id="nationality_${profile.id}" name="nationality">
				<option value="None">None</option>
				<option value="afghan">Afghan</option>
				<option value="albanian">Albanian</option>
				<option value="algerian">Algerian</option>
				<option value="american">American</option>
				<option value="andorran">Andorran</option>
				<option value="angolan">Angolan</option>
				<option value="antiguans">Antiguans</option>
				<option value="argentinean">Argentinean</option>
				<option value="armenian">Armenian</option>
				<option value="australian">Australian</option>
				<option value="austrian">Austrian</option>
				<option value="azerbaijani">Azerbaijani</option>
				<option value="bahamian">Bahamian</option>
				<option value="bahraini">Bahraini</option>
				<option value="bangladeshi">Bangladeshi</option>
				<option value="barbadian">Barbadian</option>
				<option value="barbudans">Barbudans</option>
				<option value="batswana">Batswana</option>
				<option value="belarusian">Belarusian</option>
				<option value="belgian">Belgian</option>
				<option value="belizean">Belizean</option>
				<option value="beninese">Beninese</option>
				<option value="bhutanese">Bhutanese</option>
				<option value="bolivian">Bolivian</option>
				<option value="bosnian">Bosnian</option>
				<option value="brazilian">Brazilian</option>
				<option value="british">British</option>
				<option value="bruneian">Bruneian</option>
				<option value="bulgarian">Bulgarian</option>
				<option value="burkinabe">Burkinabe</option>
				<option value="burmese">Burmese</option>
				<option value="burundian">Burundian</option>
				<option value="cambodian">Cambodian</option>
				<option value="cameroonian">Cameroonian</option>
				<option value="canadian">Canadian</option>
				<option value="cape verdean">Cape Verdean</option>
				<option value="central african">Central African</option>
				<option value="chadian">Chadian</option>
				<option value="chilean">Chilean</option>
				<option value="chinese">Chinese</option>
				<option value="colombian">Colombian</option>
				<option value="comoran">Comoran</option>
				<option value="congolese">Congolese</option>
				<option value="costa rican">Costa Rican</option>
				<option value="croatian">Croatian</option>
				<option value="cuban">Cuban</option>
				<option value="cypriot">Cypriot</option>
				<option value="czech">Czech</option>
				<option value="danish">Danish</option>
				<option value="djibouti">Djibouti</option>
				<option value="dominican">Dominican</option>
				<option value="dutch">Dutch</option>
				<option value="east timorese">East Timorese</option>
				<option value="ecuadorean">Ecuadorean</option>
				<option value="egyptian">Egyptian</option>
				<option value="emirian">Emirian</option>
				<option value="equatorial guinean">Equatorial Guinean</option>
				<option value="eritrean">Eritrean</option>
				<option value="estonian">Estonian</option>
				<option value="ethiopian">Ethiopian</option>
				<option value="fijian">Fijian</option>
				<option value="filipino">Filipino</option>
				<option value="finnish">Finnish</option>
				<option value="french">French</option>
				<option value="gabonese">Gabonese</option>
				<option value="gambian">Gambian</option>
				<option value="georgian">Georgian</option>
				<option value="german">German</option>
				<option value="ghanaian">Ghanaian</option>
				<option value="greek">Greek</option>
				<option value="grenadian">Grenadian</option>
				<option value="guatemalan">Guatemalan</option>
				<option value="guinea-bissauan">Guinea-Bissauan</option>
				<option value="guinean">Guinean</option>
				<option value="guyanese">Guyanese</option>
				<option value="haitian">Haitian</option>
				<option value="herzegovinian">Herzegovinian</option>
				<option value="honduran">Honduran</option>
				<option value="hungarian">Hungarian</option>
				<option value="icelander">Icelander</option>
				<option value="indian">Indian</option>
				<option value="indonesian">Indonesian</option>
				<option value="iranian">Iranian</option>
				<option value="iraqi">Iraqi</option>
				<option value="irish">Irish</option>
				<option value="israeli">Israeli</option>
				<option value="italian">Italian</option>
				<option value="ivorian">Ivorian</option>
				<option value="jamaican">Jamaican</option>
				<option value="japanese">Japanese</option>
				<option value="jordanian">Jordanian</option>
				<option value="kazakhstani">Kazakhstani</option>
				<option value="kenyan">Kenyan</option>
				<option value="kittian and nevisian">Kittian and Nevisian</option>
				<option value="kuwaiti">Kuwaiti</option>
				<option value="kyrgyz">Kyrgyz</option>
				<option value="laotian">Laotian</option>
				<option value="latvian">Latvian</option>
				<option value="lebanese">Lebanese</option>
				<option value="liberian">Liberian</option>
				<option value="libyan">Libyan</option>
				<option value="liechtensteiner">Liechtensteiner</option>
				<option value="lithuanian">Lithuanian</option>
				<option value="luxembourger">Luxembourger</option>
				<option value="macedonian">Macedonian</option>
				<option value="malagasy">Malagasy</option>
				<option value="malawian">Malawian</option>
				<option value="malaysian">Malaysian</option>
				<option value="maldivan">Maldivan</option>
				<option value="malian">Malian</option>
				<option value="maltese">Maltese</option>
				<option value="marshallese">Marshallese</option>
				<option value="mauritanian">Mauritanian</option>
				<option value="mauritian">Mauritian</option>
				<option value="mexican">Mexican</option>
				<option value="micronesian">Micronesian</option>
				<option value="moldovan">Moldovan</option>
				<option value="monacan">Monacan</option>
				<option value="mongolian">Mongolian</option>
				<option value="moroccan">Moroccan</option>
				<option value="mosotho">Mosotho</option>
				<option value="motswana">Motswana</option>
				<option value="mozambican">Mozambican</option>
				<option value="namibian">Namibian</option>
				<option value="nauruan">Nauruan</option>
				<option value="nepalese">Nepalese</option>
				<option value="new zealander">New Zealander</option>
				<option value="ni-vanuatu">Ni-Vanuatu</option>
				<option value="nicaraguan">Nicaraguan</option>
				<option value="nigerien">Nigerien</option>
				<option value="north korean">North Korean</option>
				<option value="northern irish">Northern Irish</option>
				<option value="norwegian">Norwegian</option>
				<option value="omani">Omani</option>
				<option value="pakistani">Pakistani</option>
				<option value="palauan">Palauan</option>
				<option value="panamanian">Panamanian</option>
				<option value="papua new guinean">Papua New Guinean</option>
				<option value="paraguayan">Paraguayan</option>
				<option value="peruvian">Peruvian</option>
				<option value="polish">Polish</option>
				<option value="portuguese">Portuguese</option>
				<option value="qatari">Qatari</option>
				<option value="romanian">Romanian</option>
				<option value="russian">Russian</option>
				<option value="rwandan">Rwandan</option>
				<option value="saint lucian">Saint Lucian</option>
				<option value="salvadoran">Salvadoran</option>
				<option value="samoan">Samoan</option>
				<option value="san marinese">San Marinese</option>
				<option value="sao tomean">Sao Tomean</option>
				<option value="saudi">Saudi</option>
				<option value="scottish">Scottish</option>
				<option value="senegalese">Senegalese</option>
				<option value="serbian">Serbian</option>
				<option value="seychellois">Seychellois</option>
				<option value="sierra leonean">Sierra Leonean</option>
				<option value="singaporean">Singaporean</option>
				<option value="slovakian">Slovakian</option>
				<option value="slovenian">Slovenian</option>
				<option value="solomon islander">Solomon Islander</option>
				<option value="somali">Somali</option>
				<option value="south african">South African</option>
				<option value="south korean">South Korean</option>
				<option value="spanish">Spanish</option>
				<option value="sri lankan">Sri Lankan</option>
				<option value="sudanese">Sudanese</option>
				<option value="surinamer">Surinamer</option>
				<option value="swazi">Swazi</option>
				<option value="swedish">Swedish</option>
				<option value="swiss">Swiss</option>
				<option value="syrian">Syrian</option>
				<option value="taiwanese">Taiwanese</option>
				<option value="tajik">Tajik</option>
				<option value="tanzanian">Tanzanian</option>
				<option value="thai">Thai</option>
				<option value="togolese">Togolese</option>
				<option value="tongan">Tongan</option>
				<option value="trinidadian or tobagonian">Trinidadian or Tobagonian</option>
				<option value="tunisian">Tunisian</option>
				<option value="turkish">Turkish</option>
				<option value="tuvaluan">Tuvaluan</option>
				<option value="ugandan">Ugandan</option>
				<option value="ukrainian">Ukrainian</option>
				<option value="uruguayan">Uruguayan</option>
				<option value="uzbekistani">Uzbekistani</option>
				<option value="venezuelan">Venezuelan</option>
				<option value="vietnamese">Vietnamese</option>
				<option value="welsh">Welsh</option>
				<option value="yemenite">Yemenite</option>
				<option value="zambian">Zambian</option>
				<option value="zimbabwean">Zimbabwean</option>
				</select>
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
		profileContent.querySelector(`#prefix_${profile.id}`).value =
			profile.profileData.prefix;

		profileContent.querySelector(`#country_${profile.id}`).value =
			profile.profileData.country;

		profileContent.querySelector(`#nationality_${profile.id}`).value =
			profile.profileData.nationality;

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
