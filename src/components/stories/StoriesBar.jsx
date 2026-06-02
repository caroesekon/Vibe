// src/components/stories/StoriesBar.jsx

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiType, FiImage, FiX } from 'react-icons/fi';
import API from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import useAuthStore from '../../store/useAuthStore';
import Avatar from '../common/Avatar';
import toast from 'react-hot-toast';

export default function StoriesBar() {
  var user = useAuthStore(function (s) { return s.user; });

  var storiesState = useState([]);
  var stories = storiesState[0];
  var setStories = storiesState[1];

  var loadState = useState(true);
  var loading = loadState[0];
  var setLoading = loadState[1];

  var uploadState = useState(false);
  var uploading = uploadState[0];
  var setUploading = uploadState[1];

  var modalState = useState(false);
  var showModal = modalState[0];
  var setShowModal = modalState[1];

  var textState = useState('');
  var textStory = textState[0];
  var setTextStory = textState[1];

  var bgColorState = useState('#3B82F6');
  var bgColor = bgColorState[0];
  var setBgColor = bgColorState[1];

  var textColorState = useState('#FFFFFF');
  var textColor = textColorState[0];
  var setTextColor = textColorState[1];

  var modeState = useState('text');
  var mode = modeState[0];
  var setMode = modeState[1];

  var fileRef = useRef(null);

  var colors = ['#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', '#10B981', '#EC4899', '#6366F1', '#14B8A6'];

  useEffect(function () { fetchStories(); }, []);

  var fetchStories = async function () {
    try {
      var res = await API.get(ENDPOINTS.STORIES.FEED);
      setStories(res.data.data || []);
    } catch (err) {}
    setLoading(false);
  };

  var uploadStory = async function (formData) {
    setUploading(true);
    try {
      await API.post(ENDPOINTS.STORIES.CREATE, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Story created!');
      fetchStories();
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
    setUploading(false);
  };

  var handleMediaUpload = function (e) {
    var file = e.target.files[0];
    if (!file) return;
    var formData = new FormData();
    formData.append('media', file);
    formData.append('audience', 'public');
    uploadStory(formData);
  };

  var handleTextStory = async function () {
    if (!textStory.trim()) return toast.error('Enter story text');
    setUploading(true);
    try {
      await API.post(ENDPOINTS.STORIES.CREATE, {
        textOverlay: { text: textStory.trim(), color: textColor, backgroundColor: bgColor, position: 'center' },
        audience: 'public',
      });
      toast.success('Story created!');
      fetchStories();
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
    setUploading(false);
  };

  var closeModal = function () {
    setShowModal(false);
    setTextStory('');
    setMode('text');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
        {[1, 2, 3, 4, 5].map(function (i) {
          return <div key={i} style={{ width: 64, height: 64, borderRadius: '50%', background: '#1E293B', flexShrink: 0 }} />;
        })}
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
        {/* Create Story */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0, opacity: uploading ? 0.5 : 1 }}>
          <div
            onClick={function () { setShowModal(true); }}
            style={{ position: 'relative', width: 64, height: 64, borderRadius: '50%', background: '#1E293B', border: '2px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <Avatar src={user && user.avatar} alt={user && user.firstName} size="md" />
            <div style={{ position: 'absolute', bottom: -2, right: -2, width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #020617' }}>
              <FiPlus size={12} color="white" />
            </div>
          </div>
          <span style={{ fontSize: 10, color: '#64748B', maxWidth: 64, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Your Story</span>
        </div>

        {/* Stories from followed users */}
        {stories.map(function (group) {
          var author = group.author;
          return (
            <Link key={author._id} to={'/stories/' + author._id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textDecoration: 'none', flexShrink: 0 }}>
              <div style={{ padding: group.hasUnseen ? 3 : 0, borderRadius: '50%', background: group.hasUnseen ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)' : 'transparent' }}>
                <div style={{ width: group.hasUnseen ? 58 : 64, height: group.hasUnseen ? 58 : 64, borderRadius: '50%', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', border: group.hasUnseen ? 'none' : '2px solid #334155' }}>
                  <Avatar src={author.avatar} alt={author.firstName} size="sm" />
                </div>
              </div>
              <span style={{ fontSize: 10, color: '#64748B', maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>@{author.username}</span>
            </Link>
          );
        })}

        {stories.length === 0 && !loading && (
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', flexShrink: 0 }}>
            <span style={{ fontSize: 13, color: '#64748B' }}>No stories — follow people</span>
          </div>
        )}
      </div>

      {/* Create Story Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={closeModal} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} />
          <div style={{ position: 'relative', background: '#0F172A', borderRadius: 20, width: '100%', maxWidth: 400, border: '1px solid #1E293B', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#F8FAFC' }}>Create Story</h3>
              <button onClick={closeModal} style={{ background: '#1E293B', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 18, width: 32, height: 32, borderRadius: 8 }}><FiX size={18} /></button>
            </div>

            <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: '#1E293B', padding: 4, borderRadius: 10 }}>
              <button onClick={function () { setMode('text'); }} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, background: mode === 'text' ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)' : 'transparent', color: mode === 'text' ? 'white' : '#94A3B8' }}>
                <FiType size={14} style={{ display: 'inline', marginRight: 4 }} /> Text
              </button>
              <button onClick={function () { setMode('media'); }} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, background: mode === 'media' ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)' : 'transparent', color: mode === 'media' ? 'white' : '#94A3B8' }}>
                <FiImage size={14} style={{ display: 'inline', marginRight: 4 }} /> Media
              </button>
            </div>

            {mode === 'text' ? (
              <div>
                <textarea
                  value={textStory}
                  onChange={function (e) { setTextStory(e.target.value); }}
                  placeholder="Type your story..."
                  maxLength={200}
                  rows={4}
                  style={{ width: '100%', padding: 14, borderRadius: 12, border: '1px solid #334155', background: bgColor, color: textColor, fontSize: 16, resize: 'none', outline: 'none', boxSizing: 'border-box', fontWeight: 600, textAlign: 'center', minHeight: 150 }}
                />
                <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {colors.map(function (c) {
                    return (
                      <button key={c} onClick={function () { setBgColor(c); }} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: bgColor === c ? '3px solid white' : '3px solid transparent', cursor: 'pointer' }} />
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8, justifyContent: 'center' }}>
                  <button onClick={function () { setTextColor('#FFFFFF'); }} style={{ width: 28, height: 28, borderRadius: '50%', background: '#fff', border: textColor === '#FFFFFF' ? '3px solid #3B82F6' : '3px solid #334155', cursor: 'pointer' }} />
                  <button onClick={function () { setTextColor('#000000'); }} style={{ width: 28, height: 28, borderRadius: '50%', background: '#000', border: textColor === '#000000' ? '3px solid #3B82F6' : '3px solid #334155', cursor: 'pointer' }} />
                </div>
                <button onClick={handleTextStory} disabled={uploading || !textStory.trim()} style={{ width: '100%', marginTop: 16, padding: 12, borderRadius: 12, border: 'none', background: textStory.trim() ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)' : '#1E293B', color: 'white', fontWeight: 600, fontSize: 15, cursor: textStory.trim() ? 'pointer' : 'default', opacity: uploading ? 0.6 : 1 }}>
                  {uploading ? 'Posting...' : 'Post Text Story'}
                </button>
              </div>
            ) : (
              <div onClick={function () { fileRef.current && fileRef.current.click(); }} style={{ border: '2px dashed #334155', borderRadius: 16, padding: 40, textAlign: 'center', cursor: 'pointer', color: '#94A3B8' }}>
                <FiImage size={40} style={{ marginBottom: 12 }} />
                <p style={{ margin: 0, fontSize: 14 }}>Click to upload photo/video</p>
                <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleMediaUpload} style={{ display: 'none' }} />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}