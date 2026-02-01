
// view/index.js - Wavetable Synth View (Redesigned)

console.log("--- WAVETABLE SYNTH VIEW STARTED ---");

// Inline CSS
const STYLES = `
* { box-sizing: border-box; }
:host { display: block; width: 100%; height: 100%; }
:root { --bg-color: #050505; --panel-color: #121212; --accent-purple: #a855f7; --accent-pink: #ec4899; --accent-green: #3ce63c; }
body { margin: 0; padding: 0; background-color: #000; color: #fff; font-family: sans-serif; overflow: hidden; }
#synth-root { width: 100%; height: 100%; display: flex; flex-direction: column; background: #111; }

/* 3-Column Layout */
.main-area { flex: 1; display: flex; flex-direction: column; }
.viz-row { flex: 1; display: flex; gap: 2px; padding: 5px; background: #050505; }
.control-row { height: 250px; display: flex; gap: 2px; padding: 5px; background: #151515; }

/* Section Styling */
.section { flex: 1; display: flex; flex-direction: column; border: 1px solid #333; background: #1a1a1a; margin: 2px; overflow: hidden; }
.section-header { background: #222; padding: 4px 8px; font-size: 10px; font-weight: bold; color: #888; text-transform: uppercase; letter-spacing: 1px; }
.section-content { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 8px; position: relative; }

/* Viz Containers */
.viz-canvas { width: 100%; height: 100%; }
.viz-label { position: absolute; top: 5px; left: 5px; color: #555; font-size: 10px; font-weight: bold; pointer-events: none; z-index: 10; }

/* Controls */
.slider-container { width: 100%; padding: 5px 10px; }
.position-slider { width: 100%; height: 30px; -webkit-appearance: none; background: linear-gradient(to right, #a855f7, #ec4899, #f97316, #3ce63c); border-radius: 15px; outline: none; cursor: pointer; }
.position-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 24px; background: #fff; border-radius: 50%; cursor: grab; box-shadow: 0 0 10px rgba(0,0,0,0.5); }
.position-slider::-moz-range-thumb { width: 24px; height: 24px; background: #fff; border-radius: 50%; cursor: grab; box-shadow: 0 0 10px rgba(0,0,0,0.5); border: none; }
.slider-labels { display: flex; justify-content: space-between; font-size: 9px; color: #666; padding: 2px 5px; }

.knob-row { display: flex; justify-content: center; gap: 15px; padding: 5px; }
.knob-container { display: flex; flex-direction: column; align-items: center; gap: 3px; }
.knob-swivel { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #444, #111); border: 2px solid #666; position: relative; cursor: ns-resize; }
.knob-swivel::after { content: ''; position: absolute; top: 4px; left: calc(50% - 2px); width: 4px; height: 14px; background: #fff; border-radius: 2px; }
.knob-label { font-size: 9px; color: #888; text-transform: uppercase; }
.knob-value { font-size: 10px; color: #fff; background: #000; padding: 1px 4px; border-radius: 2px; font-family: monospace; }

/* LFO Cable Animation */
.cable-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
.cable-pulse { fill: none; stroke: #a855f7; stroke-width: 3; filter: drop-shadow(0 0 5px #a855f7); }
.cable-bg { fill: none; stroke: #333; stroke-width: 2; }

/* Keyboard */
.keyboard-area { height: 100px; background: #111; position: relative; display: flex; padding: 5px 10px; border-top: 1px solid #333; }
.octave { position: relative; display: flex; height: 100%; border-right: 1px solid #000; }
.key { border-radius: 0 0 3px 3px; cursor: pointer; position: relative; user-select: none; }
.key.white { flex: 1; height: 100%; background: #fff; border: 1px solid #000; z-index: 1; }
.key.white.active { background: #ccc; box-shadow: inset 0 0 8px #000; }
.key.black { height: 55%; background: #000; position: absolute; z-index: 2; border: 1px solid #333; border-top: none; }
.key.black.active { background: #444; }

/* Connection indicator */
.connection-dot { width: 8px; height: 8px; border-radius: 50%; background: #a855f7; position: absolute; animation: pulse 1s infinite; }
@keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }
`;

class Knob {
    constructor(id, label, min, max, initial, updateCallback) {
        this.min = min; this.max = max; this.value = initial; this.updateCallback = updateCallback;
        this.dom = document.createElement('div');
        this.dom.className = 'knob-container';
        this.dom.id = id;
        this.dom.innerHTML = `<div class="knob-swivel"></div><div class="knob-label">${label}</div><div class="knob-value">${initial.toFixed(2)}</div>`;
        this.swivel = this.dom.querySelector('.knob-swivel');
        this.valDisplay = this.dom.querySelector('.knob-value');
        this.setupInteractions();
        this.updateUI();
    }
    updateUI() {
        const pct = (this.value - this.min) / (this.max - this.min);
        this.swivel.style.transform = `rotate(${-150 + pct*300}deg)`;
        this.valDisplay.textContent = this.value < 10 && this.value >= 1 ? this.value.toFixed(1) : this.value < 1 ? this.value.toFixed(2) : Math.round(this.value);
    }
    setupInteractions() {
        let startY, startVal;
        const move = (e) => {
            const d = startY - e.clientY;
            let v = startVal + (d * (this.max - this.min) / 200);
            v = Math.max(this.min, Math.min(this.max, v));
            if (v !== this.value) { this.value = v; this.updateUI(); this.updateCallback(v); }
        };
        const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
        this.swivel.addEventListener('mousedown', (e) => {
            startY = e.clientY; startVal = this.value;
            window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
            e.preventDefault();
        });
    }
    setValue(v) { this.value = parseFloat(v); this.updateUI(); }
}

class WavetableSynthView extends HTMLElement {
    constructor(patchConnection) {
        super();
        this.patchConnection = patchConnection;
        this.knobs = {};
        this.viz = { params: { 
            volume: 0.3, 
            wavetablePosition: 0.0,
            morphSpeed: 0.0,
            morphDepth: 0.5,
            attack: 0.1, 
            decay: 0.1, 
            sustain: 0.7, 
            release: 0.3 
        } };
        this.lfoPhase = 0;
        
        const shadow = this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.textContent = STYLES;
        shadow.appendChild(style);
        
        this.root = document.createElement('div');
        this.root.id = 'synth-root';
        shadow.appendChild(this.root);
        
        this.renderLayout();
    }

    connectedCallback() {
        if (this.patchConnection) {
            this.patchConnection.requestParameterValue('volume');
            this.patchConnection.requestParameterValue('wavetablePosition');
            this.patchConnection.requestParameterValue('morphSpeed');
            this.patchConnection.requestParameterValue('morphDepth');
            this.patchConnection.requestParameterValue('attack');
            this.patchConnection.requestParameterValue('decay');
            this.patchConnection.requestParameterValue('sustain');
            this.patchConnection.requestParameterValue('release');
        }
    }

    renderLayout() {
        this.root.innerHTML = `
            <div class="main-area">
                <div class="viz-row">
                    <div class="section">
                        <div class="section-content" id="viz-wave"><div class="viz-label">WAVETABLE OSC</div></div>
                    </div>
                    <div class="section">
                        <div class="section-content" id="viz-lfo"><div class="viz-label">MODULATION / LFO</div></div>
                    </div>
                    <div class="section">
                        <div class="section-content" id="viz-adsr"><div class="viz-label">ENVELOPE</div></div>
                    </div>
                </div>
                <div class="control-row">
                    <div class="section">
                        <div class="section-header">Position</div>
                        <div class="section-content">
                            <div class="slider-container">
                                <input type="range" class="position-slider" id="positionSlider" min="0" max="1" step="0.01" value="0">
                                <div class="slider-labels">
                                    <span>SIN</span><span>SAW</span><span>SQR</span><span>TRI</span>
                                    <span id="pos-val" style="position:absolute; right:10px; top:-15px; font-size:10px; color:#a855f7;">0%</span>
                                </div>
                            </div>
                            <div class="knob-row" id="c-osc"></div>
                        </div>
                    </div>
                    <div class="section">
                        <div class="section-header">LFO → Position</div>
                        <div class="section-content">
                            <div class="knob-row" id="c-lfo"></div>
                        </div>
                    </div>
                    <div class="section">
                        <div class="section-header">ADSR</div>
                        <div class="section-content">
                            <div class="knob-row" id="c-env"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="keyboard-area" id="keyboard"></div>
        `;

        this.initVisualizers();
        this.setupPositionSlider();
        
        // OSC module - Volume only
        const osc = this.root.querySelector('#c-osc');
        this.addKnob(osc, 'Volume', 0, 1, 0.3, 'volume');

        // LFO module - Rate and Depth
        const lfo = this.root.querySelector('#c-lfo');
        this.addKnob(lfo, 'Rate', 0, 10, 0.0, 'morphSpeed');
        this.addKnob(lfo, 'Depth', 0, 1, 0.5, 'morphDepth');

        // ENVELOPE module
        const env = this.root.querySelector('#c-env');
        this.addKnob(env, 'A', 0, 2, 0.1, 'attack');
        this.addKnob(env, 'D', 0, 2, 0.1, 'decay');
        this.addKnob(env, 'S', 0, 1, 0.7, 'sustain');
        this.addKnob(env, 'R', 0, 5, 0.3, 'release');

        this.initKeyboard();
    }

    setupPositionSlider() {
        const slider = this.root.querySelector('#positionSlider');
        const valDisplay = this.root.querySelector('#pos-val');
        
        const update = () => {
            const val = parseFloat(slider.value);
            this.viz.params.wavetablePosition = val;
            if (this.patchConnection) {
                this.patchConnection.sendEventOrValue('wavetablePosition', val);
            }
            if (valDisplay) valDisplay.textContent = Math.round(val * 100) + '%';
        };

        slider.addEventListener('input', update);
        
        // Listen for external changes
        if (this.patchConnection) {
            this.patchConnection.addParameterListener('wavetablePosition', (v) => {
                this.viz.params.wavetablePosition = v;
                slider.value = v;
                if (valDisplay) valDisplay.textContent = Math.round(v * 100) + '%';
            });
        }
    }

    initVisualizers() {
        // Wave visualizer
        const waveContainer = this.root.querySelector('#viz-wave');
        const waveCanvas = document.createElement('canvas');
        waveCanvas.className = 'viz-canvas';
        waveCanvas.width = 300; waveCanvas.height = 120;
        waveContainer.appendChild(waveCanvas);
        this.viz.wave = { ctx: waveCanvas.getContext('2d'), w: 300, h: 120 };

        // LFO visualizer
        const lfoContainer = this.root.querySelector('#viz-lfo');
        const lfoCanvas = document.createElement('canvas');
        lfoCanvas.className = 'viz-canvas';
        lfoCanvas.width = 300; lfoCanvas.height = 120;
        lfoContainer.appendChild(lfoCanvas);
        this.viz.lfo = { ctx: lfoCanvas.getContext('2d'), w: 300, h: 120 };

        // ADSR visualizer
        const adsrContainer = this.root.querySelector('#viz-adsr');
        const adsrCanvas = document.createElement('canvas');
        adsrCanvas.className = 'viz-canvas';
        adsrCanvas.width = 300; adsrCanvas.height = 120;
        adsrContainer.appendChild(adsrCanvas);
        this.viz.adsr = { ctx: adsrCanvas.getContext('2d'), w: 300, h: 120 };

        this.loopViz();
    }

    loopViz() {
        const loop = () => {
            this.drawWavetable();
            this.drawLFO();
            this.drawAdsr();
            requestAnimationFrame(loop);
        };
        loop();
    }

    // Waveform generators
    getSine(p) { return Math.sin(p * 2 * Math.PI); }
    getSaw(p) { return 2.0 * p - 1.0; }
    getSquare(p) { return p < 0.5 ? 1.0 : -1.0; }
    getTriangle(p) { return 4.0 * Math.abs(p - 0.5) - 1.0; }

    getInterpolatedSample(phase, position) {
        const sine = this.getSine(phase);
        const saw = this.getSaw(phase);
        const square = this.getSquare(phase);
        const triangle = this.getTriangle(phase);

        const pos = Math.max(0, Math.min(1, position));
        
        if (pos < 0.333) {
            const t = pos / 0.333;
            return sine * (1 - t) + saw * t;
        } else if (pos < 0.666) {
            const t = (pos - 0.333) / 0.333;
            return saw * (1 - t) + square * t;
        } else {
            const t = (pos - 0.666) / 0.334;
            return square * (1 - t) + triangle * t;
        }
    }

    drawWavetable() {
        const { ctx, w, h } = this.viz.wave;
        ctx.clearRect(0, 0, w, h);
        
        // Draw waveform
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const position = this.viz.params.wavetablePosition || 0;
        
        for (let x = 0; x < w; x++) {
            const phase = x / w;
            const y = this.getInterpolatedSample(phase, position);
            const py = h / 2 - y * (h / 2.5);
            if (x === 0) ctx.moveTo(x, py); else ctx.lineTo(x, py);
        }
        ctx.stroke();
    }

    drawLFO() {
        const { ctx, w, h } = this.viz.lfo;
        ctx.clearRect(0, 0, w, h);
        
        const rate = this.viz.params.morphSpeed || 0;
        const depth = this.viz.params.morphDepth || 0;
        const time = Date.now() / 1000;
        
        // Update LFO phase
        this.lfoPhase = (time * rate) % 1;
        
        const centerY = h * 0.4;
        const maxAmplitude = h * 0.3;
        
        // Draw ghost wave (full amplitude) when depth < 1
        if (depth < 1 && rate > 0) {
            ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let x = 0; x < w; x++) {
                const t = (x / w) * 4 * Math.PI + time * rate * 2 * Math.PI;
                const y = Math.sin(t) * maxAmplitude;
                const py = centerY - y;
                if (x === 0) ctx.moveTo(x, py); else ctx.lineTo(x, py);
            }
            ctx.stroke();
        }
        
        // Draw actual LFO waveform scaled by depth
        const waveColor = rate > 0 ? `rgba(236, 72, 153, ${0.3 + depth * 0.7})` : '#444';
        ctx.strokeStyle = waveColor;
        ctx.lineWidth = 1 + depth;
        ctx.beginPath();
        
        for (let x = 0; x < w; x++) {
            const t = (x / w) * 4 * Math.PI + time * rate * 2 * Math.PI;
            const y = Math.sin(t) * maxAmplitude * depth;
            const py = centerY - y;
            if (x === 0) ctx.moveTo(x, py); else ctx.lineTo(x, py);
        }
        ctx.stroke();
        
        // Draw cable with depth-dependent brightness
        const cableActive = rate > 0 && depth > 0;
        const cableAlpha = cableActive ? 0.3 + depth * 0.7 : 0.2;
        
        // Cable path (always visible but dimmed when inactive)
        ctx.strokeStyle = cableActive ? `rgba(168, 85, 247, ${cableAlpha * 0.5})` : '#222';
        ctx.lineWidth = 1 + depth;
        ctx.beginPath();
        ctx.moveTo(w * 0.5, h * 0.6);
        ctx.bezierCurveTo(w * 0.3, h * 0.75, w * 0.1, h * 0.85, 0, h * 0.95);
        ctx.stroke();
        
        // Animated pulse on cable (only when active)
        if (cableActive) {
            const pulsePos = (time * rate * 2) % 1;
            
            ctx.fillStyle = `rgba(168, 85, 247, ${cableAlpha})`;
            ctx.shadowColor = '#a855f7';
            ctx.shadowBlur = 5 + depth * 10;
            const pulseX = w * 0.5 * (1 - pulsePos);
            const pulseY = h * 0.6 + (h * 0.35 * pulsePos);
            ctx.beginPath();
            ctx.arc(pulseX, pulseY, 3 + depth * 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    drawAdsr() {
        const { ctx, w, h } = this.viz.adsr;
        ctx.clearRect(0, 0, w, h);
        
        const p = this.viz.params;
        const scale = 30;
        let xa = p.attack * scale;
        let xd = p.decay * scale;
        let xs = 40;
        let xr = p.release * scale;
        let total = xa + xd + xs + xr;
        let f = total > w - 40 ? (w - 40) / total : 1;
        
        const margin = 5;
        const yb = h;
        const yt = margin;
        const hg = yb - yt;
        const ys = yb - p.sustain * hg;
        
        // Draw ADSR shape
        ctx.strokeStyle = '#3ce63c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(margin, yb);
        ctx.lineTo(margin + xa * f, yt);
        ctx.lineTo(margin + (xa + xd) * f, ys);
        ctx.lineTo(margin + (xa + xd + xs) * f, ys);
        ctx.lineTo(margin + (xa + xd + xs + xr) * f, yb);
        ctx.stroke();
        
        // Removed ADSR labels from graph per user request
    }

    initKeyboard() {
        const kb = this.root.querySelector('#keyboard');
        kb.innerHTML = '';
        
        let isActive = false;
        let lastNote = -1;

        const noteOn = (el) => {
            if (!el) return;
            const note = parseInt(el.dataset.note);
            if (isNaN(note)) return;
            
            if (lastNote !== note) {
                if (lastNote !== -1) noteOff(lastNote);
                el.classList.add('active');
                this.sendNoteOn(note, 100);
                lastNote = note;
            }
        };

        const noteOff = (note) => {
            if (note === -1) return;
            const el = kb.querySelector(`.key[data-note="${note}"]`);
            if (el) el.classList.remove('active');
            this.sendNoteOff(note);
        };

        const processPointer = (e) => {
            const el = this.shadowRoot.elementFromPoint(e.clientX, e.clientY);
            if (el && el.classList.contains('key')) {
                noteOn(el);
            } else if (lastNote !== -1) {
                noteOff(lastNote);
                lastNote = -1;
            }
        };

        kb.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            isActive = true;
            kb.setPointerCapture(e.pointerId);
            processPointer(e);
        });

        kb.addEventListener('pointermove', (e) => {
            if (!isActive) return;
            e.preventDefault();
            processPointer(e);
        });

        kb.addEventListener('pointerup', (e) => {
            if (!isActive) return;
            e.preventDefault();
            isActive = false;
            kb.releasePointerCapture(e.pointerId);
            if (lastNote !== -1) {
                noteOff(lastNote);
                lastNote = -1;
            }
        });

        kb.addEventListener('pointercancel', () => {
            isActive = false;
            if (lastNote !== -1) {
                noteOff(lastNote);
                lastNote = -1;
            }
        });

        const createOctave = (startMidi, isLastPartial = false) => {
            const container = document.createElement('div');
            container.style.flex = isLastPartial ? '1' : '7';
            container.className = isLastPartial ? 'key white' : 'octave';
            
            if (isLastPartial) {
                container.dataset.note = startMidi;
                container.style.borderRight = '1px solid #000';
                return container;
            }

            const whiteNotes = [0, 2, 4, 5, 7, 9, 11];
            whiteNotes.forEach(offset => {
                const k = document.createElement('div');
                k.className = 'key white';
                k.dataset.note = startMidi + offset;
                container.appendChild(k);
            });

            const blackNotes = [
                { offset: 1, pos: 1, shift: -0.15 },
                { offset: 3, pos: 2, shift: 0.15 },
                { offset: 6, pos: 4, shift: -0.2 },
                { offset: 8, pos: 5, shift: 0 },
                { offset: 10, pos: 6, shift: 0.2 }
            ];

            const whiteW = 100 / 7;
            const blackW = whiteW * 0.65;

            blackNotes.forEach(bn => {
                const k = document.createElement('div');
                k.className = 'key black';
                k.dataset.note = startMidi + bn.offset;
                const centerPct = bn.pos * whiteW;
                const leftPct = centerPct - blackW / 2 + whiteW * bn.shift;
                k.style.left = `${leftPct}%`;
                k.style.width = `${blackW}%`;
                container.appendChild(k);
            });

            return container;
        };

        [48, 60, 72].forEach(start => kb.appendChild(createOctave(start, false)));
        kb.appendChild(createOctave(84, true));
    }

    sendMidi(status, note, vel) {
        if (!this.patchConnection) return;
        const packedMsg = (status << 16) | (note << 8) | vel;
        try {
            if (typeof this.patchConnection.sendMIDIInputEvent === 'function') {
                this.patchConnection.sendMIDIInputEvent('midiIn', packedMsg);
            } else {
                const sender = this.patchConnection.sendEventOrValue || this.patchConnection.sendEvent;
                if (sender) sender.call(this.patchConnection, 'midiIn', packedMsg);
            }
        } catch (e) {
            console.error('MIDI send error:', e);
        }
    }

    sendNoteOn(note, vel) { this.sendMidi(0x90, note, vel); }
    sendNoteOff(note) { this.sendMidi(0x80, note, 0); }

    addKnob(parent, label, min, max, init, param) {
        const id = 'k-' + param;
        const k = new Knob(id, label, min, max, init, (v) => {
            this.patchConnection.sendEventOrValue(param, v);
            this.viz.params[param] = v;
        });
        k.dom.id = id;
        parent.appendChild(k.dom);
        this.knobs[param] = k;
        
        if (this.patchConnection) {
            this.patchConnection.addParameterListener(param, (v) => {
                k.setValue(v);
                this.viz.params[param] = v;
            });
        }
    }
}

export default function createPatchView(patchConnection) {
    if (!window.customElements.get("wavetable-synth-view")) {
        window.customElements.define("wavetable-synth-view", WavetableSynthView);
    }
    return new WavetableSynthView(patchConnection);
}
