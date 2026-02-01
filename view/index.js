
// view/index.js

console.log("--- VIEW SCRIPT STARTED ---");

// Visual proof that script loaded
const statusDiv = document.createElement('div');
statusDiv.style.cssText = "position:absolute; top:0; left:0; width:100%; height:20px; background:blue; color:white; z-index:9999; font-size:12px; pointer-events:none; opacity:0.5; display:flex; align-items:center; padding-left:10px;";
statusDiv.textContent = "JS MODULE LOADED";
document.body.appendChild(statusDiv);

window.onerror = function(msg, url, line, col, error) {
    statusDiv.style.background = 'red';
    statusDiv.innerHTML += ` | ERROR: ${msg}`;
    return false;
};

// Inline CSS
const STYLES = `
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
        this.viz = { params: { waveform:0, pulseWidth:0.5, volume:0.5, cutoff:2000, resonance:1, attack:0.1, decay:0.1, sustain:1.0, release:0.1, lfoRate:1, lfoDepth:0 } };
        
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
            this.patchConnection.requestParameterValue('waveform');
        } else {
            statusDiv.innerHTML += " | NO CONNECTION";
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
            <div id="debug-log"><div>View Initialized v5 (Labels Updated)</div></div>
        `;

        this.initVisualizers();
        
        const vco=this.root.querySelector('#c-vco');
        this.addKnob(vco, 'Pulse Width', 0.01, 0.99, 0.5, 'pulseWidth');
        this.addKnob(vco, 'Volume', 0, 1, 0.5, 'volume');
        
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
        // Rate 0.1 to 20. 
        // We want to visualize the actual speed.
        
        const rate = p.lfoRate || 1.0;
        const depth = (p.lfoDepth || 0) / 2000.0; // Max depth is usually around 2000Hz in params? or normalized?
        // Using normalized viz: depth 0-2000. UI knob max 2000.
        // Let's normalize it for display: full height at max depth.
        const vizAmp = Math.min(1.0, depth * 2); // Amplify a bit for visibility if depth is low
        
        // Draw 2 cycles of sine wave moving
        for(let x=0; x<w; x++) {
            // Mapping x to phase
            // window width = 2 seconds? 
            // t = x / w * duration
            let t_local = (x/w) * 2.0; 
            let val = Math.sin((time + t_local) * rate * 2 * Math.PI);
            
            // Apply depth
            // If depth is 0, line is flat.
            val *= (p.lfoDepth / 2000.0); // exact ratio
            
            // Auto-scale for visibility? No, showing "depth" is better.
            // But if depth is 0 it looks broken.
            // Let's show full waves but change opacity or height based on depth?
            // User expects to see "Speed".
            // Let's draw full height wave to show speed, and maybe opacity for depth?
            // Or just draw pure LFO output shape.
            
            // Re-decision: Draw the wave with constant amplitude to visualize frequency clearly,
            // but scale height by depth so user sees intensity.
            
            // Ensure at least small visibility
            let displayAmp = Math.max(0.05, p.lfoDepth / 2000.0);
            
            let y = val * displayAmp; 
             // Logic check: val is already scaled above? No I reset logic.
            
            let wave = Math.sin(((time * rate) + (x/w)*4)*Math.PI); // Time moves phase. x shows spatial wave.
            
            // Height logic
            let h_val = wave * (p.lfoDepth / 2000.0);
            
            // To make it look "alive" always, maybe show gray ghost wave if depth is 0?
            // Let's just stick to actual representation.
            
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
        // Only enable Pulse Width when Waveform is Square (2)
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
    statusDiv.textContent = "CREATE PATCH VIEW CALLED (v3)";
    statusDiv.style.background = "green";
    if (!window.customElements.get("basic-synth-view")) window.customElements.define("basic-synth-view", BasicSynthView);
    return new BasicSynthView(patchConnection);
}
