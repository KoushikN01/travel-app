import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  CreditCard,
  AccountBalance,
  PhoneAndroid,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TrainIcon from '@mui/icons-material/Train';
import FlightIcon from '@mui/icons-material/Flight';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';

const TravelBooking = ({ onBookingComplete }) => {
  const [bookingData, setBookingData] = useState({
    from: '',
    to: '',
    departureDate: null,
    returnDate: null,
    travelers: 1,
    transportMode: 'flight',
    accommodation: 'hotel',
    duration: 1,
  });
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [selectedEMI, setSelectedEMI] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    upiId: '',
    bankAccount: '',
    ifscCode: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Sample cost estimation function (you can replace with actual API calls)
  const estimateCost = () => {
    const baseCosts = {
      flight: 500,
      train: 200,
      bus: 100,
      car: 300,
    };

    const accommodationCosts = {
      hotel: 150,
      hostel: 50,
      apartment: 200,
    };

    const transportCost = baseCosts[bookingData.transportMode] * bookingData.travelers;
    const stayCost = accommodationCosts[bookingData.accommodation] * bookingData.duration * bookingData.travelers;
    
    return {
      transport: transportCost,
      accommodation: stayCost,
      total: transportCost + stayCost,
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name) => (date) => {
    setBookingData(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const costEstimate = estimateCost();
    onBookingComplete({
      ...bookingData,
      costEstimate
    });
  };

  const handleEMISelect = (emiOption) => {
    setSelectedEMI(emiOption);
    setPaymentDialog(true);
  };

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handlePaymentDetailsChange = (e) => {
    setPaymentDetails({
      ...paymentDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Validate payment details
      if (paymentMethod === 'card') {
        if (!paymentDetails.cardNumber || !paymentDetails.cardExpiry || !paymentDetails.cardCvv) {
          throw new Error('Please fill in all card details');
        }
      } else if (paymentMethod === 'upi') {
        if (!paymentDetails.upiId) {
          throw new Error('Please enter UPI ID');
        }
      } else if (paymentMethod === 'emi') {
        if (!paymentDetails.bankAccount || !paymentDetails.ifscCode) {
          throw new Error('Please fill in all EMI details');
        }
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      setPaymentDialog(false);
      setSnackbar({
        open: true,
        message: 'Payment successful! Proceeding with booking.',
        severity: 'success'
      });

      // Proceed with booking after successful payment
      const costEstimate = estimateCost();
      onBookingComplete({
        ...bookingData,
        costEstimate,
        paymentDetails: {
          method: paymentMethod,
          emiOption: selectedEMI,
          ...paymentDetails
        }
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Payment failed',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case 'card':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Card Number"
              name="cardNumber"
              value={paymentDetails.cardNumber}
              onChange={handlePaymentDetailsChange}
              placeholder="1234 5678 9012 3456"
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Expiry Date"
                name="cardExpiry"
                value={paymentDetails.cardExpiry}
                onChange={handlePaymentDetailsChange}
                placeholder="MM/YY"
                required
              />
              <TextField
                label="CVV"
                name="cardCvv"
                value={paymentDetails.cardCvv}
                onChange={handlePaymentDetailsChange}
                type="password"
                required
              />
            </Box>
          </Box>
        );

      case 'upi':
        return (
          <TextField
            fullWidth
            label="UPI ID"
            name="upiId"
            value={paymentDetails.upiId}
            onChange={handlePaymentDetailsChange}
            placeholder="username@upi"
            required
          />
        );

      case 'emi':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Bank Account Number"
              name="bankAccount"
              value={paymentDetails.bankAccount}
              onChange={handlePaymentDetailsChange}
              required
            />
            <TextField
              fullWidth
              label="IFSC Code"
              name="ifscCode"
              value={paymentDetails.ifscCode}
              onChange={handlePaymentDetailsChange}
              required
            />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Plan Your Journey
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              {/* From and To Fields */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="From"
                  name="from"
                  value={bookingData.from}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="To"
                  name="to"
                  value={bookingData.to}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              {/* Dates */}
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Departure Date"
                  value={bookingData.departureDate}
                  onChange={handleDateChange('departureDate')}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Return Date"
                  value={bookingData.returnDate}
                  onChange={handleDateChange('returnDate')}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Grid>

              {/* Transport Mode */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Transport Mode</InputLabel>
                  <Select
                    name="transportMode"
                    value={bookingData.transportMode}
                    onChange={handleInputChange}
                    label="Transport Mode"
                  >
                    <MenuItem value="flight">
                      <FlightIcon sx={{ mr: 1 }} /> Flight
                    </MenuItem>
                    <MenuItem value="train">
                      <TrainIcon sx={{ mr: 1 }} /> Train
                    </MenuItem>
                    <MenuItem value="bus">
                      <DirectionsBusIcon sx={{ mr: 1 }} /> Bus
                    </MenuItem>
                    <MenuItem value="car">
                      <DirectionsCarIcon sx={{ mr: 1 }} /> Car
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Accommodation Type */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Accommodation</InputLabel>
                  <Select
                    name="accommodation"
                    value={bookingData.accommodation}
                    onChange={handleInputChange}
                    label="Accommodation"
                  >
                    <MenuItem value="hotel">Hotel</MenuItem>
                    <MenuItem value="hostel">Hostel</MenuItem>
                    <MenuItem value="apartment">Apartment</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Number of Travelers */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Number of Travelers"
                  name="travelers"
                  value={bookingData.travelers}
                  onChange={handleInputChange}
                  inputProps={{ min: 1 }}
                  required
                />
              </Grid>

              {/* Duration */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Duration (days)"
                  name="duration"
                  value={bookingData.duration}
                  onChange={handleInputChange}
                  inputProps={{ min: 1 }}
                  required
                />
              </Grid>
            </Grid>

            {/* Cost Estimate */}
            <Paper sx={{ mt: 3, p: 2, bgcolor: 'background.default' }}>
              <Typography variant="h6" gutterBottom>
                Estimated Cost
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography>Transport:</Typography>
                  <Typography>Accommodation:</Typography>
                  <Typography variant="h6" sx={{ mt: 1 }}>Total:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography align="right">${estimateCost().transport}</Typography>
                  <Typography align="right">${estimateCost().accommodation}</Typography>
                  <Typography variant="h6" align="right" sx={{ mt: 1 }}>
                    ${estimateCost().total}
                  </Typography>
                </Grid>
              </Grid>

              {/* EMI Options */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  EMI Options Available
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { months: 3, interest: 12 },
                    { months: 6, interest: 15 },
                    { months: 12, interest: 18 }
                  ].map((option) => {
                    const total = estimateCost().total;
                    const monthlyInterest = option.interest / 12 / 100;
                    const emi = (total * monthlyInterest * Math.pow(1 + monthlyInterest, option.months)) / 
                              (Math.pow(1 + monthlyInterest, option.months) - 1);
                    
                    return (
                      <Grid item xs={12} md={4} key={option.months}>
                        <Paper 
                          elevation={2} 
                          sx={{ 
                            p: 2, 
                            textAlign: 'center',
                            border: '1px solid #e0e0e0',
                            cursor: 'pointer',
                            '&:hover': {
                              borderColor: 'primary.main',
                              boxShadow: 3
                            }
                          }}
                          onClick={() => handleEMISelect(option)}
                        >
                          <Typography variant="h6" color="primary">
                            {option.months} Months
                          </Typography>
                          <Typography variant="h5" sx={{ my: 1 }}>
                            ${Math.round(emi)}/month
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Interest Rate: {option.interest}% p.a.
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Interest: ${Math.round((emi * option.months) - total)}
                          </Typography>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Paper>

            {/* Payment Dialog */}
            <Dialog open={paymentDialog} onClose={() => !loading && setPaymentDialog(false)} maxWidth="sm" fullWidth>
              <DialogTitle>
                Complete Your Payment
              </DialogTitle>
              <DialogContent>
                <Box sx={{ mb: 3, mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    EMI Plan: {selectedEMI?.months} Months
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Monthly Payment: ${Math.round((estimateCost().total * (selectedEMI?.interest / 12 / 100) * 
                      Math.pow(1 + (selectedEMI?.interest / 12 / 100), selectedEMI?.months)) / 
                      (Math.pow(1 + (selectedEMI?.interest / 12 / 100), selectedEMI?.months) - 1))}
                  </Typography>
                  
                  <FormControl component="fieldset" sx={{ width: '100%', mt: 2 }}>
                    <FormLabel component="legend">Select Payment Method</FormLabel>
                    <RadioGroup
                      row
                      value={paymentMethod}
                      onChange={handlePaymentMethodChange}
                    >
                      <FormControlLabel
                        value="card"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CreditCard sx={{ mr: 1 }} /> Card
                          </Box>
                        }
                      />
                      <FormControlLabel
                        value="upi"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PhoneAndroid sx={{ mr: 1 }} /> UPI
                          </Box>
                        }
                      />
                      <FormControlLabel
                        value="emi"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccountBalance sx={{ mr: 1 }} /> EMI
                          </Box>
                        }
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>

                {renderPaymentForm()}
              </DialogContent>
              <DialogActions>
                <Button 
                  onClick={() => setPaymentDialog(false)} 
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handlePayment}
                  disabled={loading}
                  sx={{
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    color: 'white',
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Pay Now'}
                </Button>
              </DialogActions>
            </Dialog>

            <Snackbar
              open={snackbar.open}
              autoHideDuration={6000}
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
                {snackbar.message}
              </Alert>
            </Snackbar>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
              >
                Proceed to Booking
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};

export default TravelBooking; 