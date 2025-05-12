import axios from 'axios';

class AdminService {
  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          window.location.href = '/admin/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Admin Authentication
  async adminLogin(credentials) {
    try {
      const response = await this.api.post('/admin/login', credentials);
      
      if (response.data && response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminUser', JSON.stringify(response.data.user));
        return response.data;
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data?.message || 'Login failed. Please check your credentials.';
    }
  }

  async verifyAdminToken() {
    try {
      const response = await this.api.post('/admin/verify-token');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async adminLogout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  }

  // User Management
  async getUsers(filters = {}) {
    try {
      const response = await this.api.get('/admin/users', { params: filters });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateUser(userId, updates) {
    try {
      const response = await this.api.put(`/admin/users/${userId}`, updates);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteUser(userId) {
    try {
      const response = await this.api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Trip Management
  async getTrips(filters = {}) {
    try {
      const response = await this.api.get('/admin/trips', { params: filters });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTripDetails(tripId) {
    try {
      const response = await this.api.get(`/admin/trips/${tripId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async approveTrip(tripId) {
    try {
      const response = await this.api.put(`/admin/trips/${tripId}/approve`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async rejectTrip(tripId) {
    try {
      const response = await this.api.put(`/admin/trips/${tripId}/reject`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // User Activity Monitoring
  async getUserActivity(filters = {}) {
    try {
      const response = await this.api.get('/admin/user-activity', { params: filters });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Trip Statistics
  async getTripStatistics(timeRange = 'month') {
    try {
      const response = await this.api.get('/admin/trip-statistics', { params: { timeRange } });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Engagement Metrics
  async getEngagementMetrics(timeRange = 'month') {
    try {
      const response = await this.api.get('/admin/engagement-metrics', { params: { timeRange } });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Subscription Management
  async getSubscriptions(filters = {}) {
    try {
      const response = await this.api.get('/admin/subscriptions', { params: filters });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateSubscription(subscriptionId, updates) {
    try {
      const response = await this.api.put(`/admin/subscriptions/${subscriptionId}`, updates);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Support Requests
  async getSupportRequests(status = 'all') {
    try {
      const response = await this.api.get('/admin/support-requests', { params: { status } });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateSupportRequest(requestId, updates) {
    try {
      const response = await this.api.put(`/admin/support-requests/${requestId}`, updates);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Reports
  async generateReport(reportType, filters = {}) {
    try {
      const response = await this.api.post('/admin/reports/generate', { reportType, filters });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error Handling
  handleError(error) {
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    console.error('Admin Service Error:', {
      status: error.response?.status,
      message: errorMessage,
      endpoint: error.config?.url,
      method: error.config?.method,
    });
    throw new Error(errorMessage);
  }

  // Admin Authentication Helpers
  isAdminAuthenticated() {
    return !!localStorage.getItem('adminToken');
  }

  getAdminUser() {
    const adminUser = localStorage.getItem('adminUser');
    return adminUser ? JSON.parse(adminUser) : null;
  }
}

const adminService = new AdminService();
export default adminService; 