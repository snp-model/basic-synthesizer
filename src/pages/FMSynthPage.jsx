/* © 2026 snp */
import React, { useState, useEffect } from 'react';
import CmajorViewWrapper from '../components/CmajorViewWrapper';
import { fmRecipes } from '../data/fm_recipes';

function FMSynthPage() {
  
  // 1. State Declarations
  const [connection, setConnection] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [currentRecipeIdx, setCurrentRecipeIdx] = useState(0);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  // 2. Derived State
  const currentRecipe = fmRecipes[currentRecipeIdx];
  const currentStep = currentRecipe.steps[currentStepIdx];

  // 3. Handlers & Effects
  const handleConnectionReady = (conn, ctx) => {
    setConnection(conn);
    setAudioContext(ctx);
    console.log("Cmajor connection established");
  };

  const updateSynthParam = (paramId, value) => {
    if (connection) {
      try {
        console.log(`Setting param ${paramId} to ${value}`);
        connection.sendEventOrValue(paramId, value);
      } catch (e) {
        console.warn(`Failed to set parameter ${paramId}:`, e);
      }
    }
  };

  useEffect(() => {
     // We only reset when recipe changes
  }, [currentRecipeIdx]);

  // Default parameters to ensure clean state
  const DEFAULT_PARAMS = {
    carrierRatio: 1.0,
    modulatorRatio: 1.0,
    fmIndex: 2.0,
    attack: 0.1,
    decay: 0.1,
    sustain: 0.7,
    release: 0.3,
    volume: 0.3
  };

  const handleApplyParams = () => {
     if (connection) {
      // 1. First, reset all parameters to defaults (excluding volume)
      Object.entries(DEFAULT_PARAMS).forEach(([paramId, value]) => {
         if (paramId !== 'volume') {
           updateSynthParam(paramId, value);
         }
      });

      // 2. Apply all parameters from step 0 up to currentStepIdx
      for (let i = 0; i <= currentStepIdx; i++) {
        const step = currentRecipe.steps[i];
        if (step.targetParams) {
          Object.entries(step.targetParams).forEach(([paramId, value]) => {
            updateSynthParam(paramId, value);
          });
        }
      }
    }
  };

  const handleRecipeChange = (idx) => {
    setCurrentRecipeIdx(idx);
    setCurrentStepIdx(0);
  };

  const nextStep = () => {
    if (currentStepIdx < currentRecipe.steps.length - 1) {
      setCurrentStepIdx(v => v + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(v => v - 1);
    }
  };

  // Parameter formatting helpers
  const PARAM_LABELS = {
    carrierRatio: "Carrier Ratio",
    modulatorRatio: "Modulator Ratio",
    fmIndex: "FM Index",
    attack: "Attack",
    decay: "Decay",
    sustain: "Sustain",
    release: "Release",
    volume: "Volume"
  };

  const formatParamValue = (key, value) => {
    return value;
  };

  return (
    <div className="app-container">
      <header>
        <h1>初めてさわるシンセサイザー - FM編</h1>
        <p className="intro-text">
          FM合成の仕組みを、音を作る「レシピ」を通して学びましょう。<br />
          好きな音を選んで、ステップに沿って操作してみてください。
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
          <div className="recipe-grid">
            {fmRecipes.map((r, i) => (
              <div 
                key={r.id} 
                className={`recipe-card ${currentRecipeIdx === i ? 'active' : ''}`}
                onClick={() => handleRecipeChange(i)}
              >
                <div className="recipe-card-name">{r.name}</div>
              </div>
            ))}
          </div>

          <div className="learning-panel">
            <div className="step-nav">
              <span className="step-indicator">Step {currentStepIdx + 1} / {currentRecipe.steps.length}</span>
              <h2 className="step-title">{currentStep.title}</h2>
            </div>
            
            <div className="instruction-box">
              <span className="instruction-label">やってみよう</span>
              <p className="step-instruction">
                {currentStep.instruction}
              </p>
              
              {currentStep.targetParams && (
                <div className="target-params-list">
                  <strong>推奨設定:</strong>
                  <ul>
                    {Object.entries(currentStep.targetParams).map(([key, value]) => (
                      <li key={key}>
                        <span className="param-name">{PARAM_LABELS[key] || key}:</span> 
                        <span className="param-value">{formatParamValue(key, value)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="concept-box">
              <span className="concept-label">{currentStep.term}</span>
              <p className="concept-text">{currentStep.concept}</p>
            </div>

            <div className="step-controls">
              <button 
                className="nav-btn" 
                onClick={prevStep} 
                disabled={currentStepIdx === 0}
              >
                ← Prev
              </button>

              <button 
                className="nav-btn secondary"
                onClick={handleApplyParams}
                title="このステップの目標設定をシンセに適用します"
              >
                正解をセット
              </button>
              
              <button 
                className="nav-btn primary" 
                onClick={nextStep}
                disabled={currentStepIdx === currentRecipe.steps.length - 1}
              >
                {currentStepIdx === currentRecipe.steps.length - 1 ? '完成！' : 'Next →'}
              </button>
            </div>
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
