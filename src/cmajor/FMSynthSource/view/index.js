
// view/index.js - FM Synth View

console.log("--- FM SYNTH VIEW STARTED ---");

// Inline CSS
const STYLES = `
* { box-sizing: border-box; }
:host { display: block; width: 100%; height: 100%; }
:root { --bg-color: #050505; --panel-color: #121212; --accent-cyan: #00f3ff; --accent-orange: #ff9d00; --accent-green: #3ce63c; }
body { margin: 0; padding: 0; background-color: #000; color: #fff; font-family: sans-serif; overflow: hidden; }
#synth-root { width: 100%; height: 100%; display: flex; flex-direction: column; background: #111; }
.visualizer-area { flex: 1; display: flex; background: #050505; padding: 10px; gap: 10px; border-bottom: 2px solid #000; }
.viz-container { flex: 1; background: #0a0a0a; border: 1px solid #333; position: relative; }
.viz-label { position: absolute; top: 5px; left: 5px; color: #555; font-size: 10px; font-weight: bold; pointer-events: none; z-index: 10; }
.viz-canvas { width: 100%; height: 100%; }
.control-panel { height: 250px; display: flex; padding: 10px; gap: 5px; background: #151515; }
.module { flex: 1; min-width: 140px; display: flex; flex-direction: column; border: 1px solid #444; background: #1a1a1a; margin: 2px; }
.module-header { background: #222; padding: 5px; font-size: 11px; font-weight: bold; color: #fff; text-align: center; }
.module-controls { flex: 1; display: flex; flex-wrap: wrap; justify-content: space-around; align-items: center; padding: 5px; }
.knob-container { display: flex; flex-direction: column; align-items: center; gap: 5px; margin: 5px; transition: opacity 0.2s; }
.knob-container.disabled { opacity: 0.3; pointer-events: none; filter: grayscale(100%); }
.knob-swivel { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #444, #111); border: 2px solid #666; position: relative; cursor: ns-resize; }
.knob-swivel::after { content: ''; position: absolute; top: 4px; left: calc(50% - 2px); width: 4px; height: 14px; background: #fff; border-radius: 2px; }
.knob-label { font-size: 10px; color: #ccc; margin-top: 2px; }
.knob-value { font-size: 11px; color: #fff; background: #000; padding: 1px 4px; border-radius: 2px; font-family: monospace; }
#debug-log { height: 80px; background: #000; color: #0f0; font-family: monospace; font-size: 10px; padding: 5px; overflow-y: auto; border-top: 1px solid #333; }
.keyboard-area { height: 100px; background: #111; position: relative; display: flex; padding: 10px; margin-top: 5px; border-top: 1px solid #444; }
.octave { position: relative; display: flex; height: 100%; border-right: 1px solid #000; }
.key { border-radius: 0 0 4px 4px; cursor: pointer; position: relative; user-select: none; }
.key.white { flex: 1; height: 100%; background: #fff; border: 1px solid #000; z-index: 1; }
.key.white.final { flex: 1; height: 100%; background: #fff; border: 1px solid #000; z-index: 1; }
.key.white.active { background: #aaa; box-shadow: inset 0 0 10px #000; }
.key.black { height: 60%; background: #000; position: absolute; z-index: 2; border: 1px solid #444; border-top: none; }
.key.black.active { background: #333; box-shadow: inset 0 0 5px #fff; }
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

class FMSynthView extends HTMLElement {
    constructor(patchConnection) {
        super();
        this.patchConnection = patchConnection;
        this.knobs = {};
        this.viz = { params: { 
            volume: 0.3, 
            carrierRatio: 1.0, 
            modulatorRatio: 1.0, 
            fmIndex: 2.0,
            attack: 0.1, 
            decay: 0.1, 
            sustain: 0.7, 
            release: 0.3 
        } };
        
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
            this.log(`Conn detected.`);
            // Request initial parameter values
            this.patchConnection.requestParameterValue('volume');
            this.patchConnection.requestParameterValue('carrierRatio');
            this.patchConnection.requestParameterValue('modulatorRatio');
            this.patchConnection.requestParameterValue('fmIndex');
            this.patchConnection.requestParameterValue('attack');
            this.patchConnection.requestParameterValue('decay');
            this.patchConnection.requestParameterValue('sustain');
            this.patchConnection.requestParameterValue('release');
        } else {
            this.log("FATAL: patchConnection is null/undefined");
        }
    }

    log(msg) {
         console.log(msg);
         const l = this.root.querySelector('#debug-log');
         if(l) { let d=document.createElement('div'); d.textContent=`> ${msg}`; l.appendChild(d); l.scrollTop=l.scrollHeight; }
    }

    renderLayout() {
        this.root.innerHTML = `
            <div class="visualizer-area">
                <div class="viz-container" id="viz-fm"><div class="viz-label">FM SPECTRUM</div></div>
                <div class="viz-container" id="viz-mod"><div class="viz-label">MODULATOR</div></div>
                <div class="viz-container" id="viz-adsr"><div class="viz-label">ENVELOPE</div></div>
            </div>
            <div class="control-panel">
                <div class="module"><div class="module-header">CARRIER</div>
                    <div class="module-controls" id="c-car"></div>
                </div>
                <div class="module"><div class="module-header">MODULATOR</div>
                    <div class="module-controls" id="c-mod"></div>
                </div>
                <div class="module"><div class="module-header">ENVELOPE</div>
                    <div class="module-controls" id="c-env" style="display:grid; grid-template-columns: 1fr 1fr; justify-items: center; align-content: center;"></div>
                </div>
            </div>
            <div class="keyboard-area" id="keyboard"></div>
        `;

        this.initVisualizers();
        
        // MODULATOR module
        const mod = this.root.querySelector('#c-mod');
        this.addKnob(mod, 'Mod Ratio', 0.25, 8, 1.0, 'modulatorRatio');
        this.addKnob(mod, 'FM Index', 0, 10, 2.0, 'fmIndex');
        
        // CARRIER module
        const car = this.root.querySelector('#c-car');
        this.addKnob(car, 'Car Ratio', 0.25, 8, 1.0, 'carrierRatio');
        this.addKnob(car, 'Volume', 0, 1, 0.3, 'volume');

        // ENVELOPE module
        const env = this.root.querySelector('#c-env');
        this.addKnob(env, 'ATTACK', 0, 2, 0.1, 'attack');
        this.addKnob(env, 'DECAY', 0, 2, 0.1, 'decay');
        this.addKnob(env, 'SUSTAIN', 0, 1, 0.7, 'sustain');
        this.addKnob(env, 'RELEASE', 0, 5, 0.3, 'release');

        this.initKeyboard();
    }

    initKeyboard() {
        const kb = this.root.querySelector('#keyboard');
        kb.innerHTML = ''; 
        
        let isActive = false;
        let lastNote = -1;

        const noteOn = (el) => {
            if(!el) return;
            const note = parseInt(el.dataset.note);
            if(isNaN(note)) return;
            
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
            if(el) el.classList.remove('active');
            
            this.sendNoteOff(note);
        };

        const processPointer = (e) => {
            const el = this.shadowRoot.elementFromPoint(e.clientX, e.clientY);
            if (el && el.classList.contains('key')) {
                noteOn(el);
            } else {
                if (lastNote !== -1) {
                    noteOff(lastNote);
                    lastNote = -1;
                }
            }
        };

        kb.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            isActive = true;
            kb.setPointerCapture(e.pointerId);
            processPointer(e);
        });

        kb.addEventListener('pointermove', (e) => {
             if(!isActive) return;
             e.preventDefault();
             processPointer(e);
        });

        kb.addEventListener('pointerup', (e) => {
            if(!isActive) return;
            e.preventDefault();
            isActive = false;
            kb.releasePointerCapture(e.pointerId);
            if (lastNote !== -1) {
                noteOff(lastNote);
                lastNote = -1;
            }
        });
        
        kb.addEventListener('pointercancel', (e) => {
            isActive = false;
            if (lastNote !== -1) {
                noteOff(lastNote);
                lastNote = -1;
            }
        });

        const createOctave = (startMidi, isLastPartial = false) => {
            const container = document.createElement('div');
            container.style.flex = isLastPartial ? '1' : '7'; 
            container.className = isLastPartial ? 'key white final' : 'octave';
            
            if (isLastPartial) {
                container.dataset.note = startMidi;
                container.className = 'key white';
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
                const leftPct = centerPct - (blackW / 2) + (whiteW * bn.shift);
                
                k.style.left = `${leftPct}%`;
                k.style.width = `${blackW}%`;
                container.appendChild(k);
            });

            return container;
        };

        [36, 48, 60, 72].forEach(start => {
            kb.appendChild(createOctave(start, false));
        });
        kb.appendChild(createOctave(84, true));
    }

    sendMidi(status, note, vel) {
        if(!this.patchConnection) return;

        const packedMsg = (status << 16) | (note << 8) | vel;

        try {
            if (typeof this.patchConnection.sendMIDIInputEvent === 'function') {
                this.patchConnection.sendMIDIInputEvent('midiIn', packedMsg);
                this.log(`Tx MIDI: 0x${packedMsg.toString(16)}`);
            } else {
                 const sender = this.patchConnection.sendEventOrValue || this.patchConnection.sendEvent;
                 if(sender) {
                     sender.call(this.patchConnection, 'midiIn', packedMsg);
                     this.log(`Tx Event: 0x${packedMsg.toString(16)}`);
                 } else {
                     this.log("Err: No sendMIDIInputEvent found");
                 }
            }
        } catch(e) {
            this.log(`Send Err: ${e}`);
        }
    }

    sendNoteOn(note, vel) {
        this.sendMidi(0x90, note, vel);
        this.log(`Tx NoteOn: ${note}`);
    }
    
    sendNoteOff(note) {
         this.sendMidi(0x80, note, 0);
         this.log(`Tx NoteOff: ${note}`);
    }

    initVisualizers() {
        const mkCanvas = (id, color) => {
            const p = this.root.querySelector(id);
            const c = document.createElement('canvas');
            c.className = 'viz-canvas';
            c.width = 300; c.height = 150;
            p.appendChild(c);
            return { ctx: c.getContext('2d'), w: 300, h: 150, color };
        };
        this.viz.fm = mkCanvas('#viz-fm', '#00f3ff');
        this.viz.mod = mkCanvas('#viz-mod', '#ff9d00');
        this.viz.adsr = mkCanvas('#viz-adsr', '#3ce63c');
        this.loopViz();
    }

    loopViz() {
        const loop = () => {
            this.drawFMSpectrum(); 
            this.drawModulator(); 
            this.drawAdsr();
            requestAnimationFrame(loop);
        };
        loop();
    }

    drawFMSpectrum() {
        const { ctx, w, h, color } = this.viz.fm;
        ctx.clearRect(0,0,w,h); 
        ctx.strokeStyle = color; 
        ctx.lineWidth = 2; 
        ctx.beginPath();
        
        const p = this.viz.params;
        const time = Date.now() / 1000;
        const carrierFreq = 2; // Base carrier frequency for visualization
        const modFreq = carrierFreq * p.modulatorRatio;
        const modIndex = p.fmIndex;
        const amp = p.volume !== undefined ? p.volume : 1.0;
        
        for(let x = 0; x < w; x++) {
            const t = (x / w) * 4 * Math.PI + time * 3;
            // FM synthesis: carrier + modulator
            const modulator = Math.sin(t * modFreq);
            const carrier = Math.sin(t * carrierFreq * p.carrierRatio + modIndex * modulator);
            const y = carrier * amp;
            const py = h/2 - y * (h/3);
            if(x === 0) ctx.moveTo(x, py); else ctx.lineTo(x, py);
        }
        ctx.stroke();
    }

    drawModulator() {
        const { ctx, w, h, color } = this.viz.mod;
        ctx.clearRect(0,0,w,h); 
        ctx.strokeStyle = color; 
        ctx.lineWidth = 2; 
        ctx.beginPath();
        
        const p = this.viz.params;
        const time = Date.now() / 1000;
        const modRatio = p.modulatorRatio || 1.0;
        
        for(let x = 0; x < w; x++) {
            const t = (x / w) * 4 * Math.PI + time * 3;
            const y = Math.sin(t * modRatio);
            const py = h/2 - y * (h/3);
            if(x === 0) ctx.moveTo(x, py); else ctx.lineTo(x, py);
        }
        ctx.stroke();
    }

    drawAdsr() {
        const { ctx, w, h, color } = this.viz.adsr;
        ctx.clearRect(0,0,w,h); ctx.strokeStyle=color; ctx.lineWidth=2; ctx.beginPath();
        const p = this.viz.params;
        let scale = 20;
        let xa=p.attack*scale, xd=p.decay*scale, xs=50, xr=p.release*scale;
        let total = xa+xd+xs+xr;
        let f = total > w-20 ? (w-20)/total : 1;
        
        let yb=h-10, yt=20, hg=yb-yt;
        let ys = yb - p.sustain*hg;
        
        ctx.moveTo(10, yb);
        ctx.lineTo(10+xa*f, yt);
        ctx.lineTo(10+(xa+xd)*f, ys);
        ctx.lineTo(10+(xa+xd+xs)*f, ys);
        ctx.lineTo(10+(xa+xd+xs+xr)*f, yb);
        ctx.stroke();
    }

    addKnob(parent, label, min, max, init, param) {
        const id = 'k-' + param;
        const k = new Knob(id, label, min, max, init, (v) => {
            this.patchConnection.sendEventOrValue(param, v);
            this.viz.params[param] = v;
        });
        k.dom.id = id; 
        parent.appendChild(k.dom);
        this.knobs[param] = k;
        
        if(this.patchConnection) {
            this.patchConnection.addParameterListener(param, (v) => {
                 k.setValue(v);
                 this.viz.params[param] = v;
            });
        }
    }
}

export default function createPatchView(patchConnection) {
    if (!window.customElements.get("fm-synth-view")) window.customElements.define("fm-synth-view", FMSynthView);
    return new FMSynthView(patchConnection);
}
