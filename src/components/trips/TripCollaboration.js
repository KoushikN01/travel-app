import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Send,
  PersonAdd,
  ThumbUp,
  ThumbDown,
  Add as AddIcon,
} from '@mui/icons-material';
import { AuthContext } from '../../contexts/AuthContext';
import tripService from '../../services/tripService';

const TripCollaboration = ({ tripId }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchTripData();
    // Set up WebSocket connection for real-time updates
    const ws = new WebSocket(`ws://localhost:5001/ws/trips/${tripId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'chat') {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      } else if (data.type === 'activity') {
        setActivities(prev => prev.map(activity => 
          activity._id === data.activity._id ? data.activity : activity
        ));
      }
    };

    return () => ws.close();
  }, [tripId]);

  const fetchTripData = async () => {
    try {
      setLoading(true);
      const tripData = await tripService.getTripById(tripId);
      setMessages(tripData.chatMessages);
      setActivities(tripData.activities);
      setCollaborators(tripData.collaborators);
      scrollToBottom();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      await tripService.sendMessage(tripId, newMessage);
      setNewMessage('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleProposeActivity = async () => {
    if (!newActivity.trim()) return;
    
    try {
      await tripService.proposeActivity(tripId, newActivity);
      setNewActivity('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVote = async (activityId, vote) => {
    try {
      await tripService.voteActivity(tripId, activityId, vote);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInviteCollaborator = async () => {
    if (!inviteEmail.trim()) return;
    
    try {
      await tripService.inviteCollaborator(tripId, inviteEmail);
      setInviteEmail('');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 2, height: '600px' }}>
      {/* Chat Section */}
      <Paper sx={{ flex: 2, p: 2, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>
          Trip Chat
        </Typography>
        <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
          <List>
            {messages.map((message, index) => (
              <ListItem key={index} alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar>{message.sender.firstName?.[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={message.sender.firstName}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        {message.content}
                      </Typography>
                      <Typography variant="caption" display="block">
                        {new Date(message.timestamp).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <IconButton color="primary" onClick={handleSendMessage}>
            <Send />
          </IconButton>
        </Box>
      </Paper>

      {/* Activities and Collaborators Section */}
      <Paper sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>
          Proposed Activities
        </Typography>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            value={newActivity}
            onChange={(e) => setNewActivity(e.target.value)}
            placeholder="Propose an activity..."
            sx={{ mb: 1 }}
          />
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleProposeActivity}
          >
            Add Activity
          </Button>
        </Box>
        <List>
          {activities.map((activity) => (
            <ListItem
              key={activity._id}
              secondaryAction={
                <Stack direction="row" spacing={1}>
                  <IconButton
                    onClick={() => handleVote(activity._id, 'up')}
                    color={activity.votes.some(v => v.user === user._id && v.vote === 'up') ? 'primary' : 'default'}
                  >
                    <ThumbUp />
                  </IconButton>
                  <IconButton
                    onClick={() => handleVote(activity._id, 'down')}
                    color={activity.votes.some(v => v.user === user._id && v.vote === 'down') ? 'error' : 'default'}
                  >
                    <ThumbDown />
                  </IconButton>
                </Stack>
              }
            >
              <ListItemText
                primary={activity.activity}
                secondary={
                  <Chip
                    label={activity.status}
                    color={
                      activity.status === 'approved'
                        ? 'success'
                        : activity.status === 'rejected'
                        ? 'error'
                        : 'default'
                    }
                    size="small"
                  />
                }
              />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Collaborators
        </Typography>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Enter email to invite..."
            sx={{ mb: 1 }}
          />
          <Button
            fullWidth
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={handleInviteCollaborator}
          >
            Invite Collaborator
          </Button>
        </Box>
        <List>
          {collaborators.map((collaborator) => (
            <ListItem key={collaborator.user._id}>
              <ListItemAvatar>
                <Avatar>{collaborator.user.firstName?.[0]}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`${collaborator.user.firstName} ${collaborator.user.lastName}`}
                secondary={
                  <Chip
                    label={collaborator.role}
                    color={
                      collaborator.role === 'admin'
                        ? 'error'
                        : collaborator.role === 'editor'
                        ? 'primary'
                        : 'default'
                    }
                    size="small"
                  />
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {error && (
        <Alert
          severity="error"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default TripCollaboration; 