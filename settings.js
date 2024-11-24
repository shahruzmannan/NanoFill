var profiles = []; // Define profiles in the global scope

function addProfileTab(profile, index) {
  var tab = document.createElement('button');
  tab.className = 'profile-tab';
  tab.setAttribute('data-profile', profile.id);

  var tabText = document.createElement('span');
  tabText.textContent = profile.name;
  tabText.className = 'profile-tab-text';
  tab.appendChild(tabText);

  var tabInput = document.createElement('input');
  tabInput.type = 'text';
  tabInput.value = profile.name;
  tabInput.className = 'profile-tab-input';
  tabInput.style.display = 'none';
  tab.appendChild(tabInput);

  tab.addEventListener('click', function(event) {
    openProfile(event, profile.id);
  });

  tab.addEventListener('dblclick', function(event) {
    event.stopPropagation(); // Prevent the click event from firing
    tabText.style.display = 'none';
    tabInput.style.display = 'inline';
    tabInput.focus();
  });

  tabInput.addEventListener('blur', function() {
    profile.name = tabInput.value;
    chrome.storage.sync.set({ profiles: profiles }, function() {
      console.log(`Profile name updated to ${profile.name}`);
      tabText.textContent = profile.name;
      tabText.style.display = 'inline';
      tabInput.style.display = 'none';
    });
  });

  tabInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
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
  evt.currentTarget.className += " active";
}

function openProfile(evt, profileId) {
  var i, profileContent, profileTabs;
  profileContent = document.getElementsByClassName("profile-content");
  for (i = 0; i < profileContent.length; i++) {
    profileContent[i].style.display = "none";
  }
  profileTabs = document.getElementsByClassName("profile-tab");
  for (i = 0; i < profileTabs.length; i++) {
    profileTabs[i].className = profileTabs[i].className.replace(" active", "");
  }
  document.getElementById(profileId).style.display = "block";
  evt.currentTarget.className += " active";
}

function saveProfileData(profileId, profileType) {
  var profileIndex = profiles.findIndex(p => p.id === profileId);
  var formElement = document.getElementById(`${profileType}Form_${profileId}`);
  if (!formElement) {
    console.error(`Form element with ID ${profileType}Form_${profileId} not found.`);
    return;
  }
  var formData = new FormData(formElement);
  var profileData = {};

  formData.forEach((value, key) => {
    profileData[key] = value;
  });

  profiles[profileIndex][profileType] = profileData;
  chrome.storage.sync.set({ profiles: profiles }, function() {
    console.log(`${profileType} saved for profile ${profileId}`);
  });
}

function saveCustomFields(profileId) {
  console.log(`Saving custom fields for profile ${profileId}`);
  var profileIndex = profiles.findIndex(p => p.id === profileId);
  var customFieldsContainer = document.getElementById(`customFieldsContainer_${profileId}`);
  if (!customFieldsContainer) {
    console.error(`Custom fields container with ID customFieldsContainer_${profileId} not found.`);
    return;
  }

  var customFields = [];
  var fieldDivs = customFieldsContainer.children;
  for (var i = 0; i < fieldDivs.length; i++) {
    var fieldDiv = fieldDivs[i];
    var fieldName = fieldDiv.querySelector('input[name="customFieldName"]').value;
    var fieldValue = fieldDiv.querySelector('input[name="customFieldValue"]').value;
    customFields.push({ name: fieldName, value: fieldValue });
  }

  profiles[profileIndex].customFields = customFields;
  chrome.storage.sync.set({ profiles: profiles }, function() {
    console.log(`Custom fields saved for profile ${profileId}`);
  });
}

document.addEventListener('DOMContentLoaded', async function() {
  var profileTabs = document.getElementById('profileTabs');
  var profileContent = document.getElementById('profileContent');
  var addProfileButton = document.getElementById('addProfileButton');

  chrome.storage.sync.get(['profiles'], function(data) {
    profiles = data.profiles || [];
    profiles.forEach((profile, index) => {
      addProfileTab(profile, index);
      addProfileContent(profile, index);
    });
  });

  addProfileButton.addEventListener('click', function() {
    var newProfile = {
      id: 'profile_' + Date.now(),
      name: 'New Profile',
      jobFillProfile: {},
      educationProfile: {},
      workExperienceProfile: {},
      otherProfile: {},
      customFields: []
    };
    addProfileTab(newProfile, profiles.length);
    addProfileContent(newProfile, profiles.length);
    profiles.push(newProfile);
    chrome.storage.sync.set({ profiles: profiles });
  });


  function addProfileTab(profile, index) {
    var tab = document.createElement('button');
    tab.className = 'profile-tab';
    tab.textContent = profile.name;
    tab.setAttribute('data-profile', profile.id);
    tab.addEventListener('click', function(event) {
      openProfile(event, profile.id);
    });
    profileTabs.appendChild(tab);
  }

  function addProfileContent(profile, index) {
  var content = document.createElement('div');
  content.className = 'profile-content';
  content.id = profile.id;
  content.innerHTML = `
    <div class="tab">
      <button class="tablinks" data-tab="PersonalInfo_${profile.id}">Personal Information</button>
      <button class="tablinks" data-tab="Education_${profile.id}">Education</button>
      <button class="tablinks" data-tab="WorkExperience_${profile.id}">Work Experience</button>
      <button class="tablinks" data-tab="Other_${profile.id}">Other</button>
      <button class="tablinks" data-tab="Custom_${profile.id}">Custom</button>
    </div>
    <div id="PersonalInfo_${profile.id}" class="tabcontent">
      <form id="jobFillProfileForm_${profile.id}">
        <div>
          <label for="profileName_${profile.id}">Profile Name</label>
          <input type="text" id="profileName_${profile.id}" name="profileName" value="${profile.name}">
        </div>
        <div>
          <label for="profileDescription_${profile.id}">Profile Description</label>
          <textarea id="profileDescription_${profile.id}" name="profileDescription">${profile.description || ''}</textarea>
        </div>
        <div>
          <label for="prefix_${profile.id}">Prefix</label>
          <select id="prefix_${profile.id}" name="prefix">
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
        <div>
          <label for="firstName_${profile.id}">First Name</label>
          <input type="text" id="firstName_${profile.id}" name="firstName" value="${profile.jobFillProfile.firstName || ''}">
        </div>
        <div>
          <label for="middleName_${profile.id}">Middle Name</label>
          <input type="text" id="middleName_${profile.id}" name="middleName" value="${profile.jobFillProfile.middleName || ''}">
        </div>
        <div>
          <label for="lastName_${profile.id}">Last Name</label>
          <input type="text" id="lastName_${profile.id}" name="lastName" value="${profile.jobFillProfile.lastName || ''}">
        </div>
        <div>
          <label for="address_${profile.id}">Address</label>
          <input type="text" id="address_${profile.id}" name="address" value="${profile.jobFillProfile.address || ''}">
        </div>
        <div>
          <label for="city_${profile.id}">City</label>
          <input type="text" id="city_${profile.id}" name="city" value="${profile.jobFillProfile.city || ''}">
        </div>
        <div>
          <label for="state_${profile.id}">State</label>
          <input type="text" id="state_${profile.id}" name="state" value="${profile.jobFillProfile.state || ''}">
        </div>
        <div>
          <label for="postalCode_${profile.id}">Postal Code</label>
          <input type="text" id="postalCode_${profile.id}" name="postalCode" value="${profile.jobFillProfile.postalCode || ''}">
        </div>
        <div>
          <label for="country_${profile.id}">Country</label>
          <input type="text" id="country_${profile.id}" name="country" value="${profile.jobFillProfile.country || ''}">
        </div>
        <div>
          <label for="email_${profile.id}">Email</label>
          <input type="email" id="email_${profile.id}" name="email" value="${profile.jobFillProfile.email || ''}">
        </div>
        <div>
          <label for="phone_${profile.id}">Phone</label>
          <input type="tel" id="phone_${profile.id}" name="phone" value="${profile.jobFillProfile.phone || ''}">
        </div>
        <div>
          <label for="nationality_${profile.id}">Nationality</label>
          <input type="text" id="nationality_${profile.id}" name="nationality" value="${profile.jobFillProfile.nationality || ''}">
        </div>
        <div>
          <label for="linkedin_${profile.id}">LinkedIn</label>
          <input type="url" id="linkedin_${profile.id}" name="linkedin" value="${profile.jobFillProfile.linkedin || ''}">
        </div>
        <div>
          <label for="twitter_${profile.id}">Twitter</label>
          <input type="url" id="twitter_${profile.id}" name="twitter" value="${profile.jobFillProfile.twitter || ''}">
        </div>
        <div>
          <label for="github_${profile.id}">GitHub</label>
          <input type="url" id="github_${profile.id}" name="github" value="${profile.jobFillProfile.github || ''}">
        </div>
        <div>
          <label for="website_${profile.id}">Website</label>
          <input type="url" id="website_${profile.id}" name="website" value="${profile.jobFillProfile.website || ''}">
        </div>
        <div>
          <label for="gender_${profile.id}">Gender</label>
          <input type="text" id="gender_${profile.id}" name="gender" value="${profile.jobFillProfile.gender || ''}">
        </div>
        <button type="submit" id="saveSettings_${profile.id}">Save Settings</button>
      </form>
    </div>
    <div id="Education_${profile.id}" class="tabcontent">
      <form id="educationProfileForm_${profile.id}">
        <div>
          <label for="school_${profile.id}">School or Institution</label>
          <input type="text" id="school_${profile.id}" name="school" value="${profile.educationProfile.school || ''}">
        </div>
        <div>
          <label for="degree_${profile.id}">Degree</label>
          <input type="text" id="degree_${profile.id}" name="degree" value="${profile.educationProfile.degree || ''}">
        </div>
        <div>
          <label for="major_${profile.id}">Major</label>
          <input type="text" id="major_${profile.id}" name="major" value="${profile.educationProfile.major || ''}">
        </div>
        <div>
          <label for="startDate_${profile.id}">Start Date</label>
          <input type="date" id="startDate_${profile.id}" name="startDate" value="${profile.educationProfile.startDate || ''}">
        </div>
        <div>
          <label for="endDate_${profile.id}">End Date</label>
          <input type="date" id="endDate_${profile.id}" name="endDate" value="${profile.educationProfile.endDate || ''}">
        </div>
        <button type="submit" id="saveEducation_${profile.id}">Save Education</button>
      </form>
    </div>
    <div id="WorkExperience_${profile.id}" class="tabcontent">
      <form id="workExperienceProfileForm_${profile.id}">
        <div>
          <label for="company_${profile.id}">Company</label>
          <input type="text" id="company_${profile.id}" name="company" value="${profile.workExperienceProfile.company || ''}">
        </div>
        <div>
          <label for="jobTitle_${profile.id}">Job Title</label>
          <input type="text" id="jobTitle_${profile.id}" name="jobTitle" value="${profile.workExperienceProfile.jobTitle || ''}">
        </div>
        <div>
          <label for="workStartDate_${profile.id}">Start Date</label>
          <input type="date" id="workStartDate_${profile.id}" name="workStartDate" value="${profile.workExperienceProfile.workStartDate || ''}">
        </div>
        <div>
          <label for="workEndDate_${profile.id}">End Date</label>
          <input type="date" id="workEndDate_${profile.id}" name="workEndDate" value="${profile.workExperienceProfile.workEndDate || ''}">
        </div>
        <div>
          <label for="description_${profile.id}">Description</label>
          <textarea id="description_${profile.id}" name="description">${profile.workExperienceProfile.description || ''}</textarea>
        </div>
        <button type="submit" id="saveWorkExperience_${profile.id}">Save Work Experience</button>
      </form>
    </div>
    <div id="Other_${profile.id}" class="tabcontent">
      <form id="otherProfileForm_${profile.id}">
        <div>
          <label for="currentSalary_${profile.id}">Current Salary</label>
          <input type="text" id="currentSalary_${profile.id}" name="currentSalary" value="${profile.otherProfile.currentSalary || ''}">
        </div>
        <div>
          <label for="expectedSalary_${profile.id}">Expected Salary</label>
          <input type="text" id="expectedSalary_${profile.id}" name="expectedSalary" value="${profile.otherProfile.expectedSalary || ''}">
        </div>
        <div>
          <label for="noticePeriod_${profile.id}">Notice Period</label>
          <input type="text" id="noticePeriod_${profile.id}" name="noticePeriod" value="${profile.otherProfile.noticePeriod || ''}">
        </div>
        <div>
          <label for="earliestAvailableDate_${profile.id}">Earliest Available Date</label>
          <input type="date" id="earliestAvailableDate_${profile.id}" name="earliestAvailableDate" value="${profile.otherProfile.earliestAvailableDate || ''}">
        </div>
        <div>
          <label for="coverLetter_${profile.id}">Cover Letter</label>
          <textarea id="coverLetter_${profile.id}" name="coverLetter" rows="10">${profile.otherProfile.coverLetter || ''}</textarea>
        </div>
        <div>
          <label for="genderIdentity_${profile.id}">Gender Identity</label>
          <input type="text" id="genderIdentity_${profile.id}" name="genderIdentity" value="${profile.otherProfile.genderIdentity || ''}">
        </div>
        <div>
          <label for="raceEthnicity_${profile.id}">Race/Ethnicity</label>
          <input type="text" id="raceEthnicity_${profile.id}" name="raceEthnicity" value="${profile.otherProfile.raceEthnicity || ''}">
        </div>
        <div>
          <label for="sexualOrientation_${profile.id}">Sexual Orientation</label>
          <input type="text" id="sexualOrientation_${profile.id}" name="sexualOrientation" value="${profile.otherProfile.sexualOrientation || ''}">
        </div>
        <div>
          <label for="disabilityStatus_${profile.id}">Disability Status</label>
          <input type="text" id="disabilityStatus_${profile.id}" name="disabilityStatus" value="${profile.otherProfile.disabilityStatus || ''}">
        </div>
        <div>
          <label for="veteranStatus_${profile.id}">Veteran Status</label>
          <input type="text" id="veteranStatus_${profile.id}" name="veteranStatus" value="${profile.otherProfile.veteranStatus || ''}">
        </div>
        <div>
          <label for="resume_${profile.id}">Resume/CV</label>
          <input type="file" id="resume_${profile.id}" name="resume" accept="application/pdf">
          <div id="resumeStatus_${profile.id}"></div> <!-- Display the status of the resume -->
        </div>
        <button type="submit" id="saveOther_${profile.id}">Save Other</button>
      </form>
    </div>
    <div id="Custom_${profile.id}" class="tabcontent">
      <form id="customFieldsForm_${profile.id}">
        <div id="customFieldsContainer_${profile.id}"></div>
        <button type="button" id="addCustomField_${profile.id}">Add Custom Field</button>
        <button type="submit" id="saveCustom_${profile.id}">Save Custom</button>
      </form>
    </div>
  `;
  profileContent.appendChild(content);

  // Add event listeners for form submissions and custom field additions
  const jobFillForm = document.getElementById(`jobFillProfileForm_${profile.id}`);
  if (jobFillForm) {
    jobFillForm.addEventListener('submit', function(event) {
      event.preventDefault();
      saveProfileData(profile.id, 'jobFillProfile');
    });
  }

  const educationForm = document.getElementById(`educationProfileForm_${profile.id}`);
  if (educationForm) {
    educationForm.addEventListener('submit', function(event) {
      event.preventDefault();
      saveProfileData(profile.id, 'educationProfile');
    });
  }

  const workExperienceForm = document.getElementById(`workExperienceProfileForm_${profile.id}`);
  if (workExperienceForm) {
    workExperienceForm.addEventListener('submit', function(event) {
      event.preventDefault();
      saveProfileData(profile.id, 'workExperienceProfile');
    });
  }

  const otherForm = document.getElementById(`otherProfileForm_${profile.id}`);
  if (otherForm) {
    otherForm.addEventListener('submit', function(event) {
      event.preventDefault();
      saveProfileData(profile.id, 'otherProfile');
    });
  }

  const customForm = document.getElementById(`customFieldsForm_${profile.id}`);
  if (customForm) {
    customForm.addEventListener('submit', function(event) {
      event.preventDefault();
      saveCustomFields(profile.id);
    });
  }

  const addCustomFieldButton = document.getElementById(`addCustomField_${profile.id}`);
  if (addCustomFieldButton) {
    addCustomFieldButton.addEventListener('click', function() {
      var customFieldsContainer = document.getElementById(`customFieldsContainer_${profile.id}`);
      var fieldDiv = document.createElement('div');
      var nameLabel = document.createElement('label');
      nameLabel.textContent = 'Field Name';
      var nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.name = 'customFieldName';
      var valueLabel = document.createElement('label');
      valueLabel.textContent = 'Field Value';
      var valueInput = document.createElement('input');
      valueInput.type = 'text';
      valueInput.name = 'customFieldValue';
      var deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.type = 'button';
      deleteButton.className = 'delete-button';
      deleteButton.addEventListener('click', function() {
        customFieldsContainer.removeChild(fieldDiv);
        saveCustomFields(profile.id);
      });
      fieldDiv.appendChild(nameLabel);
      fieldDiv.appendChild(nameInput);
      fieldDiv.appendChild(valueLabel);
      fieldDiv.appendChild(valueInput);
      fieldDiv.appendChild(deleteButton);
      customFieldsContainer.appendChild(fieldDiv);
    });
  }

  // Add event listeners for the tabs
  var tablinks = content.getElementsByClassName('tablinks');
  for (var i = 0; i < tablinks.length; i++) {
    tablinks[i].addEventListener('click', function(event) {
      openTab(event, this.getAttribute('data-tab'));
    });
  }

  // Add event listener to save profile name and description
  const profileNameInput = document.getElementById(`profileName_${profile.id}`);
  profileNameInput.addEventListener('blur', function() {
    profile.name = profileNameInput.value;
    chrome.storage.sync.set({ profiles: profiles }, function() {
      console.log(`Profile name updated to ${profile.name}`);
      // Update the profile tab text
      const profileTab = document.querySelector(`.profile-tab[data-profile="${profile.id}"]`);
      if (profileTab) {
        profileTab.querySelector('.profile-tab-text').textContent = profile.name;
      }
    });
  });
  profileNameInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      profileNameInput.blur();
    }
  });

  const profileDescriptionInput = document.getElementById(`profileDescription_${profile.id}`);
  profileDescriptionInput.addEventListener('blur', function() {
    profile.description = profileDescriptionInput.value;
    chrome.storage.sync.set({ profiles: profiles }, function() {
      console.log(`Profile description updated to ${profile.description}`);
    });
  });
  profileDescriptionInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      profileDescriptionInput.blur();
    }
  });
}
});