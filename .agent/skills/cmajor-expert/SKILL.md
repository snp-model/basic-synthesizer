---
name: cmajor-expert
description: Use this skill when the user asks to write, debug, or explain Cmajor code, or create synthesizers/audio effects.
---

# Cmajor Expert Skill

You are an expert in Cmajor, a high-performance procedural DSP language.
Use this skill to write accurate Cmajor code for audio synthesis and processing.

## CRITICAL INSTRUCTION
If you are unsure about any syntax, standard library function, or language behavior, you MUST prioritize checking the official documentation:
https://cmajor.dev/docs/LanguageReference
Do not guess. Verify with the documentation first.

## Language Overview

Cmajor consists of **Processors** and **Graphs**.
- **Processor**: The basic unit of signal processing (imperative code).
- **Graph**: A network of nodes (processors or other graphs) connected together (declarative).

### 1. Processors
Processors are imperative. They MUST have a `main()` function with an infinite loop calling `advance()`.

```cmajor
processor Gain {
    input stream float in;
    output stream float out;
    input value float gain [[ name: "Volume", min: 0.0, max: 1.0, init: 0.5 ]];

    void main() {
        loop {
            out <- in * gain;
            advance(); // Must call this to move to next frame
        }
    }
}
```

**Key Rules:**
- Inputs/Outputs: `input stream float name;`, `input value float name;`, `output stream float name;`.
- Writing outputs: `out <- value;`
- Syntax is C-like (if, while, for).
- `advance()` waits for the next sample frame.

### 2. Graphs
Graphs are declarative. They define nodes and connections.

```cmajor
graph MySynth [[ main ]] {
    output stream float out;
    input value float frequency;

    node {
        osc = std::oscillators::Sine(float, 440);
        amp = std::levels::SmoothedGain(float);
    }

    connection {
        frequency -> osc.frequencyIn;
        osc.out -> amp.in;
        amp.out -> out;
    }
}
```

**Key Rules:**
- Use `node name = Type(args);` or `node { name = Type; }`.
- Use `connection source -> dest;` or `source -> dest1 -> dest2;`.
- The `[[ main ]]` annotation marks the entry point graph.

### 3. Namespaces & Standard Library
- Standard library is under `std`.
- Common namespaces: `std::oscillators`, `std::envelopes`, `std::filters`, `std::levels`.

### 4. File Structure
- **.cmajor**: Source code.
- **.cmajorpatch**: JSON manifest file (Project definition).

**.cmajorpatch Example:**
```json
{
    "ID": "MyPatch",
    "version": "1.0",
    "name": "My Patch",
    "description": "Description",
    "source": "Main.cmajor",
    "CmajorVersion": 1
}
```
**IMPORTANT**: `CmajorVersion: 1` is required in the manifest.

## Best Practices
1. **Naming**: UpperCamelCase for Types/Processors, lowerCamelCase for variables.
2. **Safety**: Cmajor is safe by default. No pointers, no dynamic allocation in the process loop.
3. **Efficiency**: Keep the `main` loop tight.

When asked to create a synthesizer, start with a Graph that connects an oscillator to an output, preferably with a gain control.

## Lessons Learned / Troubleshooting (Advanced)
### 1. Prefer Custom Processors over Standard Library
Standard library components (e.g., `std::oscillators`, `std::envelopes::Adsr`) can sometimes cause instantiation or symbol resolution errors (e.g., `Type references are not allowed`, `Cannot find symbol`).
**Recommendation:** Implementing basic processors (Oscillator, ADSR, Filter, Gain) from scratch within the project is often more reliable and educational. It avoids external dependency issues.

### 2. MIDI Handling Strategy
Parsing raw MIDI messages (`std::midi::Message`) inside Cmajor can be complex due to strict typing and `std::midi` library nuances.
**Recommendation:** Handle MIDI in the host environment (e.g., JavaScript/WebMIDI). Convert MIDI events to simple `float` values (Frequency, Gate) and pass them to the Cmajor patch as `input value`.
- JS: MIDI Note On -> Calc Freq, Gate = 1 -> Send to Patch
- Cmajor: `input value float frequency;`, `input value float gate;`

### 3. Stream vs Value Connections
Cmajor strictly accepts types. You cannot connect a `stream` output (like an envelope signal) to a `value` input (like `gain.gain`).
- **Error:** `(adsr.out * volume) -> gain.gain;` // Error: Cannot connect stream to value
- **Solution:** Perform modulation in the connection logic using multiplication.
  - `(source.out * envelope.out * volume) -> output;`

### 4. Custom GUI Implementation
When creating a custom GUI for a Cmajor patch, especially in VS Code extension environments:

1.  **Entry Point**: Do **NOT** use a raw `.html` file as the view source.
2.  **JS Module**: Use a `.js` file that exports a default function `createPatchView(patchConnection)`.
3.  **Return Value**: This function must return a DOM element (e.g., a `HTMLElement` or `div`).
4.  **Manifest**: Point to this `.js` file in the `.cmajorpatch` file.

**Example `view/index.js`:**
```javascript
class MyCustomView extends HTMLElement {
    constructor(patchConnection) {
        super();
        this.patchConnection = patchConnection;
        this.innerHTML = "<h1>Hello Cmajor</h1>";
    }
}

// MUST export this function
export default function createPatchView(patchConnection) {
    if (!window.customElements.get("my-custom-view")) {
        window.customElements.define("my-custom-view", MyCustomView);
    }
    return new MyCustomView(patchConnection);
}
```

**Example `.cmajorpatch`:**
```json
"view": {
    "src": "view/index.js",
    "width": 500,
    "height": 400
}
```

### 5. Virtual Keyboard / Interactive GUI Elements
When implementing a virtual keyboard or interactive controls in a custom View:

1.  **MIDI Transmission**:
    *   Use `patchConnection.sendMIDIInputEvent(endpointName, packedMessage)` for reliable MIDI transmission.
    *   **Packed Message Format**: Cmajor expects a single 32-bit integer for standard MIDI messages.
        *   Format: `(Status << 16) | (Data1 << 8) | Data2`
        *   Example (NoteOn): `(0x90 << 16) | (note << 8) | velocity`

2.  **Glissando / Drag Support**:
    *   Do not use simple `click` or `mousedown` on individual keys.
    *   Use **Pointer Events** (`pointerdown`, `pointermove`, `pointerup`) on the container.
    *   Use `setPointerCapture(e.pointerId)` on `pointerdown` to track the cursor even if it leaves the element.
    *   Use `this.shadowRoot.elementFromPoint(x, y)` to detect which key is under the cursor during a drag, especially if using Shadow DOM.

