import React, { useEffect, useRef } from 'react';

/**
 * CmajorViewWrapper
 * 既存の Cmajor Patch View (Web Component) を React 内でマウントするコンポーネント。
 */
const CmajorViewWrapper = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        // 動的に view/index.js をインポートしてカスタムエレメントを登録する
        // 実際には AudioContext や patchConnection の初期化が必要だが
        // まずは DOM 要素としてプレースホルダーを表示
        const initView = async () => {
            try {
                // NOTE: 本来はビルドプロセスで解決するか、publicに置く必要がある
                // 今回は src/cmajor/view/index.js を直接参照する形を模索
                const module = await import('../cmajor/view/index.js');
                const createPatchView = module.default;

                if (createPatchView && containerRef.current) {
                    // ダミーの patchConnection (実機が必要だが一旦枠だけ)
                    const dummyConn = {
                        requestParameterValue: () => {},
                        addParameterListener: () => {},
                        sendEventOrValue: () => {},
                        sendMIDIInputEvent: () => {}
                    };
                    
                    const view = createPatchView(dummyConn);
                    containerRef.current.innerHTML = '';
                    containerRef.current.appendChild(view);
                }
            } catch (e) {
                console.error("Failed to load Cmajor view:", e);
                if (containerRef.current) {
                    containerRef.current.innerHTML = `<p style="color:red">GUIのロードに失敗しました</p>`;
                }
            }
        };

        initView();
    }, []);

    return (
        <div 
            ref={containerRef} 
            className="synth-view-container"
            style={{ width: '900px', height: '600px', background: '#000' }}
        >
            <p style={{color: '#555', textAlign: 'center', paddingTop: '100px'}}>Loading Synthesizer GUI...</p>
        </div>
    );
};

export default CmajorViewWrapper;
