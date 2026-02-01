/* © 2026 snp */
import React, { useState } from 'react';
import CmajorViewWrapper from '../components/CmajorViewWrapper';

function FMSynthPage() {
  const [connection, setConnection] = useState(null);
  const [audioContext, setAudioContext] = useState(null);

  const handleConnectionReady = (conn, ctx) => {
    setConnection(conn);
    setAudioContext(ctx);
    console.log("FM Synth connection established");
  };

  return (
    <div className="app-container">
      <header>
        <h1>FMシンセサイザー</h1>
        <p className="intro-text">
          FM合成の仕組みを学びましょう。
        </p>
      </header>

      <div className="main-content">
        <div className="synth-column">
          <div className="synth-wrapper">
            <CmajorViewWrapper 
              patchLoader={() => import('../cmajor/export/FMSynth/cmaj_FM_Synth.js')}
              viewLoader={() => import('../cmajor/FMSynthSource/view/index.js')}
              onConnectionReady={handleConnectionReady} 
            />
          </div>
        </div>

        <div className="sidebar-column">
          <div className="learning-panel">
            <h2>FM Synth</h2>
            <p>FMシンセサイザーのレシピはまだ準備中です。</p>
          </div>
        </div>
      </div>

      <footer className="app-footer">
        <p>© 2026 snp</p>
      </footer>
    </div>
  );
}

export default FMSynthPage;
