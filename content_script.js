// Detect autofill input fields (same logic as before)
const detectAutofillFields = () => {
  const inputs = document.querySelectorAll('input, select, textarea');
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
    const name = input.getAttribute('name');
    const id = input.getAttribute('id');
    const placeholder = input.getAttribute('placeholder');
    const type = input.getAttribute('type');

    // Check if the input field matches the typical patterns for personal data
    if (
      Object.values(fieldPatterns).some((pattern) => pattern.test(name || id || placeholder || type))
    ) {
      autofillFields.push(input);
    }

    // Optionally, check for placeholder attribute text to hint at the data type
    if (placeholder && /name|email|address|phone/.test(placeholder.toLowerCase())) {
      autofillFields.push(input);
    }

    // Check for specific input types that usually correspond to personal data
    if (type === 'email' || type === 'tel' || type === 'text') {
      autofillFields.push(input);
    }
  });

  return autofillFields;
};

// Function to create a popup-action
const createPopupAction = (input) => {
  // Fetch profiles from Chrome Storage
  chrome.storage.sync.get(['profiles'], function(data) {
    const profiles = data.profiles || [];

    // Create a popup-action div
    const popupAction = document.createElement('div');
    popupAction.classList.add('popup-action');
    
    // Add actions to the popup-action (you can modify the actions as needed)
    let profileOptions = '<option value="">Select Profile</option>';
    profiles.forEach(profile => {
      profileOptions += `<option value="${profile.id}">${profile.name}</option>`;
    });

    popupAction.innerHTML = `
      <select class="popup-action-select">
        ${profileOptions}
      </select>
      <button class="popup-action-button" id="action-clear">Clear</button>
    `;
    
    // Append the popup-action to the body
    document.body.appendChild(popupAction);

    // Position the popup-action near the input field
    const inputRect = input.getBoundingClientRect();
    const popupWidth = popupAction.offsetWidth;
    const popupHeight = popupAction.offsetHeight;
    
    popupAction.style.position = 'absolute';
    popupAction.style.top = `${inputRect.top + window.scrollY + inputRect.height + 8}px`; // 8px gap from the input
    popupAction.style.left = `${inputRect.left + window.scrollX + (inputRect.width / 2) - (popupWidth / 2)}px`; // Centered

    // Handle profile selection
    const profileSelect = popupAction.querySelector('.popup-action-select');
    profileSelect.addEventListener('change', function() {
      const selectedProfileId = this.value;
      const selectedProfile = profiles.find(profile => profile.id === selectedProfileId);
      if (selectedProfile) {
        autofillInputFields(selectedProfile);
      }
    });
  });
};

// Function to autofill input fields with selected profile data
const autofillInputFields = (profile) => {
  const autofillInputs = detectAutofillFields();
  autofillInputs.forEach(input => {
    const name = input.getAttribute('name');
    if (name && profile.jobFillProfile[name]) {
      input.value = profile.jobFillProfile[name];
    }
  });
};

// Function to remove the popup-action
const removePopupAction = () => {
  const existingPopupAction = document.querySelector('.popup-action');
  if (existingPopupAction) {
    existingPopupAction.remove();
  }
};

valid_responses = "username, first_name, last_name, full_name, phone_number, state, address_line_one"

chrome.runtime.sendMessage({ type: "UPDATE", message: valid_responses}, (response) => {
  console.log("Response from background:", response);
  aiSuggestions[input] = response;
});

// Add event listeners for detecting clicks on autofill fields and get the AI's opinion on them
const autofillInputs = detectAutofillFields();
let aiSuggestions = {};

autofillInputs.forEach((input) => {
  console.log(input);
  chrome.runtime.sendMessage({ type: "QUERRY", message: input.outerHTML}, (response) => {
    console.log("Response from background:", response);
    aiSuggestions[input] = response;
  });
  input.addEventListener('click', () => {
    // Remove any existing popup-action before showing a new one
    removePopupAction();

    // Create and show the popup-action for this input field
    createPopupAction(input);
  });
});

// Optional: You can handle popup-action button clicks here
document.body.addEventListener('click', (event) => {
  if (event.target.classList.contains('popup-action-button')) {
    const action = event.target.id;
    if (action === 'action-clear') {
      const input = document.querySelector('input:focus');
      if (input) {
        input.value = '';
      }
    }
  }

  // Close the popup-action if clicking outside the popup-action or input field
  if (!event.target.closest('.popup-action') && !event.target.closest('input')) {
    removePopupAction();
  }
});