import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const steps = ['Select Dates', 'Traveler Details', 'Review & Book'];

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { destination, estimatedCost, bestTimeToVisit, category } = location.state || {};

  const [activeStep, setActiveStep] = useState(0);
  const [bookingDetails, setBookingDetails] = useState({
    startDate: null,
    endDate: null,
    travelers: 1,
    name: '',
    email: '',
    phone: '',
    specialRequests: ''
  });
  const [error, setError] = useState(null);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name) => (date) => {
    setBookingDetails(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const handleSubmit = async () => {
    try {
      // Here you would typically make an API call to process the booking
      console.log('Booking details:', { destination, ...bookingDetails });
      // For now, just show success and redirect
      alert('Booking successful!');
      navigate('/');
    } catch (err) {
      setError('Failed to process booking. Please try again.');
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={bookingDetails.startDate}
                  onChange={handleDateChange('startDate')}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={bookingDetails.endDate}
                  onChange={handleDateChange('endDate')}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Number of Travelers"
                name="travelers"
                value={bookingDetails.travelers}
                onChange={handleInputChange}
                inputProps={{ min: 1, max: 10 }}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={bookingDetails.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={bookingDetails.email}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={bookingDetails.phone}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Special Requests"
                name="specialRequests"
                value={bookingDetails.specialRequests}
                onChange={handleInputChange}
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Box>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Booking Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">
                      Destination: {destination}
                    </Typography>
                    <Typography variant="subtitle1">
                      Category: {category}
                    </Typography>
                    <Typography variant="subtitle1">
                      Estimated Cost: {estimatedCost}
                    </Typography>
                    <Typography variant="subtitle1">
                      Best Time to Visit: {bestTimeToVisit}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">
                      Travel Dates: {bookingDetails.startDate?.toLocaleDateString()} - {bookingDetails.endDate?.toLocaleDateString()}
                    </Typography>
                    <Typography variant="subtitle1">
                      Number of Travelers: {bookingDetails.travelers}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  if (!destination) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          No destination selected. Please go back and select a destination.
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Book Your Trip to {destination}
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
          >
            {activeStep === steps.length - 1 ? 'Confirm Booking' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Booking; 