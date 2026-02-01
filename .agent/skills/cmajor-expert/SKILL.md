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
