// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Header from './components/Header';
import SignIn from './components/SignIn';
import Profile from './components/Profile';
import Questions from './components/Questions'; // Import your Questions component
import Discussions from './components/Discussions';
import AuthService from './services/auth.service';
import QuestionDiscussion from './components/QuestionDiscussion';


// Protected Route Component
const ProtectedRoute = ({ children }) => {
  if (!AuthService.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App = () => {
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  console.log(GOOGLE_CLIENT_ID)
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <div>
          <Header />
          <Routes>
            <Route path="/" element={<SignIn />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/questions"
              element={
                <ProtectedRoute>
                  <Questions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/question/:title/discussion"
              element={
                <ProtectedRoute>
                  <QuestionDiscussion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/discussions"
              element={
                <ProtectedRoute>
                  <Discussions />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;