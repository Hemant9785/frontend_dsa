import axios from 'axios';

class AuthService {
  async googleSignIn(credential) {
    console.log(`${process.env.REACT_APP_API_URL}auth/google`);
    const response = await axios.post(`${process.env.REACT_APP_API_URL}auth/google`, { credential });
    const { token } = response.data;
    localStorage.setItem('token', token);
    return response.data;
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  logout() {
    localStorage.removeItem('token');
  }

  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  }

  async login(credentials) {
    try {
      const response = await axios.post('/api/login', credentials);
      const { token } = response.data;

      // Store token in localStorage
      localStorage.setItem('token', token);

      return response.data;
    } catch (error) {
      throw new Error('Login failed');
    }
  }
}

export default new AuthService();
