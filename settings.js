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

// Set default tab to be open
document.addEventListener('DOMContentLoaded', async function() {
  var tablinks = document.getElementsByClassName('tablinks');
  for (var i = 0; i < tablinks.length; i++) {
    tablinks[i].addEventListener('click', function(event) {
      openTab(event, this.getAttribute('data-tab'));
    });
  }
  tablinks[0].click();

  chrome.storage.sync.get(['jobFillProfile', 'educationProfile', 'workExperienceProfile', 'otherProfile', 'customFields', 'resumeHandle'], async function(data) {
    if (data.jobFillProfile) {
      document.getElementById('prefix').value = data.jobFillProfile.prefix;
      document.getElementById('firstName').value = data.jobFillProfile.firstName;
      document.getElementById('middleName').value = data.jobFillProfile.middleName;
      document.getElementById('lastName').value = data.jobFillProfile.lastName;
      document.getElementById('address').value = data.jobFillProfile.address;
      document.getElementById('city').value = data.jobFillProfile.city;
      document.getElementById('state').value = data.jobFillProfile.state;
      document.getElementById('postalCode').value = data.jobFillProfile.postalCode;
      document.getElementById('country').value = data.jobFillProfile.country;
      document.getElementById('email').value = data.jobFillProfile.email;
      document.getElementById('phone').value = data.jobFillProfile.phone;
      document.getElementById('nationality').value = data.jobFillProfile.nationality;
      document.getElementById('linkedin').value = data.jobFillProfile.linkedin;
      document.getElementById('twitter').value = data.jobFillProfile.twitter;
      document.getElementById('github').value = data.jobFillProfile.github;
      document.getElementById('website').value = data.jobFillProfile.website;
      document.getElementById('gender').value = data.jobFillProfile.gender;
    }
    if (data.educationProfile) {
      document.getElementById('school').value = data.educationProfile.school;
      document.getElementById('degree').value = data.educationProfile.degree;
      document.getElementById('major').value = data.educationProfile.major;
      document.getElementById('startDate').value = data.educationProfile.startDate;
      document.getElementById('endDate').value = data.educationProfile.endDate;
    }
    if (data.workExperienceProfile) {
      document.getElementById('company').value = data.workExperienceProfile.company;
      document.getElementById('jobTitle').value = data.workExperienceProfile.jobTitle;
      document.getElementById('workStartDate').value = data.workExperienceProfile.workStartDate;
      document.getElementById('workEndDate').value = data.workExperienceProfile.workEndDate;
      document.getElementById('description').value = data.workExperienceProfile.description;
    }
    if (data.otherProfile) {
      document.getElementById('currentSalary').value = data.otherProfile.currentSalary;
      document.getElementById('expectedSalary').value = data.otherProfile.expectedSalary;
      document.getElementById('noticePeriod').value = data.otherProfile.noticePeriod;
      document.getElementById('earliestAvailableDate').value = data.otherProfile.earliestAvailableDate;
      document.getElementById('coverLetter').value = data.otherProfile.coverLetter;
      document.getElementById('genderIdentity').value = data.otherProfile.genderIdentity;
      document.getElementById('raceEthnicity').value = data.otherProfile.raceEthnicity;
      document.getElementById('sexualOrientation').value = data.otherProfile.sexualOrientation;
      document.getElementById('disabilityStatus').value = data.otherProfile.disabilityStatus;
      document.getElementById('veteranStatus').value = data.otherProfile.veteranStatus;
    }
    if (data.customFields) {
      const customFieldsContainer = document.getElementById('customFieldsContainer');
      data.customFields.forEach((field, index) => {
        const fieldDiv = document.createElement('div');
        const nameLabel = document.createElement('label');
        nameLabel.textContent = 'Field Name';
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.name = 'customFieldName';
        nameInput.value = field.name || '';
        const valueLabel = document.createElement('label');
        valueLabel.textContent = 'Field Value';
        const valueInput = document.createElement('input');
        valueInput.type = 'text';
        valueInput.name = 'customFieldValue';
        valueInput.value = field.value || '';
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.type = 'button';
        deleteButton.addEventListener('click', function() {
          customFieldsContainer.removeChild(fieldDiv);
          saveCustomFields();
        });
        fieldDiv.appendChild(nameLabel);
        fieldDiv.appendChild(nameInput);
        fieldDiv.appendChild(valueLabel);
        fieldDiv.appendChild(valueInput);
        fieldDiv.appendChild(deleteButton);
        customFieldsContainer.appendChild(fieldDiv);
      });
    }
    if (data.resumeHandle) {
      const resumeHandle = await getFileHandle(data.resumeHandle);
      if (resumeHandle) {
        document.getElementById('resumeStatus').textContent = 'Resume/CV is saved.';
      }
    }
  });
});

document.getElementById('jobFillForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const formData = {
    prefix: document.getElementById('prefix').value,
    firstName: document.getElementById('firstName').value,
    middleName: document.getElementById('middleName').value,
    lastName: document.getElementById('lastName').value,
    address: document.getElementById('address').value,
    city: document.getElementById('city').value,
    state: document.getElementById('state').value,
    postalCode: document.getElementById('postalCode').value,
    country: document.getElementById('country').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    nationality: document.getElementById('nationality').value,
    linkedin: document.getElementById('linkedin').value,
    twitter: document.getElementById('twitter').value,
    github: document.getElementById('github').value,
    website: document.getElementById('website').value,
    gender: document.getElementById('gender').value
  };

  chrome.storage.sync.set({ jobFillProfile: formData }, function() {
    alert('Settings saved');
  });
});

document.getElementById('educationForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const educationData = {
    school: document.getElementById('school').value,
    degree: document.getElementById('degree').value,
    major: document.getElementById('major').value,
    startDate: document.getElementById('startDate').value,
    endDate: document.getElementById('endDate').value
  };

  chrome.storage.sync.set({ educationProfile: educationData }, function() {
    alert('Education saved');
  });
});

document.getElementById('workExperienceForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const workExperienceData = {
    company: document.getElementById('company').value,
    jobTitle: document.getElementById('jobTitle').value,
    workStartDate: document.getElementById('workStartDate').value,
    workEndDate: document.getElementById('workEndDate').value,
    description: document.getElementById('description').value
  };

  chrome.storage.sync.set({ workExperienceProfile: workExperienceData }, function() {
    alert('Work Experience saved');
  });
});

document.getElementById('otherForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const otherData = {
    currentSalary: document.getElementById('currentSalary').value,
    expectedSalary: document.getElementById('expectedSalary').value,
    noticePeriod: document.getElementById('noticePeriod').value,
    earliestAvailableDate: document.getElementById('earliestAvailableDate').value,
    coverLetter: document.getElementById('coverLetter').value,
    genderIdentity: document.getElementById('genderIdentity').value,
    raceEthnicity: document.getElementById('raceEthnicity').value,
    sexualOrientation: document.getElementById('sexualOrientation').value,
    disabilityStatus: document.getElementById('disabilityStatus').value,
    veteranStatus: document.getElementById('veteranStatus').value
  };

  chrome.storage.sync.set({ otherProfile: otherData }, function() {
    alert('Other settings saved');
  });
});

document.getElementById('resume').addEventListener('change', async function(event) {
  const file = event.target.files[0];
  if (file) {
    const fileHandle = await window.showSaveFilePicker({
      suggestedName: file.name,
      types: [{
        description: 'PDF Files',
        accept: { 'application/pdf': ['.pdf'] }
      }]
    });
    const writableStream = await fileHandle.createWritable();
    await writableStream.write(file);
    await writableStream.close();
    const resumeHandle = await getFileHandle(fileHandle);
    chrome.storage.sync.set({ resumeHandle: resumeHandle }, function() {
      document.getElementById('resumeStatus').textContent = 'Resume/CV is saved.';
      alert('Resume/CV saved');
    });
  }
});

document.getElementById('addCustomField').addEventListener('click', function() {
  const customFieldsContainer = document.getElementById('customFieldsContainer');
  const fieldDiv = document.createElement('div');
  const nameLabel = document.createElement('label');
  nameLabel.textContent = 'Field Name';
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.name = 'customFieldName';
  const valueLabel = document.createElement('label');
  valueLabel.textContent = 'Field Value';
  const valueInput = document.createElement('input');
  valueInput.type = 'text';
  valueInput.name = 'customFieldValue';
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.type = 'button';
  deleteButton.addEventListener('click', function() {
    customFieldsContainer.removeChild(fieldDiv);
    saveCustomFields();
  });
  fieldDiv.appendChild(nameLabel);
  fieldDiv.appendChild(nameInput);
  fieldDiv.appendChild(valueLabel);
  fieldDiv.appendChild(valueInput);
  fieldDiv.appendChild(deleteButton);
  customFieldsContainer.appendChild(fieldDiv);
});

document.getElementById('customForm').addEventListener('submit', function(event) {
  event.preventDefault();

  saveCustomFields();
});

function saveCustomFields() {
  const customFields = [];
  const customFieldsContainer = document.getElementById('customFieldsContainer');
  const customFieldDivs = customFieldsContainer.getElementsByTagName('div');
  for (let i = 0; i < customFieldDivs.length; i++) {
    const nameInput = customFieldDivs[i].getElementsByTagName('input')[0];
    const valueInput = customFieldDivs[i].getElementsByTagName('input')[1];
    customFields.push({ name: nameInput.value, value: valueInput.value });
  }

  chrome.storage.sync.set({ customFields: customFields }, function() {
    alert('Custom fields saved');
  });
}

async function getFileHandle(handle) {
  try {
    const fileHandle = await handle.getFile();
    return fileHandle;
  } catch (error) {
    console.error('Error accessing file handle:', error);
    return null;
  }
}