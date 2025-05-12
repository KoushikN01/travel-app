import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import TripsPage from './pages/trips/TripsPage';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import Profile from './components/Profile';
import Settings from './components/Settings';
import MFAVerification from './components/auth/MFAVerification';
import PasswordRecovery from './components/auth/PasswordRecovery';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import AdminDashboard from './components/admin/Dashboard';
import Explore from './pages/Explore';
import About from './pages/About';
import Subscription from './pages/Subscription';
import TripList from './components/trips/TripList';
import FlightManagement from './components/trips/FlightManagement';
import HotelManagement from './components/trips/HotelManagement';
import ActivityManagement from './components/trips/ActivityManagement';
import ChatSupport from './components/support/ChatSupport';
import ContactUs from './components/support/ContactUs';
import AdminLogin from './components/admin/Login';
import AdminGuard from './components/admin/AdminGuard';
import SmartRecommendations from './features/ai/SmartRecommendations';
import Booking from './pages/Booking';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196F3',
    },
    secondary: {
      main: '#21CBF3',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <CssBaseline />
            <Router>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<PasswordRecovery />} />
                <Route path="/reset-password" element={<PasswordRecovery />} />
                <Route path="/verify-mfa" element={<MFAVerification />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trips/*"
                  element={
                    <ProtectedRoute>
                      <TripsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/explore"
                  element={
                    <ProtectedRoute>
                      <Explore />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ai-recommendations"
                  element={
                    <ProtectedRoute>
                      <SmartRecommendations />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/booking"
                  element={
                    <ProtectedRoute>
                      <Booking />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/about"
                  element={<About />}
                />
                <Route
                  path="/subscription"
                  element={<Subscription />}
                />
                <Route path="/trips/:tripId/flights" element={<FlightManagement />} />
                <Route path="/trips/:tripId/hotels" element={<HotelManagement />} />
                <Route path="/trips/:tripId/activities" element={<ActivityManagement />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminGuard>
                      <AdminDashboard />
                    </AdminGuard>
                  }
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
              <ChatSupport />
            </Router>
          </LocalizationProvider>
        </GoogleOAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
