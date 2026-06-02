// src/components/feed/CreatePost.jsx

import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { FiImage, FiSmile, FiMapPin } from 'react-icons/fi';
import API from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import useAuthStore from '../../store/useAuthStore';
import useFeedStore from '../../store/useFeedStore';
import Avatar from '../common/Avatar';
import Modal from '../common/Modal';

export default function CreatePost() {
  var user = useAuthStore(function (s) { return s.user; });
  var addPost = useFeedStore(function (s) { return s.addPost; });

  var contentState = useState('');
  var content = contentState[0];
  var setContent = contentState[1];

  var audienceState = useState('public');
  var audience = audienceState[0];
  var setAudience = audienceState[1];

  var filesState = useState([]);
  var files = filesState[0];
  var setFiles = filesState[1];

  var modalState = useState(false);
  var showModal = modalState[0];
  var setShowModal = modalState[1];

  var loadingState = useState(false);
  var loading = loadingState[0];
  var setLoading = loadingState[1];

  var fileRef = useRef(null);

  var handleSubmit = async function () {
    if (!content.trim() && !files.length) return;
    setLoading(true);
    var formData = new FormData();
    if (content.trim()) formData.append('content', content);
    formData.append('audience', audience);
    files.forEach(function (f) { formData.append('media', f); });
    try {
      var res = await API.post(ENDPOINTS.POSTS.CREATE, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      addPost(res.data.data);
      setContent('');
      setFiles([]);
      setShowModal(false);
      toast.success('Posted!');
    } catch (err) {
      toast.error('Failed to create post');
    }
    setLoading(false);
  };

  var handleFileChange = function (e) {
    var selected = Array.from(e.target.files);
    if (selected.length > 10) return toast.error('Max 10 files');
    setFiles(selected);
  };

  return (
    <>
      <div style={{ background: '#0F172A', borderRadius: 16, padding: 16, border: '1px solid #1E293B' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <Avatar src={user && user.avatar} alt={user && user.firstName} size="md" />
          <button
            onClick={function () { setShowModal(true); }}
            style={{ flex: 1, background: '#1E293B', border: '1px solid #334155', borderRadius: 12, padding: '10px 16px', color: '#64748B', textAlign: 'left', cursor: 'pointer', fontSize: 14 }}
          >
            What's on your mind?
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, borderTop: '1px solid #1E293B', paddingTop: 12 }}>
          <button onClick={function () { setShowModal(true); setTimeout(function () { fileRef.current && fileRef.current.click(); }, 100); }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 0', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 13, borderRadius: 8 }}>
            <FiImage size={18} color="#10B981" /> Photo
          </button>
          <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 0', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 13, borderRadius: 8 }}>
            <FiSmile size={18} color="#F59E0B" /> Feeling
          </button>
          <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 0', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 13, borderRadius: 8 }}>
            <FiMapPin size={18} color="#EF4444" /> Location
          </button>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={function () { setShowModal(false); }} title="Create Post" size="lg">
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <Avatar src={user && user.avatar} alt={user && user.firstName} size="md" />
          <div>
            <div style={{ fontWeight: 600, color: '#F8FAFC' }}>{user && user.firstName} {user && user.lastName}</div>
            <select value={audience} onChange={function (e) { setAudience(e.target.value); }} style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8, padding: '4px 8px', color: '#94A3B8', fontSize: 12, marginTop: 4 }}>
              <option value="public">🌍 Public</option>
              <option value="friends">👥 Friends</option>
              <option value="only_me">🔒 Only Me</option>
            </select>
          </div>
        </div>
        <textarea value={content} onChange={function (e) { setContent(e.target.value); }} placeholder="What's on your mind?" rows={5} maxLength={5000} style={{ width: '100%', background: 'transparent', border: 'none', color: '#F8FAFC', fontSize: 16, resize: 'none', outline: 'none' }} autoFocus />
        {files.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {files.map(function (f, i) {
              return (
                <div key={i} style={{ width: 80, height: 80, borderRadius: 8, background: '#1E293B', overflow: 'hidden' }}>
                  {f.type.startsWith('image') ? <img src={URL.createObjectURL(f)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📹</div>}
                </div>
              );
            })}
          </div>
        )}
        <input ref={fileRef} type="file" multiple accept="image/*,video/*" style={{ display: 'none' }} onChange={handleFileChange} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, borderTop: '1px solid #1E293B', paddingTop: 16 }}>
          <button onClick={function () { fileRef.current && fileRef.current.click(); }} style={{ background: '#1E293B', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 8, borderRadius: 8 }}><FiImage size={18} /></button>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748B' }}>{content.length}/5000</span>
            <button onClick={handleSubmit} disabled={loading || (!content.trim() && !files.length)} style={{ padding: '8px 20px', borderRadius: 10, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 14, opacity: (!content.trim() && !files.length) || loading ? 0.5 : 1 }}>{loading ? 'Posting...' : 'Post'}</button>
          </div>
        </div>
      </Modal>
    </>
  );
}