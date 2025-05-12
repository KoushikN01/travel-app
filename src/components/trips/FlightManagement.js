import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Stack,
  Alert,
  Snackbar,
} from '@mui/material';
import { Add, Edit, Delete, Flight, ArrowBack } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import tripService from '../../services/tripService';

const FlightManagement = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [flightData, setFlightData] = useState({
    airline: '',
    flightNumber: '',
    departureCity: '',
    arrivalCity: '',
    departureTime: '',
    arrivalTime: '',
    bookingReference: '',
    cost: ''
  });

  useEffect(() => {
    fetchFlights();
  }, [tripId]);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const data = await tripService.getFlights(tripId);
      setFlights(data);
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

  const handleOpenDialog = (flight = null) => {
    if (flight) {
      setSelectedFlight(flight);
      setFlightData(flight);
    } else {
      setSelectedFlight(null);
      setFlightData({
        airline: '',
        flightNumber: '',
        departureCity: '',
        arrivalCity: '',
        departureTime: '',
        arrivalTime: '',
        bookingReference: '',
        cost: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFlight(null);
    setError('');
  };

  const handleSaveFlight = async () => {
    try {
      setLoading(true);
      if (selectedFlight) {
        await tripService.updateFlight(tripId, selectedFlight._id, flightData);
      } else {
        await tripService.addFlight(tripId, flightData);
      }
      setSnackbar({
        open: true,
        message: `Flight ${selectedFlight ? 'updated' : 'added'} successfully`,
        severity: 'success'
      });
      handleCloseDialog();
      fetchFlights();
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

  const handleDeleteFlight = async (flightId) => {
    try {
      setLoading(true);
      await tripService.deleteFlight(tripId, flightId);
      setSnackbar({
        open: true,
        message: 'Flight deleted successfully',
        severity: 'success'
      });
      fetchFlights();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/trips/${tripId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          Back to Trip
        </Button>
        <Typography variant="h4" component="h1">
          Flight Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Flight
        </Button>
      </Box>

      <List>
        {flights.map((flight) => (
          <ListItem
            key={flight._id}
            sx={{
              mb: 2,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            <ListItemText
              primary={
                <Typography variant="h6">
                  {flight.airline} - {flight.flightNumber}
                </Typography>
              }
              secondary={
                <Stack spacing={1}>
                  <Typography variant="body2">
                    From: {flight.departureCity} ({new Date(flight.departureTime).toLocaleString()})
                  </Typography>
                  <Typography variant="body2">
                    To: {flight.arrivalCity} ({new Date(flight.arrivalTime).toLocaleString()})
                  </Typography>
                  <Typography variant="body2">
                    Booking Reference: {flight.bookingReference}
                  </Typography>
                  <Typography variant="body2">
                    Cost: ₹{flight.cost}
                  </Typography>
                </Stack>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() => handleOpenDialog(flight)}
                sx={{ mr: 1 }}
              >
                <Edit />
              </IconButton>
              <IconButton
                edge="end"
                onClick={() => handleDeleteFlight(flight._id)}
              >
                <Delete />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedFlight ? 'Edit Flight' : 'Add Flight'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Airline"
              value={flightData.airline}
              onChange={(e) => setFlightData({ ...flightData, airline: e.target.value })}
              fullWidth
            />
            <TextField
              label="Flight Number"
              value={flightData.flightNumber}
              onChange={(e) => setFlightData({ ...flightData, flightNumber: e.target.value })}
              fullWidth
            />
            <TextField
              label="Departure City"
              value={flightData.departureCity}
              onChange={(e) => setFlightData({ ...flightData, departureCity: e.target.value })}
              fullWidth
            />
            <TextField
              label="Arrival City"
              value={flightData.arrivalCity}
              onChange={(e) => setFlightData({ ...flightData, arrivalCity: e.target.value })}
              fullWidth
            />
            <TextField
              label="Departure Time"
              type="datetime-local"
              value={flightData.departureTime}
              onChange={(e) => setFlightData({ ...flightData, departureTime: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Arrival Time"
              type="datetime-local"
              value={flightData.arrivalTime}
              onChange={(e) => setFlightData({ ...flightData, arrivalTime: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Booking Reference"
              value={flightData.bookingReference}
              onChange={(e) => setFlightData({ ...flightData, bookingReference: e.target.value })}
              fullWidth
            />
            <TextField
              label="Cost"
              type="number"
              value={flightData.cost}
              onChange={(e) => setFlightData({ ...flightData, cost: e.target.value })}
              fullWidth
              InputProps={{
                startAdornment: <Typography>₹</Typography>
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveFlight} variant="contained">
            {selectedFlight ? 'Update' : 'Add'} Flight
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FlightManagement; 