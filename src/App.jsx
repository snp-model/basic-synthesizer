import React, { useState, useEffect } from 'react';
import CmajorViewWrapper from './components/CmajorViewWrapper';
import { recipes } from './data/recipes';


function App() {
  console.log("App component rendering...");
  
  // 1. State Declarations
  const [connection, setConnection] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [currentRecipeIdx, setCurrentRecipeIdx] = useState(0);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [autoApply, setAutoApply] = useState(true);

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
        connection.sendEventOrValue(paramId, value);
      } catch (e) {
        console.warn(`Failed to set parameter ${paramId}:`, e);
      }
    }
  };

  // Apply parameters whenever the current step or recipe changes
  useEffect(() => {
    if (autoApply && connection) {
      // Apply all parameters from step 0 up to currentStepIdx to ensure consistent state
      for (let i = 0; i <= currentStepIdx; i++) {
        const step = currentRecipe.steps[i];
        if (step.targetParams) {
          Object.entries(step.targetParams).forEach(([paramId, value]) => {
            updateSynthParam(paramId, value);
          });
        }
      }
    }
  }, [currentRecipeIdx, currentStepIdx, connection, autoApply, currentRecipe]);

  const handleApplyParams = () => {
     if (connection) {
      // Apply all parameters from step 0 up to currentStepIdx
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

  return (
    <div className="app-container">
      <header>
        <h1>Synthesizer Learning Platform</h1>
        <p className="intro-text">
          シンセサイザーの仕組みを、音を作る「レシピ」を通して学びましょう。
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
          <div className="recipe-selector">
            {recipes.map((r, i) => (
              <button 
                key={r.id} 
                className={`recipe-btn ${currentRecipeIdx === i ? 'active' : ''}`}
                onClick={() => handleRecipeChange(i)}
              >
                {r.name}
              </button>
            ))}
          </div>

          <div className="learning-panel">
            <div className="step-nav">
              <span className="step-indicator">Step {currentStepIdx + 1} / {currentRecipe.steps.length}</span>
              <h2 className="step-title">{currentStep.title}</h2>
            </div>
            
            <div className="concept-box">
              <span className="concept-label">セクションの役割</span>
              <p className="concept-text">{currentStep.concept}</p>
            </div>

            <div className="instruction-box">
              <span className="instruction-label">ハンズオン解説</span>
              <p className="step-instruction">
                {currentStep.instruction}
              </p>
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
                {currentStepIdx === currentRecipe.steps.length - 1 ? '完了！' : 'Next →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
