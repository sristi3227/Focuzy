import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FocusTimer from './Components/FocusTimer';
import SessionHistory from './Components/SessionHistory';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FocusTimer />} />
        <Route path="/history" element={<SessionHistory />} />
      </Routes>
    </Router>
  );
};

export default App;
