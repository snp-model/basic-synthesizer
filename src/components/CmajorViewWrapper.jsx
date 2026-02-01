import React, { useEffect, useRef, useState } from 'react';

/**
 * CmajorViewWrapper
 * 既存の Cmajor Patch View (Web Component) を React 内でマウントするコンポーネント。
 * @param {Function} patchLoader - パッチモジュールをインポートする関数
 * @param {Function} viewLoader - viewモジュールをインポートする関数
 * @param {Function} onConnectionReady - 接続準備完了時のコールバック
 */
const CmajorViewWrapper = ({ patchLoader, viewLoader, onConnectionReady }) => {
    const wrapperRef = useRef(null);
    const containerRef = useRef(null);
    const [statusText, setStatusText] = useState("Initializing...");
    const [errorText, setErrorText] = useState(null);
    const [scale, setScale] = useState(1);

    const contentRef = useRef(null);

    useEffect(() => {
        const updateScale = () => {
            if (wrapperRef.current) {
                const width = wrapperRef.current.offsetWidth;
                const newScale = width < 900 ? width / 900 : 1;
                setScale(newScale);
                
                if (contentRef.current) {
                    contentRef.current.style.transform = `scale(${newScale})`;
                    // We don't set height on containerRef directly anymore, 
                    // as it's controlled by React style prop on outer div (sort of).
                    // Actually, inner container needs enough height to hold the scaled content? 
                    // No, the inner container width/height 100% is fine, 
                    // the transforms happens on contentDiv.
                }
            }
        };

        window.addEventListener('resize', updateScale);
        updateScale(); // Initial call

        let audioContext = null;
        let connection = null;
        let view = null;

        const init = async () => {
             try {
                setStatusText("1. Importing modules...");
                const patchModule = await patchLoader();
                const viewModule = await viewLoader();
                const createPatchView = viewModule.default;

                setStatusText("2. Creating AudioContext...");
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                setStatusText("3. Loading Audio Worklet...");
                connection = await patchModule.createAudioWorkletNodePatchConnection(audioContext, "basic-synth-worklet");
                
                setStatusText("4. Creating View...");
                view = createPatchView(connection);

                setStatusText("5. Mounting View...");
                if (containerRef.current) {
                    const contentDiv = document.createElement('div');
                    contentDiv.className = "synth-view-content";
                    contentDiv.style.width = '900px';
                    contentDiv.style.height = '600px';
                    contentDiv.style.transformOrigin = 'top center';
                    contentDiv.style.transition = 'transform 0.1s ease-out';
                    contentDiv.appendChild(view);
                    
                    contentRef.current = contentDiv;
                    
                    containerRef.current.innerHTML = '';
                    containerRef.current.appendChild(contentDiv);
                    
                    // Trigger scale update immediately after mounting
                    updateScale();
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
            window.removeEventListener('resize', updateScale);
            window.removeEventListener('click', handleUserGesture);
            window.removeEventListener('keydown', handleUserGesture);
            
            if (audioContext) {
                audioContext.close();
            }
        };
    }, []);
    
    // UI Scaling Style
    // contentStyle unused effectively since we manipulate DOM directly for transform
    
    const containerHeight = 600 * scale;

    const isReady = statusText === "Ready.";

    return (
        <div 
            ref={wrapperRef}
            className="synth-view-container"
            style={{ 
                width: '100%', 
                height: `${Math.max(containerHeight, isReady ? 0 : 300)}px`, 
                minHeight: scale < 1 && isReady ? 'auto' : '300px',
                background: '#111', 
                color: '#fff', 
                overflow: 'hidden',
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                position: 'relative'
            }}
        >
            {/* Status / Error Overlay */}
            {!isReady && (
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 10
                }}>
                    {errorText ? (
                         <div style={{color: 'red', textAlign: 'center', padding: '20px'}}>
                            <h3>Error Loading Synthesizer</h3>
                            <pre style={{textAlign: 'left', background: '#222', padding: '10px', borderRadius: '4px', overflow: 'auto', maxWidth: '800px'}}>{errorText}</pre>
                        </div>
                    ) : (
                        <p>{statusText}</p>
                    )}
                </div>
            )}

            {/* Cmajor Mount Point - Managed manually, React should NOT touch children */}
            <div 
                ref={containerRef} 
                style={{
                    width: '100%',
                    height: '100%',
                    display: isReady ? 'flex' : 'none',
                    justifyContent: 'center',
                    alignItems: 'flex-start' // Align top
                }} 
            />
        </div>
    );
};

export default CmajorViewWrapper;
