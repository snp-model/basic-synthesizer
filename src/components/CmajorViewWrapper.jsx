import React, { useEffect, useRef, useState } from 'react';

/**
 * CmajorViewWrapper
 * 既存の Cmajor Patch View (Web Component) を React 内でマウントするコンポーネント。
 */
const CmajorViewWrapper = ({ onConnectionReady }) => {
    const containerRef = useRef(null);

    const [statusText, setStatusText] = useState("Initializing...");
    const [errorText, setErrorText] = useState(null);

    useEffect(() => {
        let audioContext = null;
        let connection = null;
        let view = null;

        const init = async () => {
             try {
                setStatusText("1. Importing modules...");
                const patchModule = await import('../cmajor/BasicSynth/cmaj_Basic_Synth.js');
                const viewModule = await import('../cmajor/BasicSynth/view/index.js');
                const createPatchView = viewModule.default;

                setStatusText("2. Creating AudioContext...");
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                setStatusText("3. Loading Audio Worklet...");
                // This step might fail if the worklet cannot be created
                connection = await patchModule.createAudioWorkletNodePatchConnection(audioContext, "basic-synth-worklet");
                
                setStatusText("4. Creating View...");
                view = createPatchView(connection);

                setStatusText("5. Mounting View...");
                if (containerRef.current) {
                    containerRef.current.innerHTML = '';
                    view.style.width = '100%';
                    view.style.height = '100%';
                    containerRef.current.appendChild(view);
                }

                setStatusText("6. Connecting Audio...");
                connection.connectDefaultAudioAndMIDI(audioContext);
                
                setStatusText("Ready.");
                if (onConnectionReady) {
                    onConnectionReady(connection, audioContext);
                }

            } catch (err) {
                console.error("Error loading Cmajor synth:", err);
                setErrorText(err.toString());
                setStatusText("Failed.");
            }
        };

        const handleUserGesture = () => {
             if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume();
             }
        };
        window.addEventListener('click', handleUserGesture);
        window.addEventListener('keydown', handleUserGesture);

        init();

        return () => {
            window.removeEventListener('click', handleUserGesture);
            window.removeEventListener('keydown', handleUserGesture);
            
            if (connection) {
                // connection.close(); // Calling close might cause issues on hot reload sometimes, but good practice
            }
            if (audioContext) {
                audioContext.close();
            }
        };
    }, []);

    // Also update return to show status if view is not yet mounted
    // Note: Once view is mounted, this JSX is NOT overwritten by React because we manipulated DOM manually?
    // Actually, React keeps the containerRef. We wipe innerHTML.
    // So the React 'return' below only matters for the initial render or if we use state to render the message.
    // BUT we are manually wiping innerHTML in step 5.
    // To show status updates BEFORE step 5, we should use the JSX return.
    
    return (
        <div 
            ref={containerRef} 
            className="synth-view-container"
            style={{ width: '900px', height: '600px', background: '#111', color: '#fff', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
        >
            {errorText ? (
                <div style={{color: 'red', textAlign: 'center'}}>
                    <h3>Error Loading Synthesizer</h3>
                    <p>{errorText}</p>
                </div>
            ) : (
                 <p>{statusText}</p>
            )}
        </div>
    );

    return (
        <div 
            ref={containerRef} 
            className="synth-view-container"
            style={{ width: '100%', height: '100%', background: '#222', border: '5px solid red', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
        >
             {/* This content is shown until step 5 wipes it, or if there is an error */ }
            {errorText ? (
                <div style={{color: 'red', textAlign: 'center', padding: '20px'}}>
                    <h3>Error Loading Synthesizer</h3>
                    <pre style={{textAlign: 'left', background: '#222', padding: '10px', borderRadius: '4px', overflow: 'auto', maxWidth: '800px'}}>{errorText}</pre>
                </div>
            ) : (
                 <div style={{color: '#888'}}>
                    <p>{statusText}</p>
                 </div>
            )}
        </div>
    );
};

export default CmajorViewWrapper;
