import { useUser } from '@/context/User.context';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import Home from '@/pages/home/Home';
import Project from '@/pages/project/Project';
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const AppRoute = () => {
  const { user } = useUser();
  const token = localStorage.getItem('token');
  const RedirectIfLoggedIn = ({ children }) => {
    if (token || user) {
      return <Navigate to="/" />;
    }
    return children;
  };

  const ProtectedRoute = ({ children }) => {
    if (!token && !user) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={
            <RedirectIfLoggedIn>
              <Login />
            </RedirectIfLoggedIn>
          } 
        />
        <Route 
          path="/register" 
          element={
            <RedirectIfLoggedIn>
              <Register />
            </RedirectIfLoggedIn>
          } 
        />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/project" 
          element={
            <ProtectedRoute>
              <Project />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoute;
