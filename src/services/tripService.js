import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:5001/api';

class TripService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = authService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  async getAllTrips() {
    try {
      const response = await this.api.get('/trips');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTrip(tripId) {
    try {
      const response = await this.api.get(`/trips/${tripId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createTrip(tripData) {
    try {
      const response = await this.api.post('/trips', tripData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateTrip(tripId, tripData) {
    try {
      const response = await this.api.put(`/trips/${tripId}`, tripData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteTrip(tripId) {
    try {
      await this.api.delete(`/trips/${tripId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addCollaborator(tripId, userId, role) {
    try {
      const response = await this.api.post(`/trips/${tripId}/collaborators`, {
        userId,
        role
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addActivity(tripId, date, activityData) {
    try {
      const formattedDate = new Date(date).toISOString().split('T')[0];
      const response = await this.api.post(
        `/trips/${tripId}/itinerary/${formattedDate}/activities`,
        {
          ...activityData,
          date: formattedDate,
          startTime: activityData.startTime || '00:00',
          createdBy: activityData.createdBy,
          type: activityData.type || 'activity'
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async sendMessage(tripId, content) {
    try {
      const response = await this.api.post(`/trips/${tripId}/chat`, { content });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async proposeActivity(tripId, activityData) {
    try {
      const response = await this.api.post(`/trips/${tripId}/activities`, activityData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async voteActivity(tripId, activityId, vote) {
    try {
      const response = await this.api.post(`/trips/${tripId}/activities/${activityId}/vote`, { vote });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async inviteCollaborator(tripId, email) {
    try {
      const response = await this.api.post(`/trips/${tripId}/collaborators`, { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateCollaboratorRole(tripId, userId, role) {
    try {
      const response = await this.api.put(`/trips/${tripId}/collaborators/${userId}`, { role });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async removeCollaborator(tripId, userId) {
    try {
      const response = await this.api.delete(`/trips/${tripId}/collaborators/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getRecommendations(tripId) {
    try {
      const response = await this.api.get(`/trips/${tripId}/recommendations`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Flight Management
  async addFlight(tripId, flightData) {
    try {
      const response = await this.api.post(`/trips/${tripId}/flights`, flightData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getFlights(tripId) {
    try {
      const response = await this.api.get(`/trips/${tripId}/flights`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateFlight(tripId, flightId, flightData) {
    try {
      const response = await this.api.put(`/trips/${tripId}/flights/${flightId}`, flightData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteFlight(tripId, flightId) {
    try {
      const response = await this.api.delete(`/trips/${tripId}/flights/${flightId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Hotel Management
  async addHotel(tripId, hotelData) {
    try {
      const response = await this.api.post(`/trips/${tripId}/hotels`, hotelData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getHotels(tripId) {
    try {
      const response = await this.api.get(`/trips/${tripId}/hotels`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateHotel(tripId, hotelId, hotelData) {
    try {
      const response = await this.api.put(`/trips/${tripId}/hotels/${hotelId}`, hotelData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteHotel(tripId, hotelId) {
    try {
      const response = await this.api.delete(`/trips/${tripId}/hotels/${hotelId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Activities Management
  async getActivities(tripId) {
    try {
      const response = await this.api.get(`/trips/${tripId}/activities`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateActivity(tripId, activityId, activityData) {
    try {
      const response = await this.api.put(`/trips/${tripId}/activities/${activityId}`, activityData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteActivity(tripId, activityId) {
    try {
      const response = await this.api.delete(`/trips/${tripId}/activities/${activityId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getActivityCategories(tripId) {
    try {
      const response = await this.api.get(`/trips/${tripId}/activities/categories`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      // Server responded with error
      throw new Error(error.response.data.message || 'An error occurred');
    } else if (error.request) {
      // Request made but no response
      throw new Error('No response from server');
    } else {
      // Other errors
      throw new Error('Error setting up request');
    }
  }
}

export default new TripService(); 