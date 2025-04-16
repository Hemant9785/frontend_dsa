import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import AuthService from '../services/auth.service';
import axios from 'axios';

const Feedback = () => {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    const userId = AuthService.getCurrentUser()?.id;

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}api/feedback`, {
        userId,
        feedback,
      });
      setSuccessMessage('Feedback submitted successfully!');
      setFeedback('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setErrorMessage('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 2, backgroundColor: '#1A1A1A', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom style={{ color: '#ffffff' }}>
        Submit Feedback
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Your Feedback"
          multiline
          rows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          sx={{ marginBottom: 2, backgroundColor: '#353A40', color: '#ffffff' }}
          InputLabelProps={{
            style: { color: '#ffffff' },
          }}
          InputProps={{
            style: { color: '#ffffff' },
          }}
        />
        <Button
          variant="contained"
          type="submit"
          style={{ backgroundColor: '#373C42', color: '#ffffff' }}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
      {successMessage && <Typography style={{ color: 'green', marginTop: '10px' }}>{successMessage}</Typography>}
      {errorMessage && <Typography style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</Typography>}
    </Box>
  );
};

export default Feedback;
