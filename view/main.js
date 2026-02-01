
// DOM Elements
const freqSlider = document.getElementById('freq');
const volSlider = document.getElementById('vol');
const freqVal = document.getElementById('freq-val');
const volVal = document.getElementById('vol-val');

// Initialize with defaults
let currentFreq = 440;
let currentVol = 0.5;

// Helper to update UI text
function updateLabels() {
    freqVal.textContent = `${Math.round(currentFreq)} Hz`;
    volVal.textContent = currentVol.toFixed(2);
}

// Setup interactions
function setupControls(patch) {
    // Frequency
    freqSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        currentFreq = val;
        updateLabels();
        if (patch) patch.sendParameterValue("frequencyIn", val);
    });

    // Volume
    volSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        currentVol = val;
        updateLabels();
        if (patch) patch.sendParameterValue("volume", val);
    });
    
    // Listen for updates from backend
    if (patch) {
        patch.addParameterListener("frequencyIn", (val) => {
            currentFreq = val;
            freqSlider.value = val;
            updateLabels();
        });
        
        patch.addParameterListener("volume", (val) => {
            currentVol = val;
            volSlider.value = val;
            updateLabels();
        });
        
        // Request initial state
        patch.requestParameterValue("frequencyIn");
        patch.requestParameterValue("volume");
    }
}

// Entry point
if (window.patch) {
    setupControls(window.patch);
} else {
    // Handle the case where the script loads before the patch object is injected
    // or if the view is being developed in a browser without Cmajor.
    console.log("Waiting for Cmajor patch...");
    
    // Fallback for standard web browser preview
    setupControls(null); 
}
