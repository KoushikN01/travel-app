import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
} from '@mui/material';
import { Check, Star, Payment, CreditCard, QrCode2, CalendarMonth } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';

const Subscription = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [openPayment, setOpenPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [emiPlan, setEmiPlan] = useState('3');
  const [upiId, setUpiId] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handlePaymentOpen = (plan) => {
    setSelectedPlan(plan);
    setOpenPayment(true);
  };

  const handlePaymentClose = () => {
    setOpenPayment(false);
    setSelectedPlan(null);
    setPaymentDetails({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
    });
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update user subscription
      const subscriptionData = {
        planName: selectedPlan.title,
        price: selectedPlan.price,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        features: selectedPlan.features,
      };

      await authService.handleSubscription(subscriptionData);
      updateUser({
        ...user,
        subscription: subscriptionData,
      });

      setSnackbar({
        open: true,
        message: 'Payment successful! You are now subscribed to ' + selectedPlan.title,
        severity: 'success'
      });

      handlePaymentClose();
      setTimeout(() => navigate('/profile'), 2000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Payment failed. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const calculateEMI = (totalAmount, months) => {
    const interest = months === 3 ? 0.03 : months === 6 ? 0.05 : 0.08;
    const principal = parseFloat(totalAmount.replace(/[^0-9.-]+/g, ''));
    const totalPayable = principal * (1 + interest);
    const emi = totalPayable / months;
    return {
      monthly: Math.round(emi),
      total: Math.round(totalPayable),
      interest: Math.round(totalPayable - principal)
    };
  };

  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case 'card':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Card Number"
                fullWidth
                value={paymentDetails.cardNumber}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                placeholder="1234 5678 9012 3456"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Expiry Date"
                fullWidth
                value={paymentDetails.expiryDate}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, expiryDate: e.target.value })}
                placeholder="MM/YY"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="CVV"
                fullWidth
                value={paymentDetails.cvv}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
                placeholder="123"
                type="password"
              />
            </Grid>
          </Grid>
        );

      case 'upi':
        return (
          <Box>
            <TextField
              label="UPI ID"
              fullWidth
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="username@upi"
              helperText="Enter your UPI ID (e.g., username@upi)"
            />
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1, textAlign: 'center' }}>
              <QrCode2 sx={{ fontSize: 100, color: 'primary.main' }} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Scan QR code with any UPI app
              </Typography>
            </Box>
          </Box>
        );

      case 'emi':
        const price = selectedPlan?.price || '₹0';
        return (
          <Box>
            <FormControl component="fieldset">
              <FormLabel component="legend">Choose EMI Plan</FormLabel>
              <RadioGroup
                value={emiPlan}
                onChange={(e) => setEmiPlan(e.target.value)}
              >
                {['3', '6', '12'].map((months) => {
                  const { monthly, total, interest } = calculateEMI(price, parseInt(months));
                  return (
                    <FormControlLabel
                      key={months}
                      value={months}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="subtitle1">
                            {months} months at ₹{monthly}/month
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total: ₹{total} (Interest: ₹{interest})
                          </Typography>
                        </Box>
                      }
                    />
                  );
                })}
              </RadioGroup>
            </FormControl>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Card Number"
                  fullWidth
                  value={paymentDetails.cardNumber}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                  placeholder="1234 5678 9012 3456"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Expiry Date"
                  fullWidth
                  value={paymentDetails.expiryDate}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, expiryDate: e.target.value })}
                  placeholder="MM/YY"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="CVV"
                  fullWidth
                  value={paymentDetails.cvv}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
                  placeholder="123"
                  type="password"
                />
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  const plans = [
    {
      title: 'Free Plan',
      price: '₹0',
      period: 'forever',
      features: [
        'Basic trip planning',
        'Limited trip storage',
        'Essential travel tools',
        'Standard support',
        'Basic trip sharing'
      ],
      buttonText: 'Current Plan',
      isCurrentPlan: true
    },
    {
      title: 'Premium Plan',
      price: '₹799',
      period: 'per month',
      features: [
        'Unlimited trip planning',
        'Advanced trip analytics',
        'Priority customer support',
        'AI-powered recommendations',
        'Real-time flight updates',
        'Exclusive travel deals',
        'Advanced collaboration tools',
        'Custom trip templates',
        'Camera rental at ₹499/day (50% off)',
        'Trip Guide at ₹1499/day (25% off)'
      ],
      buttonText: 'Upgrade Now',
      isCurrentPlan: false,
      highlighted: true
    },
    {
      title: 'Family Plan',
      price: '₹1499',
      period: 'per month',
      features: [
        'All Premium features',
        'Up to 5 family members',
        'Family trip coordination',
        'Shared trip calendars',
        'Family expense tracking',
        'Group booking discounts',
        'Family safety features',
        'Camera rental at ₹399/day (60% off)',
        'Trip Guide at ₹1399/day (30% off)'
      ],
      buttonText: 'Choose Plan',
      isCurrentPlan: false
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" component="h1" gutterBottom>
          Choose Your Plan
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Select the perfect plan for your travel needs
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        {plans.map((plan) => (
          <Grid item xs={12} md={4} key={plan.title}>
            <Card
              elevation={plan.highlighted ? 8 : 2}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transform: plan.highlighted ? 'scale(1.05)' : 'none',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: plan.highlighted ? 'scale(1.08)' : 'scale(1.03)',
                },
                ...(plan.highlighted && {
                  border: '2px solid',
                  borderColor: 'primary.main',
                })
              }}
            >
              {plan.highlighted && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 20,
                    right: -30,
                    transform: 'rotate(45deg)',
                    backgroundColor: 'primary.main',
                    color: 'white',
                    px: 4,
                    py: 0.5,
                  }}
                >
                  Popular
                </Box>
              )}
              <CardContent sx={{ flexGrow: 1, p: 4 }}>
                <Typography variant="h4" component="h2" gutterBottom align="center">
                  {plan.title}
                </Typography>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h3" component="p" color="primary">
                    {plan.price}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {plan.period}
                  </Typography>
                </Box>
                <List>
                  {plan.features.map((feature) => (
                    <ListItem key={feature} sx={{ py: 1 }}>
                      <ListItemIcon>
                        <Check color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Button
                    variant={plan.isCurrentPlan ? "outlined" : "contained"}
                    size="large"
                    disabled={plan.isCurrentPlan || (user?.subscription && user.subscription.planName === plan.title)}
                    fullWidth
                    onClick={() => handlePaymentOpen(plan)}
                    sx={{
                      py: 1.5,
                      ...(plan.highlighted && {
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #1976D2 30%, #00B4D8 90%)',
                        }
                      })
                    }}
                  >
                    {user?.subscription?.planName === plan.title ? 'Current Plan' : plan.buttonText}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          All Plans Include
        </Typography>
        <Grid container spacing={3} justifyContent="center" sx={{ mt: 2 }}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                24/7 Support
              </Typography>
              <Typography color="text.secondary">
                Get help whenever you need it
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Secure Platform
              </Typography>
              <Typography color="text.secondary">
                Your data is always protected
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Regular Updates
              </Typography>
              <Typography color="text.secondary">
                Access to latest features
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Payment Dialog */}
      <Dialog open={openPayment} onClose={handlePaymentClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Subscribe to {selectedPlan?.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Payment Details
            </Typography>
            <Tabs
              value={paymentMethod}
              onChange={(e, newValue) => setPaymentMethod(newValue)}
              sx={{ mb: 3 }}
            >
              <Tab 
                value="card" 
                label="Card" 
                icon={<CreditCard />} 
                iconPosition="start"
              />
              <Tab 
                value="upi" 
                label="UPI" 
                icon={<QrCode2 />} 
                iconPosition="start"
              />
              <Tab 
                value="emi" 
                label="EMI" 
                icon={<CalendarMonth />} 
                iconPosition="start"
              />
            </Tabs>
            {renderPaymentForm()}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total Amount: {selectedPlan?.price}/month
              </Typography>
              {paymentMethod === 'emi' && (
                <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                  Selected EMI: ₹{calculateEMI(selectedPlan?.price || '₹0', parseInt(emiPlan)).monthly}/month for {emiPlan} months
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePaymentClose}>Cancel</Button>
          <Button
            onClick={handlePayment}
            variant="contained"
            disabled={loading || (paymentMethod === 'upi' && !upiId)}
            startIcon={loading ? <CircularProgress size={20} /> : <Payment />}
          >
            {loading ? 'Processing...' : 'Pay Now'}
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
    </Container>
  );
};

export default Subscription; 