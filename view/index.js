
// view/index.js

class Knob {
    constructor(id, label, min, max, initial, updateCallback) {
        this.id = id;
        this.label = label;
        this.min = min;
        this.max = max;
        this.value = initial;
        this.updateCallback = updateCallback;
        
        this.dom = document.createElement('div');
        this.dom.className = 'knob-container';
        this.dom.innerHTML = `
            <div class="knob-swivel" id="${id}-swivel"></div>
            <div class="knob-label">${label}</div>
            <div class="knob-value" id="${id}-val">${initial.toFixed(2)}</div>
        `;

        this.swivel = this.dom.querySelector('.knob-swivel');
        this.valDisplay = this.dom.querySelector('.knob-value');
        
        this.setupInteractions();
        this.updateUI();
    }

    updateUI() {
        const percent = (this.value - this.min) / (this.max - this.min);
        const rotation = -150 + (percent * 300); // -150 to 150 degrees
        this.swivel.style.transform = `rotate(${rotation}deg)`;
        this.valDisplay.textContent = this.value.toFixed(this.max > 100 ? 0 : 2);
    }

    setupInteractions() {
        let startY;
        let startValue;

        const onMouseMove = (e) => {
            const dy = startY - e.clientY;
            const range = this.max - this.min;
            const sensitivity = range / 200; // 200 pixels for full range
            let newValue = startValue + (dy * sensitivity);
            newValue = Math.max(this.min, Math.min(this.max, newValue));
            
            if (this.value !== newValue) {
                this.value = newValue;
                this.updateUI();
                this.updateCallback(this.value);
            }
        };

        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        this.swivel.addEventListener('mousedown', (e) => {
            startY = e.clientY;
            startValue = this.value;
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
            e.preventDefault();
        });
    }

    setValue(v) {
        this.value = v;
        this.updateUI();
    }
}

class BasicSynthView extends HTMLElement {
    constructor(patchConnection) {
        super();
        this.patchConnection = patchConnection;
        this.knobs = {};
        
        // Shadow DOM for style isolation
        const shadow = this.attachShadow({ mode: 'open' });
        
        // Link CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'view/style.css';
        shadow.appendChild(link);

        // UI Container
        this.root = document.createElement('div');
        this.root.id = 'synth-root';
        shadow.appendChild(this.root);

        this.renderLayout();
    }

    renderLayout() {
        this.root.innerHTML = `
            <div class="visualizer-area">
                <!-- Visualizers will be implemented later -->
                <div style="padding: 20px; color: #444; font-size: 11px;">VISUALIZER AREA (Coming soon...)</div>
            </div>
            <div class="control-panel">
                <div class="module mod-vco">
                    <div class="module-header">Oscillator</div>
                    <div class="module-controls" id="controls-vco"></div>
                </div>
                <div class="module mod-vcf">
                    <div class="module-header">Filter</div>
                    <div class="module-controls" id="controls-vcf"></div>
                </div>
                <div class="module mod-env">
                    <div class="module-header">Envelope</div>
                    <div class="module-controls" id="controls-env"></div>
                </div>
                <div class="module mod-lfo">
                    <div class="module-header">LFO</div>
                    <div class="module-controls" id="controls-lfo"></div>
                </div>
            </div>
        `;

        this.initKnobs();
    }

    addKnob(parent, id, label, min, max, initial, paramName) {
        const knob = new Knob(id, label, min, max, initial, (val) => {
            this.patchConnection.sendParameterValue(paramName, val);
        });
        parent.appendChild(knob.dom);
        this.knobs[paramName] = knob;
        
        // Listener for changes from automation/backend
        this.patchConnection.addParameterListener(paramName, (val) => {
            knob.setValue(val);
        });
        this.patchConnection.requestParameterValue(paramName);
    }

    initKnobs() {
        const vco = this.root.querySelector('#controls-vco');
        const vcf = this.root.querySelector('#controls-vcf');
        const env = this.root.querySelector('#controls-env');
        const lfo = this.root.querySelector('#controls-lfo');

        // Oscillator (Note: Waveform is a switch, but using Knob for Pulse Width)
        this.addKnob(vco, 'pw', 'Pulse Width', 0.01, 0.99, 0.5, 'pulseWidth');
        this.addKnob(vco, 'vol', 'Master Vol', 0.0, 1.0, 0.5, 'volume');

        // Filter
        this.addKnob(vcf, 'cutoff', 'Cutoff', 20, 10000, 2000, 'cutoff');
        this.addKnob(vcf, 'res', 'Res', 0.1, 10.0, 1.0, 'resonance');

        // Envelope
        this.addKnob(env, 'a', 'Attack', 0.0, 5.0, 0.1, 'attack');
        this.addKnob(env, 'd', 'Decay', 0.0, 5.0, 0.1, 'decay');
        this.addKnob(env, 's', 'Sustain', 0.0, 1.0, 1.0, 'sustain');
        this.addKnob(env, 'r', 'Release', 0.0, 5.0, 0.1, 'release');

        // LFO
        this.addKnob(lfo, 'lfo-r', 'LFO Rate', 0.1, 20.0, 1.0, 'lfoRate');
        this.addKnob(lfo, 'lfo-d', 'LFO Depth', 0.0, 2000.0, 0.0, 'lfoDepth');
    }
}

export default function createPatchView(patchConnection) {
    if (!window.customElements.get("basic-synth-view")) {
        window.customElements.define("basic-synth-view", BasicSynthView);
    }
    return new BasicSynthView(patchConnection);
}
