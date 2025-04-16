import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Paper, TextField, Button, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Card, CardContent, CardHeader, Box, CircularProgress,
  Autocomplete, IconButton, CardActions, FormControl, Select, MenuItem,
  InputAdornment, Avatar, Tooltip
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import AuthService from '../services/auth.service';
import axios from 'axios';
import CommentSection from './CommentSection';

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

const VoteCount = styled(Typography)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(1),
}));

const Discussions = () => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTag, setSearchTag] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    tags: []
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [editingDiscussion, setEditingDiscussion] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [commentsVisible, setCommentsVisible] = useState({});

  const currentUser = AuthService.getCurrentUser();

  // Debounce search
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const fetchDiscussions = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (searchTag) {
        params.tag = searchTag;
      }
      
      const response = await axios.get(`${process.env.REACT_APP_API_URL}api/discussions`, { params });
      
      const discussionsWithComments = response.data.discussions.map(discussion => ({
        ...discussion,
        comments: discussion.comments || [] // Ensure comments is an array
      }));

      if (page === 1) {
        setDiscussions(discussionsWithComments);
      } else {
        setDiscussions(prev => [...prev, ...discussionsWithComments]);
      }
      
      setHasMore(response.data.hasMore);
      setError(null);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      setError('Failed to load discussions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchTag, page]);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  const handleTagsChange = (e) => {
    const inputValue = e.target.value;
    // Process tags: split by comma, trim, lowercase, remove duplicates
    const processedTags = [...new Set(
      inputValue.split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0)
    )];

    setNewDiscussion(prev => ({
      ...prev,
      tags: processedTags
    }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
    fetchDiscussions();
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !newDiscussion.tags.includes(tagInput.trim())) {
      setNewDiscussion(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleCreateDiscussion = async () => {
    if (!newDiscussion.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!newDiscussion.content.trim()) {
      setError('Content is required');
      return;
    }
    if (newDiscussion.tags.length === 0) {
      setError('At least one tag is required');
      return;
    }

    try {
      const userId = currentUser?.id;
      if (!userId) {
        setError('You must be logged in to create a discussion');
        return;
      }

      const discussionData = {
        title: newDiscussion.title.trim(),
        content: newDiscussion.content.trim(),
        tags: newDiscussion.tags,
        userId,
        createdBy: userId
      };

      await axios.post(`${process.env.REACT_APP_API_URL}api/discussions`, discussionData);

      // Clear form and close dialog
      setOpenDialog(false);
      setNewDiscussion({
        title: '',
        content: '',
        tags: []
      });

      // Refresh discussions
      fetchDiscussions();
    } catch (error) {
      console.error('Error creating discussion:', error);
      setError('Failed to save discussion. Please try again.');
    }
  };

  const handleVote = async (discussionId, voteType) => {
    try {
      const userId = currentUser?.id;
      if (!userId) {
        setError('You must be logged in to vote');
        return;
      }

      const response = await axios.post(`${process.env.REACT_APP_API_URL}api/discussions/${discussionId}/vote`, {
        userId,
        voteType
      });

      // Update the discussion in state
      setDiscussions(prev =>
        prev.map(d => d._id === discussionId ? response.data : d)
      );
    } catch (error) {
      console.error('Error voting on discussion:', error);
      setError('Failed to register vote. Please try again.');
    }
  };

  const handleEdit = (discussion) => {
    setEditingDiscussion(discussion);
    setNewDiscussion({
      title: discussion.title,
      content: discussion.content,
      tags: discussion.tags
    });
    setOpenDialog(true);
  };

  const handleLoadMore = () => {
    if (hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const isUpvoted = (discussion) => {
    return currentUser && discussion.upvotes && discussion.upvotes.includes(currentUser.id);
  };

  const isDownvoted = (discussion) => {
    return currentUser && discussion.downvotes && discussion.downvotes.includes(currentUser.id);
  };

  const handleDelete = async (discussionId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;

    try {
      const userId = currentUser?.id;
      if (!userId) {
        setError('You must be logged in to delete a discussion');
        return;
      }

      const response = await axios.delete(`${process.env.REACT_APP_API_URL}api/discussions/${discussionId}`, {
        data: { userId }  // Send userId in request body
      });

      if (response.status === 200) {
        setDiscussions(prev => prev.filter(d => d._id !== discussionId));
        setError('Discussion deleted successfully');
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      console.error("Error deleting discussion:", error);
      setError(error.response?.data?.error || 'Failed to delete discussion. Please try again.');
    }
  };

  const toggleCommentsVisibility = (discussionId) => {
    setCommentsVisible(prev => ({
      ...prev,
      [discussionId]: !prev[discussionId]
    }));
  };

  return (
    <Container style={{ backgroundColor: '#1A1A1A', minHeight: '100vh', padding: '20px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 3 }}>
        <Typography variant="h4" component="h1" style={{ color: '#ffffff' }}>
          Discussions
        </Typography>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => {
            setEditingDiscussion(null);
            setNewDiscussion({ title: '', content: '', tags: [] });
            setOpenDialog(true);
          }}
          style={{ backgroundColor: '#373C42', color: '#ffffff' }}
        >
          New Discussion
        </Button>
      </Box>

      {/* Search bar */}
      <Paper component="form" sx={{ p: 1, mb: 3, display: 'flex', backgroundColor: '#1A1A1A' }} onSubmit={handleSearchSubmit}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Search by tag..."
          value={searchTag}
          onChange={(e) => setSearchTag(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EditIcon />
              </InputAdornment>
            ),
            style: { backgroundColor: '#2A2A2A', color: '#ffffff' },
          }}
          InputLabelProps={{
            style: { color: '#ffffff' },
          }}
        />
        <Button type="submit" variant="contained" sx={{ ml: 1 }} style={{ backgroundColor: '#373C42', color: '#ffffff' }}>
          Search
        </Button>
      </Paper>

      {/* Error message */}
      {error && (
        <Typography color="error" sx={{ mb: 2 }} style={{ color: '#ffffff' }}>
          {error}
        </Typography>
      )}

      {/* Discussions list */}
      {loading && page === 1 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : discussions.length === 0 ? (
        <Typography variant="h6" color="textSecondary" sx={{ textAlign: 'center', my: 4 }} style={{ color: '#ffffff' }}>
          No discussions found.
        </Typography>
      ) : (
        <>
          {discussions.map((discussion) => (
            <Card key={discussion._id} sx={{ mb: 3 }} style={{ backgroundColor: '#2A2A2A' }}>
              <CardHeader
                avatar={
                  <Avatar>
                    {discussion.user?.name?.charAt(0) || <PersonIcon />}
                  </Avatar>
                }
                title={<Typography variant="h5" style={{ color: '#ffffff' }}>{discussion.title}</Typography>}
                subheader={<Typography variant="caption" style={{ color: '#ffffff' }}>Posted by {discussion.user?.name || 'Anonymous'}</Typography>}
                action={
                  (() => {
                    const canEditDelete = discussion.user._id === currentUser?.id;
                    console.log(canEditDelete)
                    console.log(discussion.user._id,currentUser?.id)
                    return canEditDelete && (
                      <Box>
                        <IconButton onClick={() => handleEdit(discussion)} style={{ color: '#ffffff' }}>
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleDelete(discussion._id)}
                          color="error"
                          style={{ color: '#ffffff' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    );
                  })()
                }
              />
              <CardContent>
                <Typography variant="body1" paragraph style={{ color: '#ffffff' }}>
                  {discussion.content}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                  {discussion.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      onClick={() => {
                        setSearchTag(tag);
                        setPage(1);
                      }}
                      style={{ backgroundColor: '#ffffff', color: '#1A1A1A' }}
                    />
                  ))}
                </Box>
                <Button
                  variant="text"
                  onClick={() => toggleCommentsVisibility(discussion._id)}
                  style={{ color: '#ffffff' }}
                >
                  {commentsVisible[discussion._id] ? 'Hide Comments' : 'Show Comments'}
                </Button>
                {commentsVisible[discussion._id] && (
                  <CommentSection
                    discussionId={discussion._id}
                    comments={discussion.comments || []}
                    onCommentAdded={(newComment) => {
                      setDiscussions(prev => prev.map(d => 
                        d._id === discussion._id ? { ...d, comments: [...d.comments, newComment] } : d
                      ));
                    }}
                  />
                )}
              </CardContent>
              <CardActions disableSpacing>
                <Tooltip title="Upvote">
                  <IconButton 
                    onClick={() => handleVote(discussion._id, 'upvote')}
                    color={isUpvoted(discussion) ? "primary" : "default"}
                    style={{ color: '#ffffff' }}
                  >
                    <ThumbUpIcon />
                  </IconButton>
                </Tooltip>
                <Typography variant="body2" style={{ color: '#ffffff' }}>
                  {discussion.upvotes?.length || 0}
                </Typography>
                <Tooltip title="Downvote">
                  <IconButton 
                    onClick={() => handleVote(discussion._id, 'downvote')}
                    color={isDownvoted(discussion) ? "primary" : "default"}
                    style={{ color: '#ffffff' }}
                  >
                    <ThumbDownIcon />
                  </IconButton>
                </Tooltip>
                <Typography variant="body2" style={{ color: '#ffffff' }}>
                  {discussion.downvotes?.length || 0}
                </Typography>
              </CardActions>
            </Card>
          ))}

          {/* Load more button */}
          {hasMore && (
            <Box sx={{ textAlign: 'center', my: 3 }}>
              <Button 
                variant="outlined" 
                onClick={handleLoadMore}
                disabled={loading}
                style={{ backgroundColor: '#ffffff', color: '#1A1A1A' }}
              >
                {loading ? <CircularProgress size={24} style={{ color: '#ffffff' }} /> : 'Load More'}
              </Button>
            </Box>
          )}
        </>
      )}

      {/* Dialog for creating/editing discussion */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="md" PaperProps={{ style: { backgroundColor: '#1A1A1A' } }}>
        <DialogTitle style={{ color: '#ffffff' }}>
          {editingDiscussion ? 'Edit Discussion' : 'Create New Discussion'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={newDiscussion.title}
            onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mb: 2 }}
            style={{ backgroundColor: '#2A2A2A', color: '#ffffff' }}
            InputLabelProps={{
              style: { color: '#ffffff' },
            }}
            InputProps={{
              style: { color: '#ffffff' },
            }}
          />
          <TextField
            margin="dense"
            label="Content"
            fullWidth
            multiline
            rows={6}
            value={newDiscussion.content}
            onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
            sx={{ mb: 2 }}
            style={{ backgroundColor: '#2A2A2A', color: '#ffffff' }}
            InputLabelProps={{
              style: { color: '#ffffff' },
            }}
            InputProps={{
              style: { color: '#ffffff' },
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TextField
              label="Add Tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              sx={{ marginRight: 1 }}
              style={{ backgroundColor: '#2A2A2A', color: '#ffffff' }}
              InputLabelProps={{
                style: { color: '#ffffff' },
              }}
              InputProps={{
                style: { color: '#ffffff' },
              }}
            />
            <Button variant="outlined" onClick={handleAddTag} style={{ backgroundColor: '#373C42', color: '#1A1A1A' }}>Add Tag</Button>
          </Box>
          <Box sx={{ marginBottom: 2 }}>
            {newDiscussion.tags.map((tag, index) => (
              <Typography key={index} variant="body2" sx={{ display: 'inline-block', marginRight: 1 }} style={{ color: '#ffffff' }}>
                #{tag}
              </Typography>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} style={{ backgroundColor: '#373C42', color: '#ffffff' }}>Cancel</Button>
          <Button onClick={handleCreateDiscussion} variant="contained" style={{ backgroundColor: '#373C42', color: '#ffffff' }}>
            {editingDiscussion ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Discussions;
