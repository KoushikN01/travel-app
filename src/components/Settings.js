import React, { useState, useContext } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Switch,
  FormControlLabel,
  Avatar,
  MenuItem,
} from '@mui/material';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Payment as PaymentIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import authService from '../services/authService';

const Settings = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    enableMFA: user?.mfaEnabled || false,
    enableEmailNotifications: user?.emailNotifications || true,
    enableSMSNotifications: user?.smsNotifications || false,
    preferredLanguage: user?.preferredLanguage || 'en',
    emergencyContact: user?.emergencyContact || '',
    emergencyPhone: user?.emergencyPhone || '',
    passportNumber: user?.passportNumber || '',
    passportExpiry: user?.passportExpiry || '',
    travelPreferences: user?.travelPreferences || [],
    dietaryRestrictions: user?.dietaryRestrictions || [],
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let response;
      switch (dialogType) {
        case 'profile':
          response = await authService.updateProfile(formData);
          break;
        case 'password':
          if (formData.newPassword !== formData.confirmPassword) {
            throw new Error('Passwords do not match');
          }
          response = await authService.changePassword(
            formData.currentPassword,
            formData.newPassword
          );
          break;
        case 'mfa':
          response = await authService.setupMFA();
          break;
        case 'subscription':
          response = await authService.handleSubscription(formData);
          break;
        default:
          throw new Error('Invalid dialog type');
      }
      setMessage({ type: 'success', text: 'Settings updated successfully' });
      updateUser(response.data);
      setOpenDialog(false);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      try {
        const response = await authService.uploadAvatar(file);
        updateUser({ ...user, avatar: response.avatarUrl });
        setMessage({ type: 'success', text: 'Avatar updated successfully' });
      } catch (error) {
        setMessage({ type: 'error', text: error.message });
      } finally {
        setLoading(false);
      }
    }
  };

  const renderProfileSettings = () => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar
          src={authService.getAvatarUrl(user?.avatar)}
          sx={{ width: 100, height: 100, mr: 2 }}
        />
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="avatar-upload"
          type="file"
          onChange={handleAvatarUpload}
        />
        <label htmlFor="avatar-upload">
          <Button variant="contained" component="span">
            Change Avatar
          </Button>
        </label>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderSecuritySettings = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Current Password"
            name="currentPassword"
            type="password"
            value={formData.currentPassword}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="New Password"
            name="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.enableMFA}
                onChange={handleChange}
                name="enableMFA"
              />
            }
            label="Enable Two-Factor Authentication"
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderNotificationSettings = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.enableEmailNotifications}
                onChange={handleChange}
                name="enableEmailNotifications"
              />
            }
            label="Email Notifications"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.enableSMSNotifications}
                onChange={handleChange}
                name="enableSMSNotifications"
              />
            }
            label="SMS Notifications"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            select
            label="Preferred Language"
            name="preferredLanguage"
            value={formData.preferredLanguage}
            onChange={handleChange}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="es">Spanish</MenuItem>
            <MenuItem value="fr">French</MenuItem>
            <MenuItem value="de">German</MenuItem>
          </TextField>
        </Grid>
      </Grid>
    </Box>
  );

  const renderEmergencySettings = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Emergency Contact Name"
            name="emergencyContact"
            value={formData.emergencyContact}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Emergency Contact Phone"
            name="emergencyPhone"
            value={formData.emergencyPhone}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderTravelSettings = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Passport Number"
            name="passportNumber"
            value={formData.passportNumber}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Passport Expiry Date"
            name="passportExpiry"
            type="date"
            value={formData.passportExpiry}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Travel Preferences"
            name="travelPreferences"
            value={formData.travelPreferences}
            onChange={handleChange}
            multiline
            rows={4}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Dietary Restrictions"
            name="dietaryRestrictions"
            value={formData.dietaryRestrictions}
            onChange={handleChange}
            multiline
            rows={4}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderSubscriptionSettings = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Subscription Status
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {user?.subscription?.status === 'active' 
              ? 'Your subscription is active'
              : 'You are currently on the free plan'}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color={user?.subscription?.status === 'active' ? 'error' : 'primary'}
            onClick={() => {
              setDialogType('subscription');
              setOpenDialog(true);
            }}
          >
            {user?.subscription?.status === 'active' 
              ? 'Cancel Subscription'
              : 'Upgrade to Premium'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<PersonIcon />} label="Profile" />
          <Tab icon={<SecurityIcon />} label="Security" />
          <Tab icon={<NotificationsIcon />} label="Notifications" />
          <Tab icon={<PaymentIcon />} label="Subscription" />
          <Tab icon={<LanguageIcon />} label="Emergency & Travel" />
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {activeTab === 0 && renderProfileSettings()}
          {activeTab === 1 && renderSecuritySettings()}
          {activeTab === 2 && renderNotificationSettings()}
          {activeTab === 3 && renderSubscriptionSettings()}
          {activeTab === 4 && (
            <>
              {renderEmergencySettings()}
              <Divider sx={{ my: 3 }} />
              {renderTravelSettings()}
            </>
          )}
        </Box>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setDialogType(['profile', 'security', 'notifications', 'subscription', 'emergency'][activeTab]);
              setOpenDialog(true);
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={!!message.text}
        autoHideDuration={6000}
        onClose={() => setMessage({ type: '', text: '' })}
      >
        <Alert
          severity={message.type}
          onClose={() => setMessage({ type: '', text: '' })}
        >
          {message.text}
        </Alert>
      </Snackbar>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Changes</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to save these changes?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Settings; 