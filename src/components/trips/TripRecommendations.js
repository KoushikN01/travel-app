import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Share,
  Download,
  WbSunny,
  Favorite,
  LocationOn,
  AttachFile,
} from '@mui/icons-material';
import recommendationService from '../../services/recommendationService';
import documentService from '../../services/documentService';

const TripRecommendations = ({ tripId, destinations }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [weatherSuggestions, setWeatherSuggestions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('');

  useEffect(() => {
    fetchRecommendations();
    fetchDocuments();
  }, [tripId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const [personalizedRecs, weatherRecs] = await Promise.all([
        recommendationService.getPersonalizedRecommendations(tripId),
        recommendationService.getWeatherBasedSuggestions(tripId, new Date())
      ]);
      setRecommendations(personalizedRecs);
      setWeatherSuggestions(weatherRecs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const docs = await documentService.getDocuments(tripId);
      setDocuments(docs);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !documentType) return;

    try {
      setLoading(true);
      await documentService.uploadDocument(tripId, selectedFile, documentType);
      await fetchDocuments();
      setUploadDialog(false);
      setSelectedFile(null);
      setDocumentType('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      await documentService.deleteDocument(tripId, documentId);
      await fetchDocuments();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDownloadDocument = async (documentId) => {
    try {
      const blob = await documentService.downloadDocument(tripId, documentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Personalized Recommendations */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Personalized Recommendations
        </Typography>
        <Grid container spacing={2}>
          {recommendations.map((rec) => (
            <Grid item xs={12} sm={6} md={4} key={rec.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={rec.image}
                  alt={rec.title}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {rec.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {rec.description}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip icon={<LocationOn />} label={rec.location} size="small" />
                    <Chip icon={<Favorite />} label={rec.rating} size="small" />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Weather-based Suggestions */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Weather-based Activity Suggestions
        </Typography>
        <Grid container spacing={2}>
          {weatherSuggestions.map((suggestion) => (
            <Grid item xs={12} sm={6} key={suggestion.id}>
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <WbSunny color="primary" />
                    <Box>
                      <Typography variant="subtitle1">
                        {suggestion.activity}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {suggestion.weather} - {suggestion.recommendation}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Document Management */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Travel Documents
          </Typography>
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={() => setUploadDialog(true)}
          >
            Upload Document
          </Button>
        </Box>
        <List>
          {documents.map((doc) => (
            <ListItem key={doc._id}>
              <ListItemText
                primary={doc.name}
                secondary={`Uploaded on ${new Date(doc.uploadedAt).toLocaleDateString()}`}
              />
              <ListItemSecondaryAction>
                <IconButton onClick={() => handleDownloadDocument(doc._id)}>
                  <Download />
                </IconButton>
                <IconButton onClick={() => handleDeleteDocument(doc._id)}>
                  <Delete />
                </IconButton>
                <IconButton>
                  <Share />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)}>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              select
              label="Document Type"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              SelectProps={{ native: true }}
            >
              <option value="">Select type</option>
              <option value="ticket">Ticket</option>
              <option value="passport">Passport</option>
              <option value="visa">Visa</option>
              <option value="reservation">Reservation</option>
              <option value="other">Other</option>
            </TextField>
            <Button
              variant="outlined"
              component="label"
              startIcon={<AttachFile />}
            >
              Choose File
              <input
                type="file"
                hidden
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
            </Button>
            {selectedFile && (
              <Typography variant="body2">
                Selected: {selectedFile.name}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>Cancel</Button>
          <Button
            onClick={handleFileUpload}
            variant="contained"
            disabled={!selectedFile || !documentType || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default TripRecommendations; 