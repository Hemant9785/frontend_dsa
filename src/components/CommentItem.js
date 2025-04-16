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
    <Box sx={{ ml: comment.parentCommentId ? 4 : 0, mt: 2 }}>
      <Typography variant="body1">{comment.text}</Typography>
      <Typography variant="caption" color="textSecondary">
        {comment.user.name || 'Anonymous'}
      </Typography>
      <Button size="small" onClick={() => setShowReplyBox(!showReplyBox)}>
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
          />
          <Button size="small" onClick={handleReply}>
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
