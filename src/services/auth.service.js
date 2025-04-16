import axios from 'axios';



class AuthService {
  async googleSignIn(credential) {
    const response = await axios.post(`${process.env.REACT_APP_API_URL}auth/google`, { credential });
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
