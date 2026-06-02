// src/components/feed/PostCard.jsx

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiMoreHorizontal, FiMessageCircle, FiShare2, FiBookmark,
  FiMapPin, FiSmile, FiImage, FiVideo, FiPlay, FiX, FiChevronLeft, FiChevronRight,
} from 'react-icons/fi';
import API from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import useAuthStore from '../../store/useAuthStore';
import useFeedStore from '../../store/useFeedStore';
import Avatar from '../common/Avatar';
import VerifiedBadge from '../common/VerifiedBadge';
import ReactionPicker from './ReactionPicker';
import CommentSection from './CommentSection';
import ShareModal from './ShareModal';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { timeAgo, formatNumber, getFullName } from '../../utils/formatters';
import { REACTIONS } from '../../utils/constants';

export default function PostCard({ post }) {
  var navigate = useNavigate();
  var user = useAuthStore(function (s) { return s.user; });
  var updatePost = useFeedStore(function (s) { return s.updatePost; });
  var removePost = useFeedStore(function (s) { return s.removePost; });
  var addReaction = useFeedStore(function (s) { return s.addReaction; });
  var removeReaction = useFeedStore(function (s) { return s.removeReaction; });

  var showCommentsState = useState(false);
  var showComments = showCommentsState[0];
  var setShowComments = showCommentsState[1];

  var showShareState = useState(false);
  var showShare = showShareState[0];
  var setShowShare = showShareState[1];

  var showMenuState = useState(false);
  var showMenu = showMenuState[0];
  var setShowMenu = showMenuState[1];

  var showDeleteState = useState(false);
  var showDelete = showDeleteState[0];
  var setShowDelete = showDeleteState[1];

  var deletingState = useState(false);
  var deleting = deletingState[0];
  var setDeleting = deletingState[1];

  var savedState = useState(false);
  var saved = savedState[0];
  var setSaved = savedState[1];

  var mediaIdxState = useState(0);
  var mediaIdx = mediaIdxState[0];
  var setMediaIdx = mediaIdxState[1];

  var showLightboxState = useState(false);
  var showLightbox = showLightboxState[0];
  var setShowLightbox = showLightboxState[1];

  var expandState = useState(false);
  var expanded = expandState[0];
  var setExpanded = expandState[1];

  var menuRef = useRef(null);

  useEffect(function () {
    function handleClick(e) { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); }
    document.addEventListener('mousedown', handleClick);
    return function () { document.removeEventListener('mousedown', handleClick); };
  }, []);

  var isOwner = user && post.author && (user._id === post.author._id || user._id === post.author);
  var authorId = post.author && (post.author._id || post.author);
  var authorName = post.author ? getFullName(post.author.firstName, post.author.lastName) : 'Unknown';
  var authorUsername = post.author ? post.author.username : 'unknown';
  var authorAvatar = post.author ? post.author.avatar : '';
  var authorVerified = post.author && post.author.isVerified;

  var totalReactions = (post.likesCount || 0) + (post.loveCount || 0) + (post.hahaCount || 0) + (post.wowCount || 0) + (post.sadCount || 0) + (post.angryCount || 0) + (post.careCount || 0);
  var topReaction = REACTIONS.find(function (r) { return (post[r.type + 'Count'] || 0) > 0; });
  var userReaction = post.userReaction || null;
  var contentLong = post.content && post.content.length > 300;
  var displayContent = expanded || !contentLong ? post.content : post.content.slice(0, 300) + '...';
  var media = post.media || [];

  var handleReaction = async function (type) {
    try {
      var res = await API.post(ENDPOINTS.REACTIONS.POST(post._id), { type: type });
      if (res.data.data.reacted) {
        addReaction(post._id, type);
        updatePost(post._id, { userReaction: type });
      } else {
        removeReaction(post._id, type);
        updatePost(post._id, { userReaction: null });
      }
    } catch (err) {}
  };

  var handleDelete = async function () {
    setDeleting(true);
    try {
      await API.delete(ENDPOINTS.POSTS.DELETE(post._id));
      removePost(post._id);
      toast.success('Post deleted');
      setShowDelete(false);
    } catch (err) { toast.error('Failed'); }
    setDeleting(false);
  };

  var handleSave = async function () {
    try {
      await API.post(ENDPOINTS.POSTS.SAVE(post._id));
      setSaved(!saved);
      toast.success(saved ? 'Unsaved' : 'Saved');
    } catch (err) {}
  };

  var handleReport = async function () {
    try {
      await API.post(ENDPOINTS.POSTS.REPORT(post._id), { reason: 'spam', description: 'Reported from post menu' });
      toast.success('Report submitted');
      setShowMenu(false);
    } catch (err) {}
  };

  var nextMedia = function (e) { e.stopPropagation(); if (mediaIdx < media.length - 1) setMediaIdx(mediaIdx + 1); };
  var prevMedia = function (e) { e.stopPropagation(); if (mediaIdx > 0) setMediaIdx(mediaIdx - 1); };

  return (
    <>
      <div style={{ background: 'var(--bg-card, #0F172A)', borderRadius: 16, border: '1px solid var(--border-color, #1E293B)', overflow: 'hidden' }}>
        {/* HEADER */}
        <div style={{ padding: '14px 16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <Link to={'/' + authorUsername} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', minWidth: 0 }}>
              <Avatar src={authorAvatar} alt={authorName} size="md" />
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary, #F8FAFC)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{authorName}</span>
                  {authorVerified && <VerifiedBadge size="xs" />}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted, #64748B)', marginTop: 1 }}>
                  <span>@{authorUsername}</span>
                  <span>·</span>
                  <span>{timeAgo(post.createdAt)}</span>
                  {post.isEdited && <span style={{ color: 'var(--text-muted, #64748B)' }}>· edited</span>}
                </div>
              </div>
            </Link>

            <div style={{ position: 'relative' }} ref={menuRef}>
              <button onClick={function () { setShowMenu(!showMenu); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted, #64748B)', cursor: 'pointer', padding: 6, borderRadius: 8 }}>
                <FiMoreHorizontal size={18} />
              </button>
              {showMenu && (
                <div style={{ position: 'absolute', right: 0, top: 32, background: 'var(--bg-card, #0F172A)', border: '1px solid var(--border-color, #1E293B)', borderRadius: 12, padding: 4, width: 170, zIndex: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                  {isOwner && <button onClick={function () { navigate('/post/' + post._id + '/edit'); setShowMenu(false); }} style={menuItemStyle}>✏️ Edit Post</button>}
                  {isOwner && <button onClick={function () { setShowDelete(true); setShowMenu(false); }} style={{ ...menuItemStyle, color: '#EF4444' }}>🗑️ Delete</button>}
                  {!isOwner && <button onClick={handleReport} style={menuItemStyle}>🚩 Report</button>}
                  <button onClick={function () { handleSave(); setShowMenu(false); }} style={menuItemStyle}>{saved ? '🔖 Saved' : '🔖 Save Post'}</button>
                  <button onClick={function () { navigator.clipboard.writeText(window.location.origin + '/post/' + post._id); toast.success('Link copied'); setShowMenu(false); }} style={menuItemStyle}>📋 Copy Link</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        {post.content && (
          <div style={{ padding: '0 16px 10px' }}>
            <p style={{ color: 'var(--text-secondary, #CBD5E1)', fontSize: 14, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {displayContent}
            </p>
            {contentLong && (
              <button onClick={function () { setExpanded(!expanded); }} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '4px 0', marginTop: 4 }}>
                {expanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}

        {/* FEELING + LOCATION */}
        {(post.feeling || post.location) && (
          <div style={{ display: 'flex', gap: 12, padding: '0 16px 8px', flexWrap: 'wrap' }}>
            {post.feeling && (
              <span style={{ fontSize: 12, color: 'var(--text-muted, #64748B)', display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg-tertiary, #1E293B)', padding: '4px 10px', borderRadius: 20 }}>
                {post.feeling.emoji} {post.feeling.label}
              </span>
            )}
            {post.location && (
              <span style={{ fontSize: 12, color: 'var(--text-muted, #64748B)', display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg-tertiary, #1E293B)', padding: '4px 10px', borderRadius: 20 }}>
                <FiMapPin size={12} /> {post.location.name}
              </span>
            )}
          </div>
        )}

        {/* MEDIA */}
        {media.length > 0 && (
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={function () { setShowLightbox(true); }}>
            <div style={{ position: 'relative' }}>
              {media[mediaIdx].type === 'video' ? (
                <div style={{ position: 'relative' }}>
                  <video src={media[mediaIdx].url} style={{ width: '100%', maxHeight: 400, objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiPlay size={24} color="white" style={{ marginLeft: 2 }} />
                    </div>
                  </div>
                </div>
              ) : (
                <img src={media[mediaIdx].url} alt="" style={{ width: '100%', maxHeight: 500, objectFit: 'cover', display: 'block' }} />
              )}

              {media.length > 1 && (
                <>
                  {mediaIdx > 0 && (
                    <button onClick={prevMedia} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiChevronLeft size={18} />
                    </button>
                  )}
                  {mediaIdx < media.length - 1 && (
                    <button onClick={nextMedia} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiChevronRight size={18} />
                    </button>
                  )}
                  <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
                    {media.map(function (_, i) {
                      return <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === mediaIdx ? 'white' : 'rgba(255,255,255,0.4)' }} />;
                    })}
                  </div>
                </>
              )}

              {media.length > 1 && (
                <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: 11, padding: '4px 8px', borderRadius: 10 }}>
                  {mediaIdx + 1}/{media.length}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SHARED POST */}
        {post.sharedPost && (
          <div style={{ margin: '0 16px 10px', border: '1px solid var(--border-color, #1E293B)', borderRadius: 12, padding: 12, background: 'var(--bg-tertiary, #1E293B)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Avatar src={post.sharedPost.author && post.sharedPost.author.avatar} alt="" size="xs" />
              <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-primary, #F8FAFC)' }}>
                {post.sharedPost.author ? getFullName(post.sharedPost.author.firstName, post.sharedPost.author.lastName) : 'Unknown'}
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted, #94A3B8)', margin: 0, lineHeight: 1.4 }}>
              {post.sharedPost.content ? post.sharedPost.content.slice(0, 150) : 'View post'}
            </p>
          </div>
        )}

        {/* STATS ROW */}
        <div style={{ padding: '6px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted, #64748B)' }}>
            {topReaction && <span>{topReaction.emoji}</span>}
            <span>{totalReactions > 0 ? formatNumber(totalReactions) : ''}</span>
          </div>
          <div style={{ display: 'flex', gap: 12, color: 'var(--text-muted, #64748B)' }}>
            <span>{post.commentsCount > 0 ? formatNumber(post.commentsCount) + ' comments' : ''}</span>
            <span>{post.sharesCount > 0 ? formatNumber(post.sharesCount) + ' shares' : ''}</span>
          </div>
        </div>

        {/* ACTION BAR */}
        <div style={{ display: 'flex', borderTop: '1px solid var(--border-color, #1E293B)', margin: '0 12px' }}>
          <ReactionPicker onReaction={handleReaction} currentReaction={userReaction} />
          <button onClick={function () { setShowComments(!showComments); }} style={actionBtnStyle}>
            <FiMessageCircle size={18} /> Comment
          </button>
          <button onClick={function () { setShowShare(true); }} style={actionBtnStyle}>
            <FiShare2 size={18} /> Share
          </button>
          <button onClick={handleSave} style={{ ...actionBtnStyle, color: saved ? '#3B82F6' : 'var(--text-muted, #64748B)' }}>
            <FiBookmark size={18} fill={saved ? '#3B82F6' : 'none'} /> {saved ? 'Saved' : 'Save'}
          </button>
        </div>

        {/* COMMENTS */}
        {showComments && <CommentSection postId={post._id} />}
      </div>

      {/* SHARE MODAL */}
      <ShareModal isOpen={showShare} onClose={function () { setShowShare(false); }} post={post} />

      {/* DELETE CONFIRM */}
      <Modal isOpen={showDelete} onClose={function () { setShowDelete(false); }} title="Delete Post" size="sm">
        <p style={{ color: 'var(--text-muted, #94A3B8)', fontSize: 14, marginBottom: 20, lineHeight: 1.5 }}>
          Are you sure you want to delete this post? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={function () { setShowDelete(false); }}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>Delete</Button>
        </div>
      </Modal>

      {/* LIGHTBOX */}
      {showLightbox && media.length > 0 && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={function () { setShowLightbox(false); }} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <FiX size={22} />
          </button>

          {mediaIdx > 0 && (
            <button onClick={function () { setMediaIdx(mediaIdx - 1); }} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <FiChevronLeft size={24} />
            </button>
          )}
          {mediaIdx < media.length - 1 && (
            <button onClick={function () { setMediaIdx(mediaIdx + 1); }} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <FiChevronRight size={24} />
            </button>
          )}

          {media[mediaIdx].type === 'video' ? (
            <video src={media[mediaIdx].url} controls autoPlay style={{ maxWidth: '95%', maxHeight: '90vh', objectFit: 'contain' }} />
          ) : (
            <img src={media[mediaIdx].url} alt="" style={{ maxWidth: '95%', maxHeight: '90vh', objectFit: 'contain' }} />
          )}

          {media.length > 1 && (
            <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
              {media.map(function (_, i) {
                return <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i === mediaIdx ? 'white' : 'rgba(255,255,255,0.3)' }} />;
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}

var menuItemStyle = {
  display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px',
  background: 'none', border: 'none', color: 'var(--text-secondary, #CBD5E1)',
  fontSize: 13, cursor: 'pointer', borderRadius: 8,
};

var actionBtnStyle = {
  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  padding: '10px 0', background: 'none', border: 'none',
  color: 'var(--text-muted, #64748B)', cursor: 'pointer', fontSize: 13,
  fontWeight: 500, borderRadius: 8,
};