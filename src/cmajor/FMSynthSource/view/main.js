
// FM Synth main.js

// DOM Elements
const volSlider = document.getElementById('vol');
const volVal = document.getElementById('vol-val');

// Initialize with defaults
let currentVol = 0.3;

// Helper to update UI text
function updateLabels() {
    volVal.textContent = currentVol.toFixed(2);
}

// Setup interactions
function setupControls(patch) {
    // Volume
    volSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        currentVol = val;
        updateLabels();
        if (patch) patch.sendParameterValue("volume", val);
    });

    // FM Parameters
    const fmParams = ['carrierRatio', 'modulatorRatio', 'fmIndex'];
    fmParams.forEach(param => {
        const slider = document.getElementById(param);
        const display = document.getElementById(`${param}-val`);
        
        slider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            display.textContent = val.toFixed(2);
            if (patch) patch.sendParameterValue(param, val);
        });
    });

    // ADSR
    const adsrParams = ['attack', 'decay', 'sustain', 'release'];
    adsrParams.forEach(param => {
        const slider = document.getElementById(param);
        const display = document.getElementById(`${param}-val`);
        
        slider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            display.textContent = (param === 'sustain') ? val.toFixed(2) : `${val.toFixed(2)} s`;
            if (patch) patch.sendParameterValue(param, val);
        });
    });
    
    // Listen for updates from backend
    if (patch) {
        patch.addParameterListener("volume", (val) => {
            currentVol = val;
            volSlider.value = val;
            updateLabels();
         });

        fmParams.forEach(param => {
            patch.addParameterListener(param, (val) => {
                const slider = document.getElementById(param);
                const display = document.getElementById(`${param}-val`);
                slider.value = val;
                display.textContent = val.toFixed(2);
            });
            patch.requestParameterValue(param);
        });

        adsrParams.forEach(param => {
            patch.addParameterListener(param, (val) => {
                const slider = document.getElementById(param);
                const display = document.getElementById(`${param}-val`);
                slider.value = val;
                display.textContent = (param === 'sustain') ? val.toFixed(2) : `${val.toFixed(2)} s`;
            });
            patch.requestParameterValue(param);
        });
        
        // Request initial state
        patch.requestParameterValue("volume");

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
        const [status, data1, data2] = message.data;
        
        // MIDI data is already in the right format, just send the raw int32
        const packedMIDI = (status << 16) | (data1 << 8) | data2;
        if (patch) {
            patch.sendEventOrValue("midiIn", packedMIDI);
        }

        // Visual Feedback for keyboard
        const command = status & 0xF0;
        const note = data1;
        const velocity = data2;

        if (command === 0x90 && velocity > 0) {
            // Note On
            const keyElement = document.querySelector(`.key[data-note="${note}"]`);
            if (keyElement) keyElement.classList.add('active');
        } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
            // Note Off
            const keyElement = document.querySelector(`.key[data-note="${note}"]`);
            if (keyElement) keyElement.classList.remove('active');
        }
    }

    // Virtual Keyboard (Mouse/Touch)
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        const note = parseInt(key.dataset.note);
        
        const noteOn = () => {
            const packedMIDI = (0x90 << 16) | (note << 8) | 100;
            if (patch) {
                patch.sendEventOrValue("midiIn", packedMIDI);
            }
            key.classList.add('active');
        };

        const noteOff = () => {
            const packedMIDI = (0x80 << 16) | (note << 8) | 0;
            if (patch) {
                patch.sendEventOrValue("midiIn", packedMIDI);
            }
            key.classList.remove('active');
        };
        
        key.addEventListener('mousedown', (e) => {
            e.preventDefault();
            noteOn();
        });
        
        key.addEventListener('mouseup', noteOff);
        key.addEventListener('mouseleave', noteOff);
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
                const packedMIDI = (0x90 << 16) | (note << 8) | 100;
                if (patch) {
                    patch.sendEventOrValue("midiIn", packedMIDI);
                }
                const keyElement = document.querySelector(`.key[data-note="${note}"]`);
                if (keyElement) keyElement.classList.add('active');
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (keyMap[key]) {
            const note = keyMap[key];
            activeKeys.delete(key);
            const packedMIDI = (0x80 << 16) | (note << 8) | 0;
            if (patch) {
                patch.sendEventOrValue("midiIn", packedMIDI);
            }
            const keyElement = document.querySelector(`.key[data-note="${note}"]`);
            if (keyElement) keyElement.classList.remove('active');
        }
    });
}

// Entry point
if (window.patch) {
    setupControls(window.patch);
} else {
    console.log("Waiting for Cmajor patch...");
    setupControls(null); 
}
