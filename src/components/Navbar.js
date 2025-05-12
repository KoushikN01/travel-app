import React, { useState, useContext, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  Tooltip,
  Avatar,
  Divider,
  ListItemIcon,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Add as AddIcon,
  AccountCircle,
  Settings,
  Logout,
  Person,
  Star,
  Dashboard,
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import tripService from '../services/tripService';
import authService from '../services/authService';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const [hasTrips, setHasTrips] = useState(false);

  useEffect(() => {
    if (user) {
      checkUserTrips();
    }
  }, [user]);

  // Add event listener for trip updates
  useEffect(() => {
    const handleTripsUpdated = (event) => {
      setHasTrips(event.detail.hasTrips);
    };

    window.addEventListener('tripsUpdated', handleTripsUpdated);
    return () => {
      window.removeEventListener('tripsUpdated', handleTripsUpdated);
    };
  }, []);

  const checkUserTrips = async () => {
    try {
      const trips = await tripService.getAllTrips();
      setHasTrips(trips.length > 0);
    } catch (err) {
      console.error('Error checking trips:', err);
    }
  };

  const handleMobileMenu = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleUserMenu = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleCloseMobileMenu = () => {
    setMobileMenuAnchor(null);
  };

  const handleCloseUserMenu = () => {
    setUserMenuAnchor(null);
  };

  const handlePlanTrip = () => {
    navigate('/trips');
    handleCloseMobileMenu();
  };

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
    navigate('/');
  };

  const handleProfile = () => {
    navigate('/profile');
    handleCloseUserMenu();
    handleCloseMobileMenu();
  };

  const handleSubscribe = () => {
    if (!user) {
      navigate('/signin');
      handleCloseMobileMenu();
      return;
    }
    navigate('/subscription');
    handleCloseMobileMenu();
  };

  const handleSettings = () => {
    navigate('/settings');
    handleCloseUserMenu();
  };

  const pages = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
    { name: 'AI Recommendations', path: '/ai-recommendations' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  const menuItems = [
    ...pages,
    ...(hasTrips ? [{ label: 'My Trips', path: '/trips' }] : []),
  ];

  const renderSubscribeButton = () => {
    // Don't show subscribe button if user has a subscription
    if (user?.subscription) return null;

    return (
      <Button
        variant="contained"
        startIcon={<Star />}
        onClick={handleSubscribe}
        sx={{
          mr: 2,
          background: 'linear-gradient(45deg, #FFA726 30%, #FFB74D 90%)',
          color: 'white',
          '&:hover': {
            background: 'linear-gradient(45deg, #FB8C00 30%, #FFA726 90%)',
          }
        }}
      >
        Subscribe
      </Button>
    );
  };

  const renderAuthButtons = () => {
    if (user) {
      return (
        <>
          {user.role === 'admin' && (
            <Button
              color="inherit"
              component={Link}
              to="/admin"
              startIcon={<Dashboard />}
            >
              Admin
            </Button>
          )}
          {renderSubscribeButton()}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handlePlanTrip}
            sx={{
              mr: 2,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #00B4D8 90%)',
              }
            }}
          >
            Plan Trip
          </Button>
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleUserMenu}
              size="small"
              sx={{ ml: 2 }}
            >
              <Avatar
                sx={{ width: 32, height: 32 }}
                src={user && user.avatar ? authService.getAvatarUrl(user.avatar) : null}
              >
                {user?.firstName?.[0]}
              </Avatar>
            </IconButton>
          </Tooltip>
          {renderUserMenu()}
        </>
      );
    }
    return (
      <>
        {renderSubscribeButton()}
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/signin')}
        >
          Sign In
        </Button>
      </>
    );
  };

  const renderUserMenu = () => (
    <Menu
      anchorEl={userMenuAnchor}
      open={Boolean(userMenuAnchor)}
      onClose={handleCloseUserMenu}
      onClick={handleCloseUserMenu}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <MenuItem onClick={handleProfile}>
        <ListItemIcon>
          <Person fontSize="small" />
        </ListItemIcon>
        Profile
      </MenuItem>
      <MenuItem onClick={handleSettings}>
        <ListItemIcon>
          <Settings fontSize="small" />
        </ListItemIcon>
        Settings
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <Logout fontSize="small" />
        </ListItemIcon>
        Logout
      </MenuItem>
    </Menu>
  );

  return (
    <AppBar position="static" color="transparent" elevation={1}>
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 'bold'
          }}
        >
          TravelApp
        </Typography>

        {isMobile ? (
          <>
            {renderAuthButtons()}
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenu}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={mobileMenuAnchor}
              open={Boolean(mobileMenuAnchor)}
              onClose={handleCloseMobileMenu}
            >
              {menuItems.map((item) => (
                <MenuItem
                  key={item.label || item.name}
                  component={Link}
                  to={item.path}
                  onClick={handleCloseMobileMenu}
                >
                  {item.label || item.name}
                </MenuItem>
              ))}
              <Divider />
              {renderAuthButtons()}
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {menuItems.map((item) => (
              <Button
                key={item.label || item.name}
                component={Link}
                to={item.path}
                color="inherit"
              >
                {item.label || item.name}
              </Button>
            ))}
            {renderAuthButtons()}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 