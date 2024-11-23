document.addEventListener("DOMContentLoaded", () => {
  const profileList = document.getElementById("profile-list");

  // Fetch profiles from Chrome Storage
  chrome.storage.sync.get(['profiles'], function(data) {
    const profiles = data.profiles || [];

    profiles.forEach((profile) => {
      const listItem = document.createElement("li");

      // Header Row: Profile Name, Apply Button, and Delete Button
      const header = document.createElement("div");
      header.className = "profile-header";

      const profileName = document.createElement("div");
      profileName.textContent = profile.name;
      header.appendChild(profileName);

      const applyButton = document.createElement("button");
      applyButton.textContent = "Apply";
      applyButton.className = "apply-button";
      header.appendChild(applyButton);

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
      header.appendChild(deleteButton);

      listItem.appendChild(header);

      // Profile Description
      const descriptionWrapper = document.createElement("div");
      const profileDescription = document.createElement("pre"); // Use <pre> to preserve formatting
      profileDescription.textContent = JSON.stringify(profile, null, 2);
      profileDescription.className = "profile-description";
      descriptionWrapper.appendChild(profileDescription);

      // "More" Button
      if (profileDescription.textContent.length > 100) {
        const moreButton = document.createElement("button");
        moreButton.textContent = "More";
        moreButton.className = "more-button";

        moreButton.addEventListener("click", () => {
          const isExpanded = profileDescription.classList.toggle("expanded");
          moreButton.textContent = isExpanded ? "Less" : "More";
        });

        descriptionWrapper.appendChild(moreButton);
      }

      listItem.appendChild(descriptionWrapper);
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

// Optional dynamic theming support
document.documentElement.style.setProperty("--md-color-primary", "#6750A4");
document.documentElement.style.setProperty("--md-color-on-primary", "#ffffff");
document.documentElement.style.setProperty("--md-color-primary-container", "#D0BCFF");
document.documentElement.style.setProperty("--md-color-surface", "#ffffff");
document.documentElement.style.setProperty("--md-color-secondary", "#6750A4");