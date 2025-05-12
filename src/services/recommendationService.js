import axios from 'axios';
import authService from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

class RecommendationService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = authService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  async getPersonalizedRecommendations(tripId) {
    try {
      const response = await this.api.get(`/recommendations/personalized/${tripId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getWeatherBasedSuggestions(tripId, date) {
    try {
      const response = await this.api.get(`/recommendations/weather/${tripId}`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPopularActivities(destination) {
    try {
      const response = await this.api.get(`/recommendations/popular`, {
        params: { destination }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSimilarDestinations(destination) {
    try {
      const response = await this.api.get(`/recommendations/similar`, {
        params: { destination }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateUserPreferences(preferences) {
    try {
      const response = await this.api.put('/recommendations/preferences', preferences);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'An error occurred');
    } else if (error.request) {
      throw new Error('No response from server');
    } else {
      throw new Error('Error setting up request');
    }
  }
}

export default new RecommendationService(); 