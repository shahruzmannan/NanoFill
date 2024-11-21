document.getElementById("saveSettings").addEventListener("click", () => {
    const setting1 = document.getElementById("setting1").checked;
    const setting2 = document.getElementById("setting2").checked;
  
    // Save settings using chrome.storage
    chrome.storage.local.set({ setting1, setting2 }, () => {
      alert("Settings saved!");
    });
  });
  
  // Load saved settings when the settings page is opened
  document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get(["setting1", "setting2"], (result) => {
      if (result.setting1 !== undefined) {
        document.getElementById("setting1").checked = result.setting1;
      }
      if (result.setting2 !== undefined) {
        document.getElementById("setting2").checked = result.setting2;
      }
    });
  });
  