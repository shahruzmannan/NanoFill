document.addEventListener("DOMContentLoaded", () => {
    const profiles = [
        {
          id: 1,
          name: "Personal Profile",
          description: "This profile is used for personal and family-related transactions. It contains your home address, personal email, and phone number."
        },
        {
          id: 2,
          name: "Work Profile",
          description: "This profile is designed for work-related activities. It includes your work address, office email, and relevant contact information for professional use."
        },
        {
          id: 3,
          name: "Shopping Profile",
          description: "A dedicated profile for online shopping. Includes your preferred shipping address, payment methods, and email for order confirmations."
        }
      ];
  
    const profileList = document.getElementById("profile-list");
  
    profiles.forEach((profile) => {
        const listItem = document.createElement("li");
    
        // Header Row: Profile Name and Apply Button
        const header = document.createElement("div");
        header.className = "profile-header";
    
        const profileName = document.createElement("div");
        profileName.textContent = profile.name;
        header.appendChild(profileName);
    
        const applyButton = document.createElement("button");
        applyButton.textContent = "Apply";
        applyButton.className = "apply-button";
        header.appendChild(applyButton);
    
        listItem.appendChild(header);
    
        // Profile Description
        const descriptionWrapper = document.createElement("div");
        const profileDescription = document.createElement("p");
        profileDescription.textContent = profile.description;
        profileDescription.className = "profile-description";
        descriptionWrapper.appendChild(profileDescription);
    
        // "More" Button
        if (profile.description.length > 100) {
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
  
    const settingsButton = document.getElementById("settings-button");
    settingsButton.addEventListener("click", () => {
      console.log("#################### Settings button clicked");
      // Open settings page or popup
    });
  
    const infoButton = document.getElementById("info-button");
    infoButton.addEventListener("click", () => {
      console.log("#################### Info button clicked");
      // Show additional info or help dialog
    });
  });

document.getElementById("settings-button").addEventListener("click", () => {
    // Open the local settings page in a new tab
    chrome.tabs.create({ url: chrome.runtime.getURL("settings.html") });
});
  

  // Optional dynamic theming support
document.documentElement.style.setProperty("--md-color-primary", "#6750A4");
document.documentElement.style.setProperty("--md-color-on-primary", "#ffffff");
document.documentElement.style.setProperty("--md-color-primary-container", "#D0BCFF");
document.documentElement.style.setProperty("--md-color-surface", "#ffffff");
document.documentElement.style.setProperty("--md-color-secondary", "#6750A4");
