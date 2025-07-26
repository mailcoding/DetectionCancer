import React from 'react';
import './App.css';
import AuthPage from './components/AuthPage';
import Dashboard from './pages/Dashboard';
import ComparaisonIA from './pages/ComparaisonIA';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/comparaison-ia" element={<ComparaisonIA />} />
        </Routes>
        <footer className="footer">
          © 2024 BreastAI |
          <a href="#support"> Support</a> |
          <a href="#documentation"> Documentation</a> |
          <a href="#mentions"> Mentions légales</a>
        </footer>
      </div>
    </Router>
  );
}

export default App;
