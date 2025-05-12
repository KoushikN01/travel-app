import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Stack,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  ListItemIcon,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Flight,
  Hotel,
  DirectionsWalk,
  Share,
  CalendarMonth,
  Star,
  Lock,
  CreditCard,
  AccountBalance,
  PhoneAndroid,
  SmartToy,
  Support,
  Analytics,
  Group,
  AutoAwesome,
  CameraAlt,
  Tour,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import tripService from '../../services/tripService';
import authService from '../../services/authService';
import TravelBooking from './TravelBooking';

const TripList = ({ onTripSelect }) => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openFeatureDialog, setOpenFeatureDialog] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newTrip, setNewTrip] = useState({
    title: '',
    startDate: '',
    endDate: '',
    destinations: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    upiId: '',
    bankAccount: '',
    ifscCode: '',
  });
  const [user, setUser] = useState(authService.getUser());
  const [showTravelBooking, setShowTravelBooking] = useState(false);

  const premiumFeatures = [
    { 
      id: 1,
      name: 'AI Trip Planning',
      price: '₹199',
      description: 'Get AI-powered suggestions for your entire trip',
      icon: <SmartToy />
    },
    {
      id: 2,
      name: 'Priority Support',
      price: '₹149',
      description: '24/7 dedicated customer support',
      icon: <Support />
    },
    {
      id: 3,
      name: 'Advanced Analytics',
      price: '₹299',
      description: 'Detailed insights and travel patterns',
      icon: <Analytics />
    },
    {
      id: 4,
      name: 'Collaborative Planning',
      price: '₹249',
      description: 'Plan trips with friends in real-time',
      icon: <Group />
    },
    {
      id: 5,
      name: 'Premium Templates',
      price: '₹179',
      description: 'Access to curated trip templates',
      icon: <AutoAwesome />
    },
    {
      id: 6,
      name: 'Professional Camera',
      price: '₹399',
      description: 'High-quality DSLR camera with accessories for your trip (Security deposit required)',
      icon: <CameraAlt />
    },
    {
      id: 7,
      name: 'Personal Trip Guide',
      price: '₹1499/day',
      description: 'Expert local guide (₹1499/day for regular users, ₹999/day for premium users)',
      perDay: true,
      premiumPrice: '₹999/day',
      icon: <Tour />
    }
  ];

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const fetchedTrips = await tripService.getAllTrips();
      setTrips(fetchedTrips);
      // Trigger a custom event to notify the navbar
      window.dispatchEvent(new CustomEvent('tripsUpdated', { 
        detail: { hasTrips: fetchedTrips.length > 0 } 
      }));
    } catch (err) {
      setError(err.message);
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (trip = null) => {
    if (trip) {
      setSelectedTrip(trip);
      setNewTrip({
        title: trip.title,
        startDate: trip.startDate.split('T')[0],
        endDate: trip.endDate.split('T')[0],
        destinations: trip.destinations.join(', '),
      });
    } else {
      setSelectedTrip(null);
      setNewTrip({
        title: '',
        startDate: '',
        endDate: '',
        destinations: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTrip(null);
    setError('');
  };

  const handleSaveTrip = async (tripData) => {
    try {
      if (selectedTrip) {
        await tripService.updateTrip(selectedTrip._id, tripData);
        setSnackbar({
          open: true,
          message: 'Trip updated successfully',
          severity: 'success'
        });
      } else {
        await tripService.createTrip(tripData);
        setSnackbar({
          open: true,
          message: 'Trip created successfully',
          severity: 'success'
        });
        setOpenDialog(false);
        setOpenFeatureDialog(true);
      }

      handleCloseDialog();
      await fetchTrips();
    } catch (err) {
      setError(err.message || 'Failed to save trip');
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
  };

  const handleDeleteTrip = async (tripId) => {
    try {
      await tripService.deleteTrip(tripId);
      const updatedTrips = trips.filter(trip => trip._id !== tripId);
      setTrips(updatedTrips);
      // Trigger a custom event to notify the navbar
      window.dispatchEvent(new CustomEvent('tripsUpdated', { 
        detail: { hasTrips: updatedTrips.length > 0 } 
      }));
      setSnackbar({
        open: true,
        message: 'Trip deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
  };

  const handleViewDetails = (trip) => {
    if (onTripSelect) {
      onTripSelect(trip);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubscribe = () => {
    navigate('/subscription');
  };

  const handleFeatureSelect = (feature) => {
    setSelectedFeature(feature);
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
        message: `Successfully purchased ${selectedFeature.name}!`,
        severity: 'success'
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

  const handleTravelBookingComplete = (bookingData) => {
    // Create a new trip with the booking data
    const newTripData = {
      title: `Trip to ${bookingData.to}`,
      startDate: bookingData.departureDate,
      endDate: bookingData.returnDate,
      destinations: [bookingData.from, bookingData.to],
      transportMode: bookingData.transportMode,
      accommodation: bookingData.accommodation,
      travelers: bookingData.travelers,
      duration: bookingData.duration,
      costEstimate: bookingData.costEstimate
    };

    handleSaveTrip(newTripData);
    setShowTravelBooking(false);
  };

  const renderFeatures = (trip) => {
    if (!user?.subscription) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Star fontSize="small" />
          Premium Features Available:
        </Typography>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmartToy fontSize="small" color="primary" />
              <Typography variant="body2">AI Planning</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Support fontSize="small" color="primary" />
              <Typography variant="body2">Priority Support</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Analytics fontSize="small" color="primary" />
              <Typography variant="body2">Trip Analytics</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Group fontSize="small" color="primary" />
              <Typography variant="body2">Collaboration</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case 'card':
        return (
          <Stack spacing={2}>
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
          </Stack>
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
        const calculateEMI = (amount, months) => {
          const principal = parseFloat(amount.replace(/[^0-9.-]+/g, ""));
          const ratePerMonth = 0.01; // 1% monthly interest
          const EMI = (principal * ratePerMonth * Math.pow(1 + ratePerMonth, months)) / 
                     (Math.pow(1 + ratePerMonth, months) - 1);
          return Math.round(EMI);
        };

        const featurePrice = selectedFeature?.price || '₹199';
        const emiOptions = [
          { months: 3, amount: calculateEMI(featurePrice, 3) },
          { months: 6, amount: calculateEMI(featurePrice, 6) },
          { months: 12, amount: calculateEMI(featurePrice, 12) }
        ];

        return (
          <Stack spacing={2}>
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
            <FormControl>
              <FormLabel>EMI Duration</FormLabel>
              <RadioGroup
                row
                name="emiDuration"
                value={paymentDetails.emiDuration}
                onChange={handlePaymentDetailsChange}
              >
                {emiOptions.map((option) => (
                  <FormControlLabel
                    key={option.months}
                    value={option.months.toString()}
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body2">{option.months} months</Typography>
                        <Typography variant="caption" color="text.secondary">
                          ₹{option.amount}/month
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </RadioGroup>
            </FormControl>
            <Typography variant="caption" color="text.secondary">
              *EMI calculations include 12% annual interest rate
            </Typography>
          </Stack>
        );

      default:
        return null;
    }
  };

  if (loading && trips.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {showTravelBooking ? (
        <TravelBooking onBookingComplete={handleTravelBookingComplete} />
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4" component="h1">
              My Trips
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setShowTravelBooking(true)}
            >
              Plan New Trip
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {trips.map((trip) => (
              <Grid item xs={12} md={6} key={trip._id}>
                <Card 
                  elevation={3}
                  onClick={() => handleViewDetails(trip)}
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={trip.image || `https://source.unsplash.com/800x600/?${trip.destinations[0]},travel`}
                    alt={trip.title}
                  />
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {trip.title}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                          <Chip
                            icon={<CalendarMonth />}
                            label={`${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}`}
                            size="small"
                          />
                          <Chip
                            label={trip.status}
                            color={trip.status === 'upcoming' ? 'primary' : 'secondary'}
                            size="small"
                          />
                        </Stack>
                      </Box>
                      <Box onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="Edit Trip">
                          <IconButton onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDialog(trip);
                          }}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Trip">
                          <IconButton 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTrip(trip._id);
                            }} 
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Share Trip">
                          <IconButton>
                            <Share />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      {trip.destinations.map((destination, index) => (
                        <Chip key={index} label={destination} size="small" />
                      ))}
                    </Stack>
                    <Box 
                      sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Flight />}
                        onClick={() => {
                          setSelectedTrip(trip);
                          setOpenDialog(false);
                          navigate(`/trips/${trip._id}/flights`);
                        }}
                      >
                        Flights
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Hotel />}
                        onClick={() => {
                          setSelectedTrip(trip);
                          setOpenDialog(false);
                          navigate(`/trips/${trip._id}/hotels`);
                        }}
                      >
                        Hotels
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DirectionsWalk />}
                        onClick={() => {
                          setSelectedTrip(trip);
                          setOpenDialog(false);
                          navigate(`/trips/${trip._id}/activities`);
                        }}
                      >
                        Activities
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Star />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenFeatureDialog(true);
                        }}
                        sx={{
                          background: 'linear-gradient(45deg, #FFA726 30%, #FFB74D 90%)',
                          color: 'white',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #FB8C00 30%, #FFA726 90%)',
                          }
                        }}
                      >
                        Subscribe to Features
                      </Button>
                    </Box>
                    {renderFeatures(trip)}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
            <DialogTitle>
              {selectedTrip ? 'Edit Trip' : 'Create New Trip'}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Trip Title"
                  fullWidth
                  value={newTrip.title}
                  onChange={(e) => setNewTrip({ ...newTrip, title: e.target.value })}
                  required
                  error={!newTrip.title}
                  helperText={!newTrip.title && 'Title is required'}
                />
                <TextField
                  label="Start Date"
                  type="date"
                  fullWidth
                  value={newTrip.startDate}
                  onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                  error={!newTrip.startDate}
                  helperText={!newTrip.startDate && 'Start date is required'}
                />
                <TextField
                  label="End Date"
                  type="date"
                  fullWidth
                  value={newTrip.endDate}
                  onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                  error={!newTrip.endDate}
                  helperText={!newTrip.endDate && 'End date is required'}
                />
                <TextField
                  label="Destinations (comma-separated)"
                  fullWidth
                  value={newTrip.destinations}
                  onChange={(e) => setNewTrip({ ...newTrip, destinations: e.target.value })}
                  helperText="Enter destinations separated by commas"
                  required
                  error={!newTrip.destinations}
                />
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Enhance your trip with premium features
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Star />}
                    onClick={() => {
                      handleCloseDialog();
                      setOpenFeatureDialog(true);
                    }}
                    sx={{
                      background: 'linear-gradient(45deg, #FFA726 30%, #FFB74D 90%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #FB8C00 30%, #FFA726 90%)',
                      }
                    }}
                  >
                    View Premium Features
                  </Button>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button 
                onClick={() => handleSaveTrip(newTrip)} 
                variant="contained"
                disabled={!newTrip.title || !newTrip.startDate || !newTrip.endDate || !newTrip.destinations}
              >
                {selectedTrip ? 'Save Changes' : 'Create Trip'}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={openFeatureDialog} onClose={() => setOpenFeatureDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Star color="primary" />
                <Typography variant="h6">Enhance Your Trip with Premium Features</Typography>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" color="text.secondary" paragraph>
                Unlock premium features to make your trip planning experience even better!
              </Typography>
              
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Premium Plan
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Get all features for just ₹799/month
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleSubscribe()}
                    sx={{
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      color: 'white',
                    }}
                  >
                    Subscribe Now
                  </Button>
                </CardContent>
              </Card>

              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Or purchase features individually
                </Typography>
              </Divider>

              <List>
                {premiumFeatures.map((feature) => (
                  <ListItem key={feature.id}>
                    <ListItemIcon>{feature.icon}</ListItemIcon>
                    <ListItemText
                      primary={feature.name}
                      secondary={
                        <React.Fragment>
                          <Typography variant="body2" color="text.secondary">
                            {feature.description}
                          </Typography>
                          <Typography variant="subtitle2" color="primary">
                            {feature.price}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleFeatureSelect(feature)}
                      >
                        Purchase
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenFeatureDialog(false)}>
                Maybe Later
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={paymentDialog} onClose={() => !loading && setPaymentDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>
              Purchase Feature
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3, mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedFeature?.name} - {selectedFeature?.price}
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
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </>
      )}
    </Container>
  );
};

export default TripList; 