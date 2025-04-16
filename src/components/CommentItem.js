import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';

const CommentItem = ({ comment, onReply }) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(comment._id, replyText);
      setReplyText('');
      setShowReplyBox(false);
    }
  };

  return (
    <Box sx={{ ml: comment.parentCommentId ? 4 : 0, mt: 2, backgroundColor: '#2A2A2A', padding: '10px', borderRadius: '4px' }}>
      <Typography variant="body1" style={{ color: '#ffffff' }}>{comment.text}</Typography>
      <Typography variant="caption" color="textSecondary" style={{ color: '#ffffff' }}>
        {comment.user.name || 'Anonymous'}
      </Typography>
      <Button size="small" onClick={() => setShowReplyBox(!showReplyBox)} style={{ color: '#ffffff' }}>
        Reply
      </Button>
      {showReplyBox && (
        <Box sx={{ mt: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            InputProps={{
              style: { color: '#ffffff', backgroundColor: '#353A40' },
            }}
            InputLabelProps={{
              style: { color: '#ffffff' },
            }}
          />
          <Button size="small" onClick={handleReply} sx={{ mt:1,backgroundColor: '#373C42', color: '#ffffff' }}>
            Submit
          </Button>
        </Box>
      )}
      {comment.replies && comment.replies.map((reply) => (
        <CommentItem key={reply._id} comment={reply} onReply={onReply} />
      ))}
    </Box>
  );
};

export default CommentItem;
