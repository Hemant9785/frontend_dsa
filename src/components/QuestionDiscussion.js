import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';
import axios from 'axios';
import AuthService from '../services/auth.service';

const scrollableStyle = {
  overflowY: 'auto',
  border: '1px solid #ccc',
  padding: '8px',
  borderRadius: '4px',
  maxHeight: '40vh', // Responsive height
};

const QuestionDiscussion = () => {
  const { title } = useParams();
  const [discussions, setDiscussions] = useState([]);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' });
  const [commentTexts, setCommentTexts] = useState({});
  const [replyText, setReplyText] = useState('');
  const [replyTexts, setReplyTexts] = useState({});
  const [commentsVisible, setCommentsVisible] = useState({});

  useEffect(() => {
    fetchDiscussions();
  }, [title]);

  const fetchDiscussions = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}api/question-discussions/${encodeURIComponent(title)}`);
      setDiscussions(response.data);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    }
  };

  const handleCreateDiscussion = async () => {
    try {
      const userId = AuthService.getCurrentUser()?.id;
      if (!userId) {
        alert('You must be logged in to create a discussion');
        return;
      }

      if (!newDiscussion.title.trim() || !newDiscussion.content.trim()) {
        alert('Title and content are required');
        return;
      }

      const response = await axios.post(`${process.env.REACT_APP_API_URL}api/question-discussions`, {
        ...newDiscussion,
        userId,
        questionTitle: title.trim(),
      });

      setDiscussions((prev) => [...prev, response.data]);
      setNewDiscussion({ title: '', content: '' });
    } catch (error) {
      console.error('Error creating discussion:', error);
    }
  };

  const handleAddComment = async (discussionId, parentCommentId = null) => {
    try {
      const userId = AuthService.getCurrentUser()?.id;
      if (!userId) {
        alert('You must be logged in to comment');
        return;
      }

      const text = parentCommentId ? replyTexts[parentCommentId] : commentTexts[discussionId] || '';

      if (!text.trim()) {
        alert('Comment text is required');
        return;
      }

      const response = await axios.post(`${process.env.REACT_APP_API_URL}api/question-comment-reply/${discussionId}`, {
        userId,
        text,
        parentCommentId,
      });

      setDiscussions((prev) =>
        prev.map((discussion) =>
          discussion._id === discussionId
            ? { ...discussion, comments: [...discussion.comments, response.data] }
            : discussion
        )
      );

      if (parentCommentId) {
        setReplyTexts((prev) => ({ ...prev, [parentCommentId]: '' }));
      } else {
        setCommentTexts((prev) => ({ ...prev, [discussionId]: '' }));
      }
      setReplyText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const renderComments = (comments, level = 0) => {
    return comments.map((comment) => (
      <Box key={comment._id} sx={{ marginLeft: level * 4, marginBottom: 2 }}>
        <Typography variant="body2" sx={{ color: '#555' }}>
          {comment.user.name}
        </Typography>
        <Typography variant="body2" sx={{ marginBottom: 1 }}>
          {comment.text}
        </Typography>
        <Button size="small" onClick={() => setReplyText(comment._id)}>Reply</Button>
        {replyText === comment._id && (
          <Box sx={{ marginTop: 1 }}>
            <TextField
              fullWidth
              label="Reply"
              value={replyTexts[comment._id] || ''}
              onChange={(e) => setReplyTexts({ ...replyTexts, [comment._id]: e.target.value })}
              sx={{ marginBottom: 1 }}
            />
            <Button variant="outlined" onClick={() => handleAddComment(comment.discussion, comment._id)}>
              Submit Reply
            </Button>
          </Box>
        )}
        {comment.replies && renderComments(comment.replies, level + 1)}
      </Box>
    ));
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Discussions for {title}
      </Typography>
      <Paper sx={{ padding: 2, marginBottom: 2 }}>
        <Typography variant="h6">Create a New Discussion</Typography>
        <TextField
          fullWidth
          label="Title"
          value={newDiscussion.title}
          onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          fullWidth
          label="Content"
          multiline
          rows={4}
          value={newDiscussion.content}
          onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
          sx={{ marginBottom: 2 }}
        />
        <Button variant="contained" onClick={handleCreateDiscussion}>
          Submit
        </Button>
      </Paper>
      {discussions.map((discussion) => (
        <Paper key={discussion._id} sx={{ padding: 2, marginBottom: 2 }}>
          <Typography variant="h6">{discussion.title}</Typography>
          <Typography variant="body1">{discussion.content}</Typography>
          <Typography variant="body2" sx={{ color: '#555' }}>
            {discussion.user.name}
          </Typography>
          <Button
            variant="text"
            onClick={() => setCommentsVisible((prev) => ({ ...prev, [discussion._id]: !prev[discussion._id] }))}
          >
            {commentsVisible[discussion._id] ? 'Hide Comments' : 'Show Comments'}
          </Button>
          {commentsVisible[discussion._id] && (
            <Box sx={{ marginTop: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                <TextField
                  fullWidth
                  label="Add a comment"
                  value={commentTexts[discussion._id] || ''}
                  onChange={(e) => setCommentTexts({ ...commentTexts, [discussion._id]: e.target.value })}
                  sx={{ marginRight: 1 }}
                />
                <Button variant="outlined" onClick={() => handleAddComment(discussion._id)}>
                  Add Comment
                </Button>
              </Box>
              <Box sx={{ ...scrollableStyle }}>
                {renderComments(discussion.comments)}
              </Box>
            </Box>
          )}
        </Paper>
      ))}
    </Box>
  );
};

export default QuestionDiscussion;