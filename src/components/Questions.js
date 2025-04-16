// src/components/Questions.js
import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Select, MenuItem, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, 
  IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Switch, FormControlLabel, Drawer, List, ListItem, ListItemText,
  ListItemSecondary, Divider, Box, Button
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import {
  Comment as CommentIcon,
  NoteAdd as NoteIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon
} from '@mui/icons-material';
import axios from 'axios';
import AuthService from '../services/auth.service';
import { useNavigate } from 'react-router-dom';

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [filter, setFilter] = useState('amazon');
  const [loading, setLoading] = useState(true);
  const [solvedQuestions, setSolvedQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [openDiscussions, setOpenDiscussions] = useState(false);
  const [discussions, setDiscussions] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ content: '', isPrivate: true });
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' });
  const navigate = useNavigate();

  // Fetch companies on component mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  // Fetch questions when filter changes or on initial load
  useEffect(() => {
    fetchQuestions(filter);
    
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      fetchSolvedQuestions();
    }
  }, [filter]);

  // Fetch the user's solved questions
  const fetchSolvedQuestions = async () => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) return;

    try {
      const response = await axios.get(
        'http://localhost:5000/api/user/solved-questions',
        { params: { userId: currentUser.id } }
      );
      
      if (response.data && response.data.solvedQuestions) {
        setSolvedQuestions(response.data.solvedQuestions);
      }
    } catch (error) {
      console.error("Error fetching solved questions:", error);
      // Fallback to local data if API fails
      setSolvedQuestions(currentUser.solvedQuestions || []);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
      alert("Failed to load companies list. Please refresh the page.");
    }
  };

  const fetchQuestions = async (company) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/questions/${company}`);
      setQuestions(response.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
      alert(`Failed to load questions for ${company}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const toggleSolvedStatus = async (questionTitle) => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      console.error("No user found");
      return;
    }

    const isSolved = solvedQuestions.includes(questionTitle);
    const endpoint = isSolved ? 'remove' : 'add';

    try {
      const response = await axios.post(
        `http://localhost:5000/api/user/solved-questions/${endpoint}`,
        { 
          title: questionTitle,
          userId: currentUser.id
        }
      );

      if (response.data && response.data.solvedQuestions) {
        // Update local state with the response from the server
        setSolvedQuestions(response.data.solvedQuestions);
        
        // Update user data in localStorage
        const updatedUser = {
          ...currentUser,
          solvedQuestions: response.data.solvedQuestions
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        // Fallback to updating local state only
        if (isSolved) {
          setSolvedQuestions(prev => prev.filter(title => title !== questionTitle));
        } else {
          setSolvedQuestions(prev => [...prev, questionTitle]);
        }
      }
    } catch (error) {
      console.error("Error updating solved status:", error);
      alert("Failed to update question status. Please try again.");
    }
  };

  const fetchDiscussionsAndNotes = async (questionTitle) => {
    try {
      // Fetch discussions
      const discussionsResponse = await axios.get(
        `http://localhost:5000/api/questions/${encodeURIComponent(questionTitle)}/discussions`
      );
      setDiscussions(discussionsResponse.data);

      // Fetch notes
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        const notesResponse = await axios.get(
          `http://localhost:5000/api/questions/${encodeURIComponent(questionTitle)}/notes`,
          { params: { userId: currentUser.id } }
        );
        setNotes(notesResponse.data);
      }
    } catch (error) {
      console.error('Error fetching discussions and notes:', error);
      alert('Failed to fetch discussions and notes');
    }
  };

  const handleSaveNote = async (questionTitle) => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) return;

    try {
      await axios.post(
        `http://localhost:5000/api/questions/${encodeURIComponent(questionTitle)}/notes`,
        {
          content: newNote.content,
          isPrivate: newNote.isPrivate,
          userId: currentUser.id
        }
      );

      // Refresh notes
      await fetchDiscussionsAndNotes(questionTitle);
      setNewNote({ content: '', isPrivate: true });
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note');
    }
  };

  const handleCreateDiscussion = async (questionTitle) => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) return;

    try {
      await axios.post(
        `http://localhost:5000/api/questions/${encodeURIComponent(questionTitle)}/discussions`,
        {
          title: newDiscussion.title,
          content: newDiscussion.content,
          userId: currentUser.id
        }
      );

      // Refresh discussions
      await fetchDiscussionsAndNotes(questionTitle);
      setNewDiscussion({ title: '', content: '' });
    } catch (error) {
      console.error('Error creating discussion:', error);
      alert('Failed to create discussion');
    }
  };

  const handleVoteDiscussion = async (discussionId, voteType) => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) return;

    try {
      await axios.post(`http://localhost:5000/api/questions/discussions/${discussionId}/vote`, {
        userId: currentUser.id,
        voteType
      });

      // Refresh discussions
      if (selectedQuestion) {
        await fetchDiscussionsAndNotes(selectedQuestion.title);
      }
    } catch (error) {
      console.error('Error voting on discussion:', error);
      alert('Failed to vote on discussion');
    }
  };

  const handleDiscussionClick = (questionTitle) => {
    // Open a new tab with the question discussion
    window.open(`/question/${encodeURIComponent(questionTitle)}/discussion`, '_blank');
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Questions
      </Typography>
      <Select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ marginBottom: '20px', width: '200px' }}
      >
        {companies.map((company) => (
          <MenuItem key={company} value={company}>
            {company.charAt(0).toUpperCase() + company.slice(1).replace(/_/g, ' ')}
          </MenuItem>
        ))}
      </Select>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <CircularProgress />
        </div>
      ) : (
        <TableContainer component={Paper} style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Question Number</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Question Link</TableCell>
                <TableCell>Difficulty Level</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {questions.map((question, index) => (
                <TableRow 
                  key={index} 
                  style={{ 
                    backgroundColor: solvedQuestions.includes(question.title) 
                      ? 'rgba(76, 175, 80, 0.1)' 
                      : 'white' 
                  }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{question.title}</TableCell>
                  <TableCell>
                    <a href={question.link} target="_blank" rel="noopener noreferrer">
                      {question.link}
                    </a>
                  </TableCell>
                  <TableCell>{question.difficulty}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton 
                        onClick={() => toggleSolvedStatus(question.title)}
                        color={solvedQuestions.includes(question.title) ? "primary" : "default"}
                      >
                        <CheckIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDiscussionClick(question.title)}
                      >
                        <CommentIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default Questions;