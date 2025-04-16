import React, { useEffect, useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import axios from 'axios';
import AuthService from '../services/auth.service';
import CommentItem from './CommentItem';

const CommentSection = ({ discussionId }) => {
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}api/comments/${discussionId}`);
        setComments(response.data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, [discussionId]);

  const handleAddComment = async () => {
    try {
      const userId = AuthService.getCurrentUser()?.id;
      if (!userId) {
        alert('You must be logged in to comment');
        return;
      }

      if (!newCommentText.trim()) {
        alert('Comment text is required');
        return;
      }

      const response = await axios.post(`${process.env.REACT_APP_API_URL}api/comments/${discussionId}`, {
        userId,
        text: newCommentText,
        parentCommentId: null, // Direct comment to discussion
      });

      setComments((prevComments) => [...prevComments, response.data]);
      setNewCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  };

  const handleReply = async (parentCommentId, text) => {
    try {
      const userId = AuthService.getCurrentUser()?.id;
      if (!userId) {
        alert('You must be logged in to reply');
        return;
      }

      const response = await axios.post(`${process.env.REACT_APP_API_URL}api/comments/${discussionId}`, {
        userId,
        text,
        parentCommentId,
      });

      setComments((prevComments) => {
        const addReplyToTree = (comments) => {
          return comments.map((comment) => {
            if (comment._id === parentCommentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), response.data],
              };
            }
            return {
              ...comment,
              replies: addReplyToTree(comment.replies || []),
            };
          });
        };

        return addReplyToTree(prevComments);
      });
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="Add a comment..."
          InputProps={{
            style: { color: '#ffffff', backgroundColor: '#353A40' },
          }}
          InputLabelProps={{
            style: { color: '#ffffff' },
          }}
        />
        <Button onClick={handleAddComment} variant="contained" sx={{ mt: 1, backgroundColor: '#373C42', color: '#ffffff' }}>
          Submit
        </Button>
      </Box>
      <Box
        sx={{
          maxHeight: '400px',
          overflowY: 'auto',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '8px',
          backgroundColor: '#2A2A2A',
        }}
      >
        {comments.map((comment) => (
          <CommentItem key={comment._id} comment={comment} onReply={handleReply} />
        ))}
      </Box>
    </Box>
  );
};

export default CommentSection;
