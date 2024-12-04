## Setup
These steps assume that your Chrome is fully up to date, that PromptAPI is still supported in the same way that it was as of December 3, 2024, and that you have not used PromptAPI on this instance of your browser before.
<ol>
<li>Go to <code>chrome://flags</code> and set the flag "Enables optimization guide on device" to <code>Enabled BypassPerfRequirement</code> and the flag "Prompt API for Gemini Nano" to <code>Enabled</code>.</li>
<li>Add the extension to your browser by going to <code>chrome://extensions</code>, turning on developer mode in the top right hand corner, clicking "load unpacked", and then uploading this file's parent directory (assuming you haven't moved it since downloading the repo).</li>
<li>Wait. Though Gemini Nano runs locally, the model still has to be downloaded the first time you use it, so make sure you're connected to internet for this step.</li>
</ol>


## Documentation
icons/ : folder containing icons

background.js: JS script file to run general ‘back-end logic’, e.g. Gemini API

content_script.css: UI for window that pops up below the input field

content_script.js: JS script file for the logic of `content_script.css`

manifest.json: Main configuration file of the extension

popup.css/popup.html: UI for window that pops up when user presses on extension icon at the headbar of the browser

popup.js: JS script file for the logic of `popup.css` and `popup.html`

settings.css/settings.html: UI for the settings window

settings.js: JS script file for the logic `settings.css` and `settings.json`
