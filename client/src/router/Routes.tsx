import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from '../auth/Login';
import Dashboard from '../dashboard';
import SignUp from '../auth/SignUp';
import Confirmation from '../auth/Confirmation';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard/>
          </ProtectedRoute>
        } />
     
        <Route path="/login" element={
          <Login />
        } />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/code-confirmation" element={<Confirmation />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;