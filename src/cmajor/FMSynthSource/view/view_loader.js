
class BasicSynthView extends HTMLElement {
    constructor(patchConnection) {
        super();
        this.patchConnection = patchConnection;
        this.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                    background: #222;
                    color: #0f0;
                    font-family: sans-serif;
                    padding: 20px;
                    box-sizing: border-box;
                }
                h1 { margin-top: 0; }
            </style>
            <div>
                <h1>Custom View Loaded Successfully</h1>
                <p>If you see this, the JS module loader is working.</p>
                <div id="status">Waiting for connection...</div>
            </div>
        `;
    }

    connectedCallback() {
        if (this.patchConnection) {
            this.querySelector("#status").textContent = "Patch Connection: OK";
        }
    }
}

export default function createPatchView(patchConnection) {
    if (!window.customElements.get("basic-synth-view")) {
        window.customElements.define("basic-synth-view", BasicSynthView);
    }
    return new BasicSynthView(patchConnection);
}
