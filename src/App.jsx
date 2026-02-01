/* © 2026 snp */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BasicSynthPage from './pages/BasicSynthPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/basic" element={<BasicSynthPage />} />
        <Route path="/" element={<Navigate to="/basic" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
