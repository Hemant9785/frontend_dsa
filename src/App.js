// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './components/Header';
import SignIn from './components/SignIn';
import Profile from './components/Profile';
import Questions from './components/Questions'; // Import your Questions component
import Discussions from './components/Discussions';
import AuthService from './services/auth.service';
import QuestionDiscussion from './components/QuestionDiscussion';
import Feedback from './components/Feedback';

// Create a theme with the desired colors
const theme = createTheme({
  palette: {
    background: {
      default: '#1A1A1A',
    },
    text: {
      primary: '#ffffff',
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  if (!AuthService.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App = () => {
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
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
              <Route path="/feedback" element={<Feedback />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
};

export default App;