import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/auth`
    });

    // Add token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
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
        return Promise.reject(error);
      }
    );
  }

  // Helper method to get full avatar URL
  getAvatarUrl(avatarPath) {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${avatarPath}`;
  }

  async login(email, password) {
    try {
      console.log('Making request to:', '/auth/login');
      const response = await this.api.post('/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
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
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
}

const authService = new AuthService();
export default authService; 