import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Rating,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  LocationOn,
  AccessTime,
  AttachMoney,
  Favorite,
  FavoriteBorder,
  Share,
  DirectionsWalk,
  Restaurant,
  LocalActivity,
  BeachAccess,
  Hiking,
  Museum,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const destinations = [
  {
    id: 1,
    name: 'Santorini, Greece',
    image: 'https://source.unsplash.com/800x600/?santorini',
    rating: 4.8,
    description: 'Experience the stunning sunsets and white-washed buildings of this Mediterranean paradise.',
    activities: [
      { type: 'Sightseeing', name: 'Oia Sunset Tour', duration: '3 hours', cost: '₹5200', icon: <DirectionsWalk /> },
      { type: 'Dining', name: 'Wine Tasting', duration: '2 hours', cost: '₹8300', icon: <Restaurant /> },
      { type: 'Adventure', name: 'Caldera Cruise', duration: '5 hours', cost: '₹12000', icon: <BeachAccess /> },
    ],
  },
  {
    id: 2,
    name: 'Kyoto, Japan',
    image: 'https://source.unsplash.com/800x600/?kyoto-temple',
    rating: 4.9,
    description: 'Discover ancient temples, traditional gardens, and the art of Japanese culture.',
    activities: [
      { type: 'Cultural', name: 'Temple Tour', duration: '4 hours', cost: '₹7000', icon: <Museum /> },
      { type: 'Adventure', name: 'Bamboo Forest Walk', duration: '2 hours', cost: '₹4500', icon: <Hiking /> },
      { type: 'Entertainment', name: 'Tea Ceremony', duration: '1.5 hours', cost: '₹6800', icon: <LocalActivity /> },
    ],
  },
  {
    id: 3,
    name: 'Machu Picchu, Peru',
    image: 'https://source.unsplash.com/800x600/?machu-picchu',
    rating: 4.9,
    description: 'Explore the ancient Incan citadel set high in the Andes Mountains.',
    activities: [
      { type: 'Adventure', name: 'Inca Trail Trek', duration: '4 days', cost: '₹52000', icon: <Hiking /> },
      { type: 'Sightseeing', name: 'Guided Tour', duration: '3 hours', cost: '₹9900', icon: <DirectionsWalk /> },
      { type: 'Cultural', name: 'Local Market Visit', duration: '2 hours', cost: '₹3100', icon: <LocalActivity /> },
    ],
  },
];

const Explore = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [favorites, setFavorites] = useState({});

  const handleFavorite = (destinationId) => {
    setFavorites(prev => ({
      ...prev,
      [destinationId]: !prev[destinationId]
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ mb: 6, textAlign: 'center' }}
        >
          Explore Amazing Destinations
        </Typography>

        <Grid container spacing={4}>
          {destinations.map((destination) => (
            <Grid item xs={12} key={destination.id}>
              <motion.div variants={itemVariants}>
                <Card
                  elevation={3}
                  sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <Grid container>
                    <Grid item xs={12} md={5}>
                      <CardMedia
                        component="img"
                        height="100%"
                        image={destination.image}
                        alt={destination.name}
                        sx={{ minHeight: 300 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={7}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h4" component="h2">
                            {destination.name}
                          </Typography>
                          <Box>
                            <Tooltip title={favorites[destination.id] ? "Remove from favorites" : "Add to favorites"}>
                              <IconButton onClick={() => handleFavorite(destination.id)} color="primary">
                                {favorites[destination.id] ? <Favorite /> : <FavoriteBorder />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Share">
                              <IconButton>
                                <Share />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Rating value={destination.rating} precision={0.1} readOnly />
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            ({destination.rating})
                          </Typography>
                        </Box>

                        <Typography variant="body1" paragraph>
                          {destination.description}
                        </Typography>

                        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                          Popular Activities
                        </Typography>
                        <Grid container spacing={2}>
                          {destination.activities.map((activity, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                              <Card variant="outlined" sx={{ height: '100%' }}>
                                <CardContent>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    {activity.icon}
                                    <Typography variant="subtitle1" sx={{ ml: 1 }}>
                                      {activity.name}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    <Chip
                                      size="small"
                                      icon={<AccessTime />}
                                      label={activity.duration}
                                    />
                                    <Chip
                                      size="small"
                                      icon={<AttachMoney />}
                                      label={activity.cost}
                                    />
                                    <Chip
                                      size="small"
                                      icon={<LocalActivity />}
                                      label={activity.type}
                                    />
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            variant="contained"
                            size="large"
                            sx={{
                              px: 4,
                              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                              color: 'white',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #1976D2 30%, #00B4D8 90%)',
                              }
                            }}
                          >
                            Plan Your Trip
                          </Button>
                        </Box>
                      </CardContent>
                    </Grid>
                  </Grid>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </Container>
  );
};

export default Explore; 