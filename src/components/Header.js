// src/components/Header.js
import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';

const Header = () => {
  const navigate = useNavigate();
  const isAuthenticated = AuthService.isAuthenticated();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/');
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  return (
    <AppBar position="static" style={{ backgroundColor: '#282828' }}>
      <Toolbar>
        {/* Hamburger Menu Icon for Mobile, positioned to the right */}
        <IconButton
          edge="end"
          color="inherit"
          aria-label="menu"
          onClick={toggleDrawer(true)}
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        {/* Drawer for Mobile Menu */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={toggleDrawer(false)}
          PaperProps={{
            style: {
              backgroundColor: '#2A2A2A',
              height: '100%',
              width: '40%',
            },
          }}
        >
          <List style={{ padding: 0 }}>
            {isAuthenticated ? (
              <>
                <ListItem button component={Link} to="/questions" onClick={toggleDrawer(false)}>
                  <ListItemText primary="Questions" style={{ color: '#ffffff' }} />
                </ListItem>
                <ListItem button component={Link} to="/discussions" onClick={toggleDrawer(false)}>
                  <ListItemText primary="Discussions" style={{ color: '#ffffff' }} />
                </ListItem>
                <ListItem button component={Link} to="/feedback" onClick={toggleDrawer(false)}>
                  <ListItemText primary="Submit Feedback" style={{ color: '#ffffff' }} />
                </ListItem>
                <ListItem button onClick={() => { handleLogout(); toggleDrawer(false)(); }}>
                  <ListItemText primary="Logout" style={{ color: '#ffffff' }} />
                </ListItem>
              </>
            ) : (
              <ListItem button component={Link} to="/" onClick={toggleDrawer(false)}>
                <ListItemText primary="Login" style={{ color: '#ffffff' }} />
              </ListItem>
            )}
          </List>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
};

export default Header;