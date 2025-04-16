// src/components/Header.js
import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';

const Header = () => {
  const navigate = useNavigate();
  const isAuthenticated = AuthService.isAuthenticated();

  const handleLogout = () => {
    AuthService.logout();
    navigate('/');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          DSA Practice
        </Typography>
        {isAuthenticated ? (
          <>
            <Button color="inherit" component={Link} to="/questions">
              Questions
            </Button>
            <Button color="inherit" component={Link} to="/discussions">
              Discussions
            </Button>
            <Button color="inherit" component={Link} to="/profile">
              Profile
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <Button color="inherit" component={Link} to="/">
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;