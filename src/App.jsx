/* © 2026 snp */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BasicSynthPage from './pages/BasicSynthPage';
import FMSynthPage from './pages/FMSynthPage';
import WavetableSynthPage from './pages/WavetableSynthPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/basic" element={<BasicSynthPage />} />
        <Route path="/fm" element={<FMSynthPage />} />
        <Route path="/wavetable" element={<WavetableSynthPage />} />
        <Route path="/" element={<Navigate to="/basic" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
