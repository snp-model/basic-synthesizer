/* © 2026 snp */
import React, { useState, useEffect } from 'react';
import CmajorViewWrapper from '../components/CmajorViewWrapper';
import { recipes } from '../data/recipes';

function BasicSynthPage() {
  
  // 1. State Declarations
  const [connection, setConnection] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [currentRecipeIdx, setCurrentRecipeIdx] = useState(0);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  // 2. Derived State
  const currentRecipe = recipes[currentRecipeIdx];
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
    waveform: 0,
    pulseWidth: 0.5,
    attack: 0.1,
    decay: 0.1,
    sustain: 1.0,
    release: 0.1,
    cutoff: 2000,
    resonance: 1.0,
    lfoRate: 1.0,
    lfoDepth: 0.0,
    volume: 0.3
  };

  const handleApplyParams = () => {
     if (connection) {
      // 1. First, reset all parameters to defaults
      Object.entries(DEFAULT_PARAMS).forEach(([paramId, value]) => {
         updateSynthParam(paramId, value);
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
    waveform: "Waveform",
    pulseWidth: "Pulse Width",
    attack: "Attack",
    decay: "Decay",
    sustain: "Sustain",
    release: "Release",
    cutoff: "Cutoff",
    resonance: "Resonance",
    lfoRate: "LFO Rate",
    lfoDepth: "LFO Depth",
    volume: "Volume"
  };

  const formatParamValue = (key, value) => {
    if (key === 'waveform') {
      const waves = ["Sine (サイン波)", "Saw (ノコギリ波)", "Square (矩形波)", "Triangle (三角波)"];
      return waves[value] || value;
    }
    return value;
  };

  return (
    <div className="app-container">
      <header>
        <h1>初めてさわるシンセサイザー</h1>
        <p className="intro-text">
          シンセサイザーの仕組みを、音を作る「レシピ」を通して学びましょう。<br />
          好きな音を選んで、ステップに沿って操作してみてください。
        </p>
      </header>

      <div className="main-content">
        <div className="synth-column">
          <div className="synth-wrapper">
            <CmajorViewWrapper onConnectionReady={handleConnectionReady} />
          </div>
        </div>

        <div className="sidebar-column">
          <div className="recipe-grid">
            {recipes.map((r, i) => (
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

export default BasicSynthPage;
