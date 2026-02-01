
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
    // Waveform
    const waveformSelect = document.getElementById('waveform');
    waveformSelect.addEventListener('change', (e) => {
        const val = parseInt(e.target.value);
        if (patch) patch.sendParameterValue("waveform", val);
    });

    // Volume
    volSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        currentVol = val;
        updateLabels();
        // The parameter name in Cmajor graph is "volume"
        if (patch) patch.sendParameterValue("volume", val);
    });

    // ADSR
    const adsrParams = ['attack', 'decay', 'sustain', 'release'];
    adsrParams.forEach(param => {
        const slider = document.getElementById(param);
        const display = document.getElementById(`${param}-val`);
        
        slider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            display.textContent = (param === 'sustain') ? val.toFixed(2) : `${val.toFixed(2)} s`;
            if (patch) patch.sendParameterValue(`adsr.${param}`, val);
        });
    });

    // Filter
    const filterParams = ['cutoff', 'resonance'];
    filterParams.forEach(param => {
        const slider = document.getElementById(param);
        const display = document.getElementById(`${param}-val`);
        
        slider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            display.textContent = (param === 'cutoff') ? `${val} Hz` : val.toFixed(1);
            if (patch) patch.sendParameterValue(param, val);
        });
    });
    
    // Listen for updates from backend
    if (patch) {
        // We can listen to frequencyOut from MidiHandler if we expose it? 
        // Or just let it be invisible. For now, we update volume only.
        
        patch.addParameterListener("volume", (val) => {
            currentVol = val;
            volSlider.value = val;
            updateLabels();
         });

        patch.addParameterListener("waveform", (val) => {
            waveformSelect.value = val;
        });

        adsrParams.forEach(param => {
            patch.addParameterListener(`adsr.${param}`, (val) => {
                const slider = document.getElementById(param);
                const display = document.getElementById(`${param}-val`);
                slider.value = val;
                display.textContent = (param === 'sustain') ? val.toFixed(2) : `${val.toFixed(2)} s`;
            });
            patch.requestParameterValue(`adsr.${param}`);
        });

        filterParams.forEach(param => {
            patch.addParameterListener(param, (val) => {
                const slider = document.getElementById(param);
                const display = document.getElementById(`${param}-val`);
                slider.value = val;
                display.textContent = (param === 'cutoff') ? `${Math.round(val)} Hz` : val.toFixed(1);
            });
            patch.requestParameterValue(param);
        });
        
        // Request initial state
        patch.requestParameterValue("volume");
        patch.requestParameterValue("waveform");

        // Initialize MIDI
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
        } else {
            console.warn("WebMIDI not supported");
        }
    }

    // MIDI Handling
    function onMIDISuccess(midiAccess) {
        const inputs = midiAccess.inputs.values();
        for (let input of inputs) {
            input.onmidimessage = getMIDIMessage;
        }
        midiAccess.onstatechange = (e) => {
            if (e.port.type === 'input' && e.port.state === 'connected') {
                e.port.onmidimessage = getMIDIMessage;
            }
        };
    }

    function onMIDIFailure() {
        console.warn("Could not access your MIDI devices.");
    }

    function getMIDIMessage(message) {
        const command = message.data[0];
        const note = message.data[1];
        const velocity = (message.data.length > 2) ? message.data[2] : 0;
        
        // Note On (usually 144-159)
        if (command >= 144 && command <= 159 && velocity > 0) {
            noteOn(note, velocity);
        }
        // Note Off (usually 128-143)
        else if ((command >= 128 && command <= 143) || (command >= 144 && command <= 159 && velocity === 0)) {
            noteOff(note);
        }
    }

    let activeNote = null;

    function noteOn(note, velocity) {
        const freq = 440 * Math.pow(2, (note - 69) / 12);
        activeNote = note;
        if (patch) {
            patch.sendParameterValue("frequency", freq);
            patch.sendParameterValue("gate", 1.0);
        }
        // Sync monitor
        freqSlider.value = freq;
        currentFreq = freq;
        updateLabels();

        // Visual Feedback
        const keyElement = document.querySelector(`.key[data-note="${note}"]`);
        if (keyElement) keyElement.classList.add('active');
    }

    function noteOff(note) {
        // Visual Feedback
        const keyElement = document.querySelector(`.key[data-note="${note}"]`);
        if (keyElement) keyElement.classList.remove('active');

        if (activeNote === note) {
            if (patch) {
                patch.sendParameterValue("gate", 0.0);
            }
            activeNote = null;
        }
    }

    // Virtual Keyboard (Mouse/Touch)
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        const note = parseInt(key.dataset.note);
        
        // Mouse Down / Touch Start
        key.addEventListener('mousedown', (e) => {
            e.preventDefault(); // Prevent text selection
            noteOn(note, 100);
        });
        
        // Mouse Up / Mouse Leave / Touch End
        key.addEventListener('mouseup', () => noteOff(note));
        key.addEventListener('mouseleave', () => {
             // Only note off if this key was the active one to prevent sticking
             // But simple approach: just note off. 
             // Ideally we track if mouse button is down.
             // For simplicity in this demo, mouse leave triggers note off.
             noteOff(note); 
        });
    });

    // PC Keyboard Support
    const keyMap = {
        'a': 48, // C (C3)
        'w': 49, // C#
        's': 50, // D
        'e': 51, // D#
        'd': 52, // E
        'f': 53, // F
        't': 54, // F#
        'g': 55, // G
        'y': 56, // G#
        'h': 57, // A
        'u': 58, // A#
        'j': 59, // B
        'k': 60, // C (C4)
        'o': 61, // C#
        'l': 62, // D
        'p': 63, // D#
        ';': 64  // E
    };

    let activeKeys = new Set();

    window.addEventListener('keydown', (e) => {
        if (e.repeat) return;
        const key = e.key.toLowerCase();
        if (keyMap[key]) {
            const note = keyMap[key];
            if (!activeKeys.has(key)) {
                activeKeys.add(key);
                noteOn(note, 100);
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (keyMap[key]) {
            const note = keyMap[key];
            activeKeys.delete(key);
            noteOff(note);
        }
    });
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
