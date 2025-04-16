import axios from 'axios';

const API_URL = 'http://localhost:5000';

class AuthService {
  async googleSignIn(credential) {
    const response = await axios.post(`${API_URL}/auth/google`, { credential });
    return response.data;
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  logout() {
    localStorage.removeItem('user');
  }

  isAuthenticated() {
    return !!this.getCurrentUser();
  }
}

export default new AuthService();
