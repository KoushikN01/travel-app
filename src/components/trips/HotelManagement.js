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
  Chip,
} from '@mui/material';
import { Add, Edit, Delete, Hotel, LocationOn, AccessTime, ArrowBack } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import tripService from '../../services/tripService';

const HotelManagement = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [hotelData, setHotelData] = useState({
    name: '',
    location: '',
    checkIn: '',
    checkOut: '',
    roomType: '',
    bookingReference: '',
    cost: '',
    amenities: '',
    notes: ''
  });

  useEffect(() => {
    fetchHotels();
  }, [tripId]);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const data = await tripService.getHotels(tripId);
      setHotels(data);
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

  const handleOpenDialog = (hotel = null) => {
    if (hotel) {
      setSelectedHotel(hotel);
      setHotelData(hotel);
    } else {
      setSelectedHotel(null);
      setHotelData({
        name: '',
        location: '',
        checkIn: '',
        checkOut: '',
        roomType: '',
        bookingReference: '',
        cost: '',
        amenities: '',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedHotel(null);
    setError('');
  };

  const handleSaveHotel = async () => {
    try {
      setLoading(true);
      if (selectedHotel) {
        await tripService.updateHotel(tripId, selectedHotel._id, hotelData);
      } else {
        await tripService.addHotel(tripId, hotelData);
      }
      setSnackbar({
        open: true,
        message: `Hotel ${selectedHotel ? 'updated' : 'added'} successfully`,
        severity: 'success'
      });
      handleCloseDialog();
      fetchHotels();
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

  const handleDeleteHotel = async (hotelId) => {
    try {
      setLoading(true);
      await tripService.deleteHotel(tripId, hotelId);
      setSnackbar({
        open: true,
        message: 'Hotel deleted successfully',
        severity: 'success'
      });
      fetchHotels();
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
          Hotel Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Hotel
        </Button>
      </Box>

      <List>
        {hotels.map((hotel) => (
          <ListItem
            key={hotel._id}
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
                  {hotel.name}
                </Typography>
              }
              secondary={
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LocationOn fontSize="small" />
                    <Typography variant="body2">
                      {hotel.location}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AccessTime fontSize="small" />
                    <Typography variant="body2">
                      Check-in: {new Date(hotel.checkIn).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      Check-out: {new Date(hotel.checkOut).toLocaleString()}
                    </Typography>
                  </Stack>
                  <Typography variant="body2">
                    Room Type: {hotel.roomType}
                  </Typography>
                  <Typography variant="body2">
                    Booking Reference: {hotel.bookingReference}
                  </Typography>
                  <Typography variant="body2">
                    Cost: ₹{hotel.cost}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {hotel.amenities.split(',').map((amenity, index) => (
                      <Chip
                        key={index}
                        label={amenity.trim()}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                  {hotel.notes && (
                    <Typography variant="body2" color="text.secondary">
                      Notes: {hotel.notes}
                    </Typography>
                  )}
                </Stack>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() => handleOpenDialog(hotel)}
                sx={{ mr: 1 }}
              >
                <Edit />
              </IconButton>
              <IconButton
                edge="end"
                onClick={() => handleDeleteHotel(hotel._id)}
              >
                <Delete />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedHotel ? 'Edit Hotel' : 'Add Hotel'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Hotel Name"
              value={hotelData.name}
              onChange={(e) => setHotelData({ ...hotelData, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Location"
              value={hotelData.location}
              onChange={(e) => setHotelData({ ...hotelData, location: e.target.value })}
              fullWidth
            />
            <TextField
              label="Check-in"
              type="datetime-local"
              value={hotelData.checkIn}
              onChange={(e) => setHotelData({ ...hotelData, checkIn: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Check-out"
              type="datetime-local"
              value={hotelData.checkOut}
              onChange={(e) => setHotelData({ ...hotelData, checkOut: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Room Type"
              value={hotelData.roomType}
              onChange={(e) => setHotelData({ ...hotelData, roomType: e.target.value })}
              fullWidth
            />
            <TextField
              label="Booking Reference"
              value={hotelData.bookingReference}
              onChange={(e) => setHotelData({ ...hotelData, bookingReference: e.target.value })}
              fullWidth
            />
            <TextField
              label="Cost"
              type="number"
              value={hotelData.cost}
              onChange={(e) => setHotelData({ ...hotelData, cost: e.target.value })}
              fullWidth
              InputProps={{
                startAdornment: <Typography>₹</Typography>
              }}
            />
            <TextField
              label="Amenities (comma-separated)"
              value={hotelData.amenities}
              onChange={(e) => setHotelData({ ...hotelData, amenities: e.target.value })}
              fullWidth
              helperText="Enter amenities separated by commas (e.g., WiFi, Pool, Gym)"
            />
            <TextField
              label="Notes"
              value={hotelData.notes}
              onChange={(e) => setHotelData({ ...hotelData, notes: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveHotel} variant="contained">
            {selectedHotel ? 'Update' : 'Add'} Hotel
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

export default HotelManagement; 