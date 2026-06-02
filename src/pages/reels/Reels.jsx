// src/pages/reels/Reels.jsx

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiMessageCircle, FiShare2, FiVolume2, FiVolumeX, FiPlus } from 'react-icons/fi';
import API from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import useAuthStore from '../../store/useAuthStore';
import Avatar from '../../components/common/Avatar';
import VerifiedBadge from '../../components/common/VerifiedBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { formatNumber, timeAgo } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function Reels() {
  var user = useAuthStore(function (s) { return s.user; });

  var reelsState = useState([]);
  var reels = reelsState[0];
  var setReels = reelsState[1];

  var activeState = useState(0);
  var activeIdx = activeState[0];
  var setActiveIdx = activeState[1];

  var loadState = useState(true);
  var loading = loadState[0];
  var setLoading = loadState[1];

  var mutedState = useState(false);
  var muted = mutedState[0];
  var setMuted = mutedState[1];

  var uploadState = useState(false);
  var uploading = uploadState[0];
  var setUploading = uploadState[1];

  var containerRef = useRef(null);
  var fileRef = useRef(null);
  var videoRefs = useRef({});

  useEffect(function () {
    API.get('/reels')
      .then(function (res) { setReels(res.data.data || []); })
      .catch(function () {})
      .finally(function () { setLoading(false); });
  }, []);

  useEffect(function () {
    Object.keys(videoRefs.current).forEach(function (key) {
      var vid = videoRefs.current[key];
      if (vid) {
        if (parseInt(key) === activeIdx) vid.play().catch(function () {});
        else { vid.pause(); vid.currentTime = 0; }
      }
    });
  }, [activeIdx]);

  var handleScroll = function () {
    if (!containerRef.current) return;
    var scrollTop = containerRef.current.scrollTop;
    var height = window.innerHeight - 56;
    var idx = Math.round(scrollTop / height);
    if (idx !== activeIdx && idx >= 0 && idx < reels.length) setActiveIdx(idx);
  };

  var handleReaction = async function (reelId) {
    try { await API.post('/reels/' + reelId + '/react', { type: 'like' }); } catch (err) {}
  };

  var handleUpload = function (e) {
    var file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) return toast.error('Only video files allowed');
    setUploading(true);
    var formData = new FormData();
    formData.append('video', file);
    formData.append('audience', 'public');
    API.post('/reels', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(function (res) {
        setReels([res.data.data].concat(reels));
        toast.success('Reel posted!');
      })
      .catch(function (err) { toast.error(err.response?.data?.message || 'Upload failed'); })
      .finally(function () { setUploading(false); });
  };

  if (loading) return <Loader className="py-20" />;

  return (
    <div style={{ height: 'calc(100vh - 56px)', overflow: 'hidden', position: 'relative', background: '#000' }}>
      {/* Upload button */}
      <label style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: uploading ? 0.5 : 1 }}>
        {uploading ? <div style={{ width: 18, height: 18, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.5s linear infinite' }} /> : <FiPlus size={22} color="white" />}
        <input ref={fileRef} type="file" accept="video/*" onChange={handleUpload} disabled={uploading} style={{ display: 'none' }} />
      </label>

      {reels.length === 0 ? (
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyState icon="🎬" title="No reels yet" description="Upload the first reel or check back later" />
        </div>
      ) : (
        <div
          ref={containerRef}
          onScroll={handleScroll}
          style={{ height: '100%', overflowY: 'scroll', scrollSnapType: 'y mandatory', scrollBehavior: 'smooth' }}
        >
          {reels.map(function (reel, i) {
            return (
              <div key={reel._id} style={{ height: 'calc(100vh - 56px)', scrollSnapAlign: 'start', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <video
                  ref={function (el) { videoRefs.current[i] = el; }}
                  src={reel.media && reel.media[0] ? reel.media[0].url : ''}
                  muted={muted}
                  loop
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Mute toggle */}
                <button onClick={function () { setMuted(!muted); }} style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {muted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
                </button>

                {/* Info + Actions */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 16px 80px', background: 'linear-gradient(transparent, rgba(0,0,0,0.9))' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1, marginRight: 16 }}>
                      <Link to={'/' + (reel.author && reel.author.username)} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, textDecoration: 'none' }}>
                        <Avatar src={reel.author && reel.author.avatar} alt="" size="sm" />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 700, color: 'white', fontSize: 15 }}>@{reel.author && reel.author.username}</span>
                            {reel.author && reel.author.isVerified && <VerifiedBadge />}
                          </div>
                          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{timeAgo(reel.createdAt)}</span>
                        </div>
                        <button style={{ marginLeft: 8, padding: '6px 16px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.5)', background: 'transparent', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Follow</button>
                      </Link>
                      {reel.content && <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 1.4, margin: 0 }}>{reel.content}</p>}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                      <button onClick={function () { handleReaction(reel._id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FiHeart size={22} color="white" />
                        </div>
                        <span style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>{formatNumber((reel.likesCount || 0) + (reel.loveCount || 0))}</span>
                      </button>
                      <Link to={'/post/' + reel._id} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FiMessageCircle size={22} color="white" />
                        </div>
                        <span style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>{formatNumber(reel.commentsCount || 0)}</span>
                      </Link>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FiShare2 size={22} color="white" />
                        </div>
                        <span style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
    </div>
  );
}