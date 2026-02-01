
// view/index.js

console.log("--- VIEW SCRIPT STARTED ---");

console.log("--- VIEW SCRIPT STARTED ---");

// Inline CSS
const STYLES = `
* { box-sizing: border-box; }
:host { display: block; width: 100%; height: 100%; }
:root { --bg-color: #050505; --panel-color: #121212; --accent-cyan: #00f3ff; }
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
.wave-btn { background: #333; color: #ccc; border: 1px solid #555; padding: 2px 5px; font-size: 10px; cursor: pointer; margin: 0 1px; }
.wave-btn.active { background: #00f3ff; color: #000; border-color: #00f3ff; box-shadow: 0 0 5px #00f3ff; }
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
        this.dom.id = id; // Set ID on container for lookup
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

class BasicSynthView extends HTMLElement {
    constructor(patchConnection) {
        super();
        this.patchConnection = patchConnection;
        this.knobs = {};
        this.viz = { params: { waveform:0, pulseWidth:0.5, volume:0.3, cutoff:2000, resonance:1, attack:0.1, decay:0.1, sustain:1.0, release:0.1, lfoRate:1, lfoDepth:0 } };
        
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
            const proto = Object.getPrototypeOf(this.patchConnection);
            const protoKeys = Object.getOwnPropertyNames(proto);
            this.log(`Proto keys: ${protoKeys.join(',')}`);
            
            this.patchConnection.requestParameterValue('waveform');
        } else {
            statusDiv.innerHTML += " | NO CONNECTION";
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
                <div class="viz-container" id="viz-osc"><div class="viz-label">OSCILLOSCOPE</div></div>
                <div class="viz-container" id="viz-filter"><div class="viz-label">FILTER</div></div>
                <div class="viz-container" id="viz-adsr"><div class="viz-label">ENVELOPE</div></div>
                <div class="viz-container" id="viz-lfo"><div class="viz-label">LFO</div></div>
            </div>
            <div class="control-panel">
                <div class="module"><div class="module-header">OSCILLATOR</div>
                    <div style="display:flex; justify-content:center; gap:2px;">
                        <button class="wave-btn" data-w="0">SIN</button><button class="wave-btn" data-w="1">SAW</button>
                        <button class="wave-btn" data-w="2">SQR</button><button class="wave-btn" data-w="3">TRI</button>
                    </div>
                    <div class="module-controls" id="c-vco"></div>
                </div>
                <div class="module"><div class="module-header">FILTER</div><div class="module-controls" id="c-vcf"></div></div>
                <div class="module"><div class="module-header">ENVELOPE</div><div class="module-controls" id="c-env" style="display:grid; grid-template-columns: 1fr 1fr; justify-items: center; align-content: center;"></div></div>
                <div class="module"><div class="module-header">LFO</div><div class="module-controls" id="c-lfo"></div></div>
            </div>
            <div class="keyboard-area" id="keyboard"></div>
        `;

        this.initVisualizers();
        
        const vco=this.root.querySelector('#c-vco');
        this.addKnob(vco, 'Pulse Width', 0.01, 0.99, 0.5, 'pulseWidth');
        this.addKnob(vco, 'Volume', 0, 1, 0.3, 'volume');
        
        const vcf=this.root.querySelector('#c-vcf');
        this.addKnob(vcf, 'Cutoff', 20, 10000, 2000, 'cutoff');
        this.addKnob(vcf, 'Res', 0.1, 10, 1, 'resonance');

        const env=this.root.querySelector('#c-env');
        this.addKnob(env, 'ATTACK', 0, 5, 0.1, 'attack');
        this.addKnob(env, 'DECAY', 0, 5, 0.1, 'decay');
        this.addKnob(env, 'SUSTAIN', 0, 1, 1, 'sustain');
        this.addKnob(env, 'RELEASE', 0, 5, 0.1, 'release');

        const lfo=this.root.querySelector('#c-lfo');
        this.addKnob(lfo, 'Rate', 0.1, 20, 1, 'lfoRate');
        this.addKnob(lfo, 'Depth', 0, 2000, 0, 'lfoDepth');

        this.setupWaveform();
        this.updateKnobStates();
        this.initKeyboard();
    }

    initKeyboard() {
        const kb = this.root.querySelector('#keyboard');
        kb.innerHTML = ''; 
        
        // --- Pointer Event Handling for Glissando ---
        let isActive = false;
        let lastNote = -1;

        const noteOn = (el) => {
            if(!el) return;
            const note = parseInt(el.dataset.note);
            if(isNaN(note)) return;
            
            if (lastNote !== note) {
                if (lastNote !== -1) noteOff(lastNote); // Stop previous if any
                
                el.classList.add('active');
                this.sendNoteOn(note, 100);
                lastNote = note;
            }
        };

        const noteOff = (note) => {
            if (note === -1) return;
            // Find element by note to remove class
            const el = kb.querySelector(`.key[data-note="${note}"]`);
            if(el) el.classList.remove('active');
            
            this.sendNoteOff(note);
        };

        const processPointer = (e) => {
            // Find key under pointer
            // We need to look through shadow DOM if necessary, but elementFromPoint works on screen coords
            // Since we are in shadow DOM, standard elementFromPoint might return the host or nothing if shadowed?
            // Actually, inside shadow root, we might need a different approach or verify elementFromPoint behavior.
            // But standard document.elementFromPoint usually pierces or we use this.root.shadowRoot.elementFromPoint if available?
            // Standard elementFromPoint returns the ShadowHost. We need to drill down.
            // OR simpler: assume flattened event target for 'over' events? No, move doesn't target elements effectively during capture.
            
            // Better approach for Shadow DOM:
            // use this.shadowRoot.elementFromPoint(x, y)
            
            const el = this.shadowRoot.elementFromPoint(e.clientX, e.clientY);
            if (el && el.classList.contains('key')) {
                noteOn(el);
            } else {
                // If we drifted off a key, should we stop the last note? 
                // Usually yes, if we are not over any key.
                if (lastNote !== -1) {
                    noteOff(lastNote);
                    lastNote = -1;
                }
            }
        };

        kb.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            isActive = true;
            kb.setPointerCapture(e.pointerId); // Capture pointer to keep events flowing to kb
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

        // --- Octave Generation ---
        const createOctave = (startMidi, isLastPartial = false) => {
            const container = document.createElement('div');
            container.style.flex = isLastPartial ? '1' : '7'; 
            container.className = isLastPartial ? 'key white final' : 'octave';
            
            if (isLastPartial) {
                container.dataset.note = startMidi;
                container.className = 'key white';
                container.style.borderRight = '1px solid #000'; 
                // this.setupKeyEvents(container, startMidi); // Removed
                return container;
            }

            const whiteNotes = [0, 2, 4, 5, 7, 9, 11];
            whiteNotes.forEach(offset => {
                const k = document.createElement('div');
                k.className = 'key white';
                k.dataset.note = startMidi + offset;
                // this.setupKeyEvents(k, startMidi + offset); // Removed
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
                // this.setupKeyEvents(k, startMidi + bn.offset); // Removed
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

        // Pro54 Reference: controlByte | (note << 8) | velocity
        // controlByte for NoteOn Ch1 is 0x900000
        // So packing is (Status << 16) | (Note << 8) | Velocity
        const packedMsg = (status << 16) | (note << 8) | vel;

        try {
            if (typeof this.patchConnection.sendMIDIInputEvent === 'function') {
                this.patchConnection.sendMIDIInputEvent('midiIn', packedMsg);
                this.log(`Tx MIDI: 0x${packedMsg.toString(16)}`);
            } else {
                 // Fallback if that specific method is missing (unlikely if standard view)
                 // Some hosts might still use sendEvent for MIDI
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
        this.viz.osc = mkCanvas('#viz-osc', '#00f3ff');
        this.viz.filter = mkCanvas('#viz-filter', '#ff9d00');
        this.viz.adsr = mkCanvas('#viz-adsr', '#3ce63c');
        this.viz.lfo = mkCanvas('#viz-lfo', '#ff00ff');
        this.loopViz();
    }

    loopViz() {
        const loop = () => {
            this.drawOsc(); this.drawFilter(); this.drawAdsr(); this.drawLfo();
            requestAnimationFrame(loop);
        };
        loop();
    }

    drawOsc() {
        const { ctx, w, h, color } = this.viz.osc;
        ctx.clearRect(0,0,w,h); ctx.strokeStyle=color; ctx.lineWidth=2; ctx.beginPath();
        const p = this.viz.params;
        const time = Date.now()/1000;
        const amp = p.volume !== undefined ? p.volume : 1.0;
        for(let x=0; x<w; x++) {
            let t = (x/w)*6*Math.PI + time*10;
            let y=0;
            if (p.waveform===0) y=Math.sin(t);
            else if (p.waveform===1) { let ph=(t/6.28)%1; if(ph<0)ph+=1; y=ph*2-1; }
            else if (p.waveform===2) { let ph=(t/6.28)%1; if(ph<0)ph+=1; y=(ph<p.pulseWidth)?1:-1; }
            else { let ph=(t/6.28)%1; if(ph<0)ph+=1; y=4*Math.abs(ph-0.5)-1; }
            y *= amp;
            let py = h/2 - y*(h/3);
            if(x===0) ctx.moveTo(x,py); else ctx.lineTo(x,py);
        }
        ctx.stroke();
    }

    drawFilter() {
         const { ctx, w, h, color } = this.viz.filter;
         ctx.clearRect(0,0,w,h); ctx.strokeStyle=color; ctx.lineWidth=2; ctx.beginPath();
         const p = this.viz.params;
         let cLog = Math.log10(Math.max(20, Math.min(20000, p.cutoff)));
         let cx = ((cLog-1.3)/3)*w;
         for(let x=0; x<w; x++) {
             let y = (x<cx) ? 1 : Math.max(0,1-(x-cx)/50);
             if (Math.abs(x-cx)<20) y += (p.resonance-0.7)*0.5*(1-Math.abs(x-cx)/20);
             let py = h*0.8 - y*h*0.5;
             if(x===0) ctx.moveTo(x,py); else ctx.lineTo(x,py);
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

    drawLfo() {
        const { ctx, w, h, color } = this.viz.lfo;
        ctx.clearRect(0,0,w,h); ctx.strokeStyle=color; ctx.lineWidth=2; ctx.beginPath();
        const p = this.viz.params;
        const time = Date.now()/1000;
        
        const rate = p.lfoRate || 1.0;
        const depth = (p.lfoDepth || 0) / 2000.0;
        const vizAmp = Math.min(1.0, depth * 2);
        
        for(let x=0; x<w; x++) {
            let val = Math.sin((time * rate * 2 * Math.PI) + (x/w)*4*Math.PI);
            
            let displayAmp = Math.max(0.05, p.lfoDepth / 2000.0);
            
            let y = val * displayAmp; 
             
            let h_val = Math.sin(((time * rate) + (x/w)*4)*Math.PI) * (p.lfoDepth / 2000.0);
            
            let py = h/2 - h_val*(h/2.5);
            if(x===0) ctx.moveTo(x,py); else ctx.lineTo(x,py);
        }
        ctx.stroke();
    }

    setupWaveform() {
        const btns = this.root.querySelectorAll('.wave-btn');
        btns.forEach(b => {
             b.onclick = () => {
                 let v = parseInt(b.dataset.w);
                 this.patchConnection.sendEventOrValue('waveform', v);
                 this.viz.params.waveform = v;
                 this.updateBtns(v);
                 this.updateKnobStates();
             };
        });
        if(this.patchConnection) {
            this.patchConnection.addParameterListener('waveform', (v) => {
                this.viz.params.waveform = v;
                this.updateBtns(v);
                this.updateKnobStates();
            });
        }
    }

    updateBtns(v) {
        this.root.querySelectorAll('.wave-btn').forEach(b => {
            if(parseInt(b.dataset.w)===v) b.classList.add('active'); else b.classList.remove('active');
        });
    }

    updateKnobStates() {
        const pw = this.root.querySelector('#k-pulseWidth');
        if(pw) {
            if (this.viz.params.waveform === 2) pw.classList.remove('disabled');
            else pw.classList.add('disabled');
        }
    }

    addKnob(parent, label, min, max, init, param) {
        const id = 'k-' + param;
        const k = new Knob(id, label, min, max, init, (v) => {
            this.patchConnection.sendEventOrValue(param, v);
            this.viz.params[param] = v;
        });
        k.dom.id = id; 
        parent.appendChild(k.dom);
        
        if(this.patchConnection) {
            this.patchConnection.addParameterListener(param, (v) => {
                 k.setValue(v);
                 this.viz.params[param] = v;
            });
        }
    }
}

export default function createPatchView(patchConnection) {
    if (!window.customElements.get("basic-synth-view")) window.customElements.define("basic-synth-view", BasicSynthView);
    return new BasicSynthView(patchConnection);
}
