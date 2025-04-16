import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Container, Typography, Box } from '@mui/material';
import AuthService from '../services/auth.service';

const SignIn = () => {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (response) => {
    try {
      const result = await AuthService.googleSignIn(response.credential);
      localStorage.setItem('user', JSON.stringify(result));
      navigate('/questions');
    } catch (error) {
      console.error('Authentication error:', error);
      alert('Failed to sign in. Please try again.');
    }
  };

  const handleGoogleFailure = () => {
    console.error('Google Sign-In Failed');
    alert('Failed to sign in. Please try again.');
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3
        }}
      >
        <Typography variant="h4" component="h1">
          Welcome to DSA Practice Platform
        </Typography>
        <Typography variant="h6" component="h2">
          Sign in to continue
        </Typography>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleFailure}
          useOneTap
        />
      </Box>
    </Container>
  );
};

export default SignIn;
