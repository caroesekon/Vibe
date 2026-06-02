import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiSend } from 'react-icons/fi';
import API from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import useAuthStore from '../../store/useAuthStore';
import Avatar from '../common/Avatar';
import VerifiedBadge from '../common/VerifiedBadge';
import { timeAgo } from '../../utils/formatters';

export default function CommentSection({ postId }) {
  var user = useAuthStore(function (s) { return s.user; });

  var commentsState = useState([]);
  var comments = commentsState[0];
  var setComments = commentsState[1];

  var contentState = useState('');
  var content = contentState[0];
  var setContent = contentState[1];

  var loadState = useState(false);
  var loading = loadState[0];
  var setLoading = loadState[1];

  var sendState = useState(false);
  var sending = sendState[0];
  var setSending = sendState[1];

  var replyState = useState(null);
  var replyTo = replyState[0];
  var setReplyTo = replyState[1];

  useEffect(function () { fetchComments(); }, [postId]);

  var fetchComments = async function () {
    setLoading(true);
    try { var res = await API.get(ENDPOINTS.COMMENTS.GET(postId)); setComments(res.data.data || []); } catch (err) {}
    setLoading(false);
  };

  var handleSubmit = async function (e) {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    try {
      if (replyTo) { await API.post(ENDPOINTS.COMMENTS.REPLY(replyTo._id), { content: content.trim() }); setReplyTo(null); }
      else { await API.post(ENDPOINTS.COMMENTS.CREATE(postId), { content: content.trim() }); }
      setContent('');
      fetchComments();
    } catch (err) { toast.error('Failed'); }
    setSending(false);
  };

  return (
    <div style={{ borderTop: '1px solid #1E293B', padding: 16 }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <Avatar src={user && user.avatar} alt={user && user.firstName} size="sm" />
        <div style={{ flex: 1 }}>
          {replyTo && <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>Replying to @{replyTo.author && replyTo.author.username} <button onClick={function () { setReplyTo(null); }} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer' }}>Cancel</button></div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="text" value={content} onChange={function (e) { setContent(e.target.value); }} placeholder="Write a comment..." style={{ flex: 1, background: '#1E293B', border: '1px solid #334155', borderRadius: 10, padding: '8px 12px', color: '#F8FAFC', fontSize: 13, outline: 'none' }} />
            <button type="submit" disabled={!content.trim() || sending} style={{ background: 'none', border: 'none', color: content.trim() ? '#3B82F6' : '#334155', cursor: 'pointer' }}><FiSend size={18} /></button>
          </div>
        </div>
      </form>
      {loading ? <div style={{ textAlign: 'center', color: '#64748B', padding: 20 }}>Loading...</div>
        : comments.length === 0 ? <div style={{ textAlign: 'center', color: '#64748B', fontSize: 13, padding: 12 }}>No comments yet</div>
        : <div style={{ maxHeight: 300, overflowY: 'auto' }}>{comments.map(function (c) { return <CommentItem key={c._id} comment={c} onReply={function () { setReplyTo(c); }} depth={0} />; })}</div>}
    </div>
  );
}

function CommentItem({ comment, onReply, depth }) {
  if (depth > 2) return null;
  return (
    <div style={{ marginBottom: 8, marginLeft: depth > 0 ? 32 : 0 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <Avatar src={comment.author && comment.author.avatar} alt={comment.author && comment.author.firstName} size="xs" />
        <div style={{ flex: 1 }}>
          <div style={{ background: '#1E293B', borderRadius: 12, padding: '8px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
              <Link to={'/' + (comment.author && comment.author.username)} style={{ fontSize: 12, fontWeight: 600, color: '#F8FAFC', textDecoration: 'none' }}>{comment.author && comment.author.firstName}</Link>
              {comment.author && comment.author.isVerified && <VerifiedBadge size="xs" />}
              <span style={{ fontSize: 10, color: '#64748B' }}>{timeAgo(comment.createdAt)}</span>
            </div>
            <p style={{ fontSize: 13, color: '#CBD5E1', margin: 0 }}>{comment.content}</p>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 2, marginLeft: 4 }}>
            <button style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 10 }}>Like</button>
            <button onClick={onReply} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 10 }}>Reply</button>
          </div>
        </div>
      </div>
      {comment.replies && comment.replies.map(function (r) { return <CommentItem key={r._id} comment={r} depth={depth + 1} />; })}
    </div>
  );
}