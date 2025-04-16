import axios from 'axios';

class AuthService {
  async googleSignIn(credential) {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}auth/google`, { credential });
      const { token } = response.data;
      if (token) {
        // console.log(typeof token)
        localStorage.setItem('token', token);
      } else {
        console.error('Token not found in response');
      }
      return response.data;
    } catch (error) {
      console.error('Error during Google Sign-In:', error);
      throw new Error('Google Sign-In failed');
    }
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
