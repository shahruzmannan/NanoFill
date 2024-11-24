document.addEventListener("DOMContentLoaded", () => {
  const profileList = document.getElementById("profile-list");

  // Fetch profiles from Chrome Storage
  chrome.storage.sync.get(['profiles'], function(data) {
    const profiles = data.profiles || [];

    profiles.forEach((profile) => {
      const listItem = document.createElement("li");
      listItem.className = "profile-item";

      // Header Row: Profile Name, Apply Button, and Delete Button
      const header = document.createElement("div");
      header.className = "profile-header";

      const profileName = document.createElement("span");
      profileName.textContent = profile.name;
      profileName.className = "profile-name";
      header.appendChild(profileName);

      // Profile Description
      const descriptionWrapper = document.createElement("div");
      descriptionWrapper.className = "profile-description-wrapper";

      const profileDescription = document.createElement("div");
      profileDescription.className = "profile-description";

      // Add profile details in a readable format
      const details = `
        <p><strong>First Name:</strong> ${profile.jobFillProfile.firstName || ''}</p>
        <p><strong>Last Name:</strong> ${profile.jobFillProfile.lastName || ''}</p>
        <p><strong>Email:</strong> ${profile.jobFillProfile.email || ''}</p>
        <p><strong>Phone:</strong> ${profile.jobFillProfile.phone || ''}</p>
        <p><strong>LinkedIn:</strong> ${profile.jobFillProfile.linkedin || ''}</p>
        <p><strong>GitHub:</strong> ${profile.jobFillProfile.github || ''}</p>
      `;
      profileDescription.innerHTML = details;
      descriptionWrapper.appendChild(profileDescription);
      header.appendChild(descriptionWrapper);

      listItem.appendChild(header);

      const actions = document.createElement("div");
      actions.className = "profile-actions";

      const applyButton = document.createElement("button");
      applyButton.textContent = "Apply";
      applyButton.className = "apply-button";
      actions.appendChild(applyButton);

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.className = "delete-button";
      deleteButton.addEventListener("click", () => {
        // Remove profile from DOM
        profileList.removeChild(listItem);

        // Remove profile from Chrome Storage
        const updatedProfiles = profiles.filter(p => p.id !== profile.id);
        chrome.storage.sync.set({ profiles: updatedProfiles }, function() {
          console.log(`Profile ${profile.name} deleted`);
        });
      });
      actions.appendChild(deleteButton);

      listItem.appendChild(actions);

      profileList.appendChild(listItem);
    });
  });

  const settingsButton = document.getElementById("settings-button");
  settingsButton.addEventListener("click", () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("settings.html") });
  });

  const infoButton = document.getElementById("info-button");
  infoButton.addEventListener("click", () => {
    console.log("Info button clicked");
    // Show additional info or help dialog
  });
});