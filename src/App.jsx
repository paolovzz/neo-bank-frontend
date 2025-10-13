// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import SignPage from './SignPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/sign" element={<SignPage />} />
    </Routes>
  );
}

export default App;
