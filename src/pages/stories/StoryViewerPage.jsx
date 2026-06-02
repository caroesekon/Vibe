// src/pages/stories/StoryViewerPage.jsx

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import API from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import useAuthStore from '../../store/useAuthStore';
import Avatar from '../../components/common/Avatar';
import Loader from '../../components/common/Loader';
import { timeAgo } from '../../utils/formatters';

export default function StoryViewerPage() {
  var userId = useParams().userId;
  var navigate = useNavigate();
  var user = useAuthStore(function (s) { return s.user; });

  var storiesState = useState([]);
  var stories = storiesState[0];
  var setStories = storiesState[1];

  var idxState = useState(0);
  var currentIdx = idxState[0];
  var setCurrentIdx = idxState[1];

  var loadState = useState(true);
  var loading = loadState[0];
  var setLoading = loadState[1];

  var viewersState = useState(null);
  var viewers = viewersState[0];
  var setViewers = viewersState[1];

  var showViewersState = useState(false);
  var showViewers = showViewersState[0];
  var setShowViewers = showViewersState[1];

  var progressState = useState(0);
  var progress = progressState[0];
  var setProgress = progressState[1];

  var timerRef = useRef(null);

  useEffect(function () {
    fetchStories();
    return function () { if (timerRef.current) clearInterval(timerRef.current); };
  }, [userId]);

  var fetchStories = async function () {
    setLoading(true);
    try {
      var res = await API.get(ENDPOINTS.STORIES.FEED);
      var feedData = res.data.data || [];
      var allStories = [];

      feedData.forEach(function (group) {
        var authorId = group.author._id || group.author;
        if (authorId === userId || authorId.toString() === userId) {
          allStories = group.stories || [];
        }
      });

      if (allStories.length === 0) {
        var mineRes = await API.get(ENDPOINTS.STORIES.MINE);
        var myStories = mineRes.data.data || [];
        allStories = myStories.filter(function (s) {
          var sAuthor = s.author._id || s.author;
          return sAuthor.toString() === userId;
        });
      }

      setStories(allStories);
    } catch (err) {}
    setLoading(false);
  };

  var viewStory = async function (storyId) {
    try { await API.post(ENDPOINTS.STORIES.VIEW(storyId)); } catch (err) {}
  };

  var reactToStory = async function (storyId, emoji) {
    try { await API.post(ENDPOINTS.STORIES.REACT(storyId), { emoji: emoji }); } catch (err) {}
  };

  var fetchViewers = async function (storyId) {
    try {
      var res = await API.get(ENDPOINTS.STORIES.VIEWERS(storyId));
      setViewers(res.data);
      setShowViewers(true);
    } catch (err) {}
  };

  var startProgress = function () {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(0);
    var duration = 5;
    if (stories[currentIdx] && stories[currentIdx].media && stories[currentIdx].media.duration) {
      duration = stories[currentIdx].media.duration;
    }
    var step = 100 / (duration * 10);
    timerRef.current = setInterval(function () {
      setProgress(function (p) {
        if (p >= 100) { clearInterval(timerRef.current); next(); return 100; }
        return p + step;
      });
    }, 100);
  };

  useEffect(function () {
    if (stories.length > 0 && !loading) {
      startProgress();
      if (currentIdx < stories.length) viewStory(stories[currentIdx]._id);
    }
  }, [currentIdx, stories, loading]);

  var next = function () {
    if (currentIdx < stories.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      navigate(-1);
    }
  };

  var prev = function () {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader />
      </div>
    );
  }

  if (!stories.length) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📷</div>
        <p style={{ color: '#94A3B8', fontSize: 16 }}>No stories available</p>
        <button onClick={function () { navigate(-1); }} style={{ marginTop: 20, padding: '10px 24px', borderRadius: 10, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Go Back</button>
      </div>
    );
  }

  var story = stories[currentIdx];
  var isOwner = story.author && (story.author._id === user._id || story.author === user._id);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <button onClick={function () { navigate(-1); }} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FiX size={20} />
      </button>

      <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', alignItems: 'center', gap: 10, zIndex: 20 }}>
        <Avatar src={story.author && story.author.avatar} alt="" size="sm" />
        <div>
          <div style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>@{story.author && story.author.username}</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{timeAgo(story.createdAt)}</div>
        </div>
      </div>

      <div style={{ position: 'absolute', top: 60, left: 16, right: 16, display: 'flex', gap: 4, zIndex: 20 }}>
        {stories.map(function (s, i) {
          return (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: '#333', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: i < currentIdx ? '100%' : i === currentIdx ? progress + '%' : '0%', background: 'white', borderRadius: 2, transition: 'width 0.1s linear' }} />
            </div>
          );
        })}
      </div>

      {currentIdx > 0 && (
        <button onClick={prev} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FiChevronLeft size={22} />
        </button>
      )}

      <button onClick={next} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FiChevronRight size={22} />
      </button>

      <div style={{ position: 'absolute', bottom: 40, left: 20, right: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 20 }}>
        <input type="text" placeholder="Send message..." style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '8px 16px', color: 'white', fontSize: 13, width: 200, outline: 'none' }} />

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={function () { reactToStory(story._id, '❤️'); }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 38, height: 38, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>❤️</button>
          <button onClick={function () { reactToStory(story._id, '😂'); }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 38, height: 38, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>😂</button>
          <button onClick={function () { reactToStory(story._id, '🔥'); }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 38, height: 38, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🔥</button>
          {isOwner && (
            <button onClick={function () { fetchViewers(story._id); }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 38, height: 38, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👁️</button>
          )}
        </div>
      </div>

      {story.media && story.media.type === 'video' ? (
        <video src={story.media.url} autoPlay loop playsInline style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
      ) : (
        <img src={story.media && story.media.url} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
      )}

      {story.textOverlay && (
        <div style={{ position: 'absolute', bottom: '35%', left: '50%', transform: 'translateX(-50%)', zIndex: 20, color: story.textOverlay.color || 'white', fontSize: 20, fontWeight: 700, textAlign: 'center', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
          {story.textOverlay.text}
        </div>
      )}

      {showViewers && viewers && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.95)', zIndex: 30, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '50%', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ color: 'white', fontSize: 16, fontWeight: 600 }}>Views ({viewers.total || viewers.data.length})</h3>
            <button onClick={function () { setShowViewers(false); }} style={{ background: 'none', border: 'none', color: 'white', fontSize: 20, cursor: 'pointer' }}>✕</button>
          </div>
          {viewers.data && viewers.data.map(function (v) {
            return (
              <div key={v._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1E293B' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar src={v.viewer && v.viewer.avatar} alt={v.viewer && v.viewer.firstName} size="sm" />
                  <div>
                    <div style={{ color: 'white', fontSize: 13, fontWeight: 500 }}>{v.viewer && v.viewer.firstName} {v.viewer && v.viewer.lastName}</div>
                    <div style={{ color: '#64748B', fontSize: 11 }}>@{v.viewer && v.viewer.username}</div>
                  </div>
                </div>
                {v.reaction && <span style={{ fontSize: 18 }}>{v.reaction}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}