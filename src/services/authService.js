import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add token to requests
    this.api.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for better error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });

        // Handle specific error cases
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timed out. Please try again.');
        }
        if (!error.response) {
          throw new Error('Network error. Please check your connection.');
        }
        if (error.response.status === 401) {
          this.logout();
          throw new Error('Session expired. Please sign in again.');
        }
        throw error;
      }
    );
  }

  // Token management methods
  getToken() {
    return localStorage.getItem('token');
  }

  setToken(token) {
    localStorage.setItem('token', token);
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  setRefreshToken(token) {
    localStorage.setItem('refreshToken', token);
  }

  // User management methods
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser() {
    try {
      const userStr = localStorage.getItem('user');
      console.log('Getting current user from storage:', userStr);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Profile management methods
  async getProfile() {
    try {
      const response = await this.api.get('/user/profile');
      if (response.data) {
        this.setUser(response.data);
        return response.data;
      }
      throw new Error('Failed to fetch profile');
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await this.api.put('/user/profile', profileData);
      if (response.data) {
        this.setUser(response.data);
        return response.data;
      }
      throw new Error('Failed to update profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async verifyToken() {
    try {
      const response = await this.api.get('/auth/verify');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async login(email, password) {
    try {
      console.log('Making login request to:', `${API_URL}/auth/login`);
      const response = await this.api.post('/auth/login', { email, password });
      console.log('Raw login response:', response);
      console.log('Login response data:', response.data);
      
      // Check if we have a valid response
      if (!response.data) {
        console.error('No data in response');
        throw new Error('No data received from server');
      }

      // Log the structure of the response
      console.log('Response structure:', {
        hasUser: !!response.data.data?.user,
        hasTokens: !!response.data.data?.tokens,
        hasAccessToken: !!response.data.data?.tokens?.accessToken,
        hasRefreshToken: !!response.data.data?.tokens?.refreshToken,
        keys: Object.keys(response.data)
      });

      // Handle the response based on its structure
      if (response.data.data?.user && response.data.data?.tokens) {
        // Store tokens
        if (response.data.data.tokens.accessToken) {
          this.setToken(response.data.data.tokens.accessToken);
        }
        if (response.data.data.tokens.refreshToken) {
          this.setRefreshToken(response.data.data.tokens.refreshToken);
        }
        
        // Store user data
        this.setUser(response.data.data.user);
        
        return {
          user: response.data.data.user,
          token: response.data.data.tokens.accessToken
        };
      } else if (response.data.message) {
        throw new Error(response.data.message);
      } else {
        console.error('Unexpected response format:', response.data);
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await this.api.post('/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error;
    }
  }

  async uploadAvatar(file) {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      const formData = new FormData();
      formData.append('avatar', file);

      console.log('Uploading avatar:', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      });

      // Use the correct endpoint
      const response = await this.api.post('/user/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Avatar upload response:', response.data);

      // Update user in localStorage with new avatar
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && response.data.user) {
        user.avatar = this.getAvatarUrl(response.data.user.avatar);
        localStorage.setItem('user', JSON.stringify(user));
      }

      return response.data;
    } catch (error) {
      console.error('Avatar upload error:', {
        error: error.response?.data || error.message,
        status: error.response?.status,
        headers: error.config?.headers
      });
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    console.log('Checking authentication:', { hasToken: !!token, hasUser: !!user });
    return !!token && !!user;
  }

  // Helper method to get full avatar URL
  getAvatarUrl(avatarPath) {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${avatarPath}`;
  }
}

// Create a single instance
const authServiceInstance = new AuthService();

// Export the instance
export default authServiceInstance; 