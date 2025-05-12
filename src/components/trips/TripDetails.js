import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Paper,
  Chip,
  Stack,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
  MenuItem,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Flight,
  Hotel,
  DirectionsWalk,
  Restaurant,
  AccessTime,
  LocationOn,
  AttachMoney,
  CalendarMonth,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import tripService from '../../services/tripService';
import TripCollaboration from './TripCollaboration';
import TripRecommendations from './TripRecommendations';
import DayActivities from './DayActivities';
import { useAuth } from '../../contexts/AuthContext';

const TripDetails = ({ trip: initialTrip, onBack }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trip, setTrip] = useState(initialTrip);
  const [itinerary, setItinerary] = useState([]);
  const [newActivity, setNewActivity] = useState({
    title: '',
    type: 'activity',
    location: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    duration: '',
    cost: '',
    description: '',
    bookingReference: '',
    category: '',
    createdBy: user?._id || '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [activeTab, setActiveTab] = useState('details');
  const [selectedDay, setSelectedDay] = useState(0);
  const [activityType, setActivityType] = useState('activity');

  useEffect(() => {
    if (initialTrip) {
      setTrip(initialTrip);
      initializeItinerary(initialTrip);
    }
  }, [initialTrip]);

  useEffect(() => {
    if (user?._id) {
      setNewActivity(prev => ({
        ...prev,
        createdBy: user._id
      }));
    }
  }, [user]);

  const initializeItinerary = (tripData) => {
    const start = new Date(tripData.startDate);
    const end = new Date(tripData.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    const newItinerary = Array.from({ length: days }, (_, index) => {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + index);
      
      // Find existing activities for this date
      const existingDay = tripData.itinerary?.find(day => 
        new Date(day.date).toISOString().split('T')[0] === currentDate.toISOString().split('T')[0]
      );
      
      return {
        day: index + 1,
        date: currentDate.toISOString().split('T')[0],
        activities: existingDay?.activities || [],
      };
    });
    
    setItinerary(newItinerary);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleOpenDialog = (day, activity = null) => {
    if (activity) {
      setSelectedActivity({ ...activity, day });
      setNewActivity(activity);
    } else {
      setSelectedActivity(null);
      setNewActivity({
        title: '',
        type: 'activity',
        location: '',
        date: '',
        startTime: '',
        duration: '',
        cost: '',
        description: '',
        bookingReference: '',
        category: '',
        createdBy: user?._id || '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedActivity(null);
    setError('');
  };

  const handleSaveActivity = async () => {
    try {
      if (!user) {
        throw new Error('Please log in to add activities');
      }

      setLoading(true);
      const dayIndex = selectedActivity ? selectedActivity.day - 1 : selectedDay;
      const date = itinerary[dayIndex].date;

      const activityData = {
        ...newActivity,
        title: newActivity.title.trim(),
        date: date,
        startTime: newActivity.startTime || '00:00',
        createdBy: user._id,
        type: activityType,
        updatedAt: new Date().toISOString()
      };

      if (!activityData.title) {
        throw new Error('Title is required');
      }

      if (selectedActivity) {
        await tripService.updateActivity(trip._id, selectedActivity._id, activityData);
      } else {
        await tripService.addActivity(trip._id, date, activityData);
      }

      setSnackbar({
        open: true,
        message: `Activity ${selectedActivity ? 'updated' : 'added'} successfully`,
        severity: 'success'
      });
      handleCloseDialog();
      await fetchTrip();
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

  const fetchTrip = async () => {
    try {
      const updatedTrip = await tripService.getTrip(trip._id);
      setTrip(updatedTrip);
      initializeItinerary(updatedTrip);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteActivity = async (dayIndex, activityId) => {
    try {
      setLoading(true);
      const updatedTrip = await tripService.updateTrip(trip._id, {
        itinerary: itinerary.map((day, index) => {
          if (index === dayIndex) {
            return {
              ...day,
              activities: day.activities.filter(act => act._id !== activityId)
            };
          }
          return day;
        })
      });
      setTrip(updatedTrip);
      initializeItinerary(updatedTrip);
      setSnackbar({
        open: true,
        message: 'Activity deleted successfully',
        severity: 'success'
      });
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

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'flight':
        return <Flight />;
      case 'hotel':
        return <Hotel />;
      case 'activity':
        return <DirectionsWalk />;
      case 'restaurant':
        return <Restaurant />;
      default:
        return <DirectionsWalk />;
    }
  };

  const handleActivityTypeSelect = (type) => {
    if (!user) {
      setSnackbar({
        open: true,
        message: 'Please log in to add activities',
        severity: 'error'
      });
      return;
    }

    setActivityType(type);
    if (type === 'flight') {
      navigate(`/trips/${trip._id}/flights`);
      return;
    } else if (type === 'hotel') {
      navigate(`/trips/${trip._id}/hotels`);
      return;
    } else if (type === 'activity') {
      navigate(`/trips/${trip._id}/activities`);
      return;
    }
    
    setNewActivity({
      title: '',
      type,
      location: '',
      date: '',
      startTime: '',
      duration: '',
      cost: '',
      description: '',
      bookingReference: '',
      category: '',
      createdBy: user._id,
    });
    handleOpenDialog(selectedDay);
  };

  if (!trip) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab label="Trip Details" value="details" />
          <Tab label="Collaboration" value="collaboration" />
          <Tab label="Recommendations & Documents" value="recommendations" />
        </Tabs>

        {activeTab === 'details' && (
          <>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" gutterBottom>
                {trip.title}
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<Flight />}
                  onClick={() => handleActivityTypeSelect('flight')}
                >
                  Flights
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Hotel />}
                  onClick={() => handleActivityTypeSelect('hotel')}
                >
                  Hotels
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DirectionsWalk />}
                  onClick={() => handleActivityTypeSelect('activity')}
                >
                  Activities
                </Button>
              </Stack>
            </Box>

            <Tabs
              value={selectedDay}
              onChange={(e, newValue) => setSelectedDay(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 3 }}
            >
              {itinerary.map((day, index) => (
                <Tab
                  key={index}
                  label={`Day ${day.day}`}
                  value={index}
                />
              ))}
            </Tabs>

            {itinerary.map((day, index) => (
              <Box
                key={index}
                role="tabpanel"
                hidden={selectedDay !== index}
              >
                {selectedDay === index && (
                  <DayActivities
                    day={day}
                    onEdit={(activity) => handleOpenDialog(index + 1, activity)}
                    onDelete={(activityId) => handleDeleteActivity(index, activityId)}
                  />
                )}
              </Box>
            ))}
          </>
        )}

        {activeTab === 'collaboration' && (
          <TripCollaboration tripId={trip._id} />
        )}

        {activeTab === 'recommendations' && (
          <TripRecommendations tripId={trip._id} destinations={trip.destinations} />
        )}
      </Box>

      {/* Activity Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedActivity ? 'Edit Activity' : 'Add Activity'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Title"
              value={newActivity.title}
              onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Location"
              value={newActivity.location}
              onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
              fullWidth
            />
            <TextField
              label="Start Time"
              type="time"
              value={newActivity.startTime}
              onChange={(e) => setNewActivity({ ...newActivity, startTime: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Duration"
              value={newActivity.duration}
              onChange={(e) => setNewActivity({ ...newActivity, duration: e.target.value })}
              fullWidth
              placeholder="e.g., 2 hours"
            />
            <TextField
              label="Cost"
              type="number"
              value={newActivity.cost}
              onChange={(e) => setNewActivity({ ...newActivity, cost: e.target.value })}
              fullWidth
              InputProps={{
                startAdornment: <Typography>₹</Typography>
              }}
            />
            <TextField
              label="Description"
              value={newActivity.description}
              onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Booking Reference"
              value={newActivity.bookingReference}
              onChange={(e) => setNewActivity({ ...newActivity, bookingReference: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveActivity} 
            variant="contained"
            disabled={!newActivity.title || !newActivity.startTime}
          >
            {selectedActivity ? 'Update' : 'Add'} Activity
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

export default TripDetails; 