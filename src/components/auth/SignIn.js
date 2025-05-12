import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Alert,
  Stack,
  CircularProgress,
  Snackbar,
  Link,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Google,
  Facebook,
  Twitter,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import authService from '../../services/authService';

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Check if user is already logged in
  useEffect(() => {
    const isAuth = authService.isAuthenticated();
    if (isAuth) {
      const user = authService.getCurrentUser();
      if (user) {
        navigate('/');
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const response = await authService.login(formData.email, formData.password);
      
      if (response && response.user) {
        await login(response);
        
        const redirectPath = localStorage.getItem('redirectAfterSignIn');
        
        if (redirectPath) {
          localStorage.removeItem('redirectAfterSignIn');
          navigate(redirectPath);
        } else {
          navigate('/');
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in');
      setSnackbar({
        open: true,
        message: err.message || 'Failed to sign in',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await authService.handleGoogleLogin(credentialResponse);
      await login(response.data);
      
      const redirectPath = localStorage.getItem('redirectAfterSignIn');
      if (redirectPath) {
        localStorage.removeItem('redirectAfterSignIn');
        navigate(redirectPath);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google');
      setSnackbar({
        open: true,
        message: err.message || 'Failed to sign in with Google',
        severity: 'error'
      });
    }
  };

  const handleGoogleError = () => {
    setError('Failed to sign in with Google');
    setSnackbar({
      open: true,
      message: 'Failed to sign in with Google',
      severity: 'error'
    });
  };

  const handleSocialSignIn = async (provider) => {
    try {
      const response = await authService.socialSignIn(provider);
      await login(response.data);
      navigate('/');
    } catch (err) {
      setError(`Failed to sign in with ${provider}`);
      setSnackbar({
        open: true,
        message: err.message || `Failed to sign in with ${provider}`,
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Sign In
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                error={!!error && error.includes('email')}
                autoComplete="email"
                inputProps={{
                  'data-testid': 'email-input'
                }}
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                error={!!error && error.includes('password')}
                autoComplete="current-password"
                inputProps={{
                  'data-testid': 'password-input'
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #00B4D8 90%)',
                  }
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign In'}
              </Button>

              <Box sx={{ mt: 2, mb: 2, textAlign: 'right' }}>
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  variant="body2"
                  color="primary"
                >
                  Forgot password?
                </Link>
              </Box>
            </Stack>
          </form>

          <Box sx={{ my: 3 }}>
            <Divider>
              <Typography color="textSecondary" variant="body2">
                OR
              </Typography>
            </Divider>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              theme="filled_blue"
              shape="pill"
              size="large"
              text="continue_with"
              width="300px"
            />
          </Box>

          <Stack spacing={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Facebook />}
              onClick={() => handleSocialSignIn('Facebook')}
              disabled={loading}
            >
              Continue with Facebook
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Twitter />}
              onClick={() => handleSocialSignIn('Twitter')}
              disabled={loading}
            >
              Continue with Twitter
            </Button>
          </Stack>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Don't have an account?{' '}
              <Button
                color="primary"
                onClick={() => navigate('/signup')}
                disabled={loading}
                sx={{ textTransform: 'none' }}
              >
                Sign Up
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SignIn; 