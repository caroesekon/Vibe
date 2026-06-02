import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiSend, FiCopy } from 'react-icons/fi';
import API from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import Modal from '../common/Modal';

export default function ShareModal({ isOpen, onClose, post }) {
  var captionState = useState('');
  var caption = captionState[0];
  var setCaption = captionState[1];

  var loadState = useState(false);
  var loading = loadState[0];
  var setLoading = loadState[1];

  var handleShare = async function () {
    setLoading(true);
    try { await API.post(ENDPOINTS.POSTS.SHARE(post._id), { caption: caption.trim() }); toast.success('Shared!'); onClose(); }
    catch (err) { toast.error('Failed'); }
    setLoading(false);
  };

  var handleCopy = function () {
    navigator.clipboard.writeText(window.location.origin + '/post/' + post._id);
    toast.success('Link copied');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share" size="sm">
      <button onClick={handleShare} disabled={loading} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#F8FAFC', fontSize: 14, opacity: loading ? 0.5 : 1 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiSend size={18} color="white" /></div>
        <div style={{ textAlign: 'left' }}><div style={{ fontWeight: 500 }}>Share to Feed</div><div style={{ fontSize: 12, color: '#64748B' }}>Share on your timeline</div></div>
      </button>
      <button onClick={handleCopy} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#F8FAFC', fontSize: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiCopy size={18} /></div>
        <div style={{ textAlign: 'left' }}><div style={{ fontWeight: 500 }}>Copy Link</div><div style={{ fontSize: 12, color: '#64748B' }}>Copy to clipboard</div></div>
      </button>
      <input type="text" value={caption} onChange={function (e) { setCaption(e.target.value); }} placeholder="Add a caption..." style={{ width: '100%', marginTop: 12, padding: '10px 14px', background: '#1E293B', border: '1px solid #334155', borderRadius: 10, color: '#F8FAFC', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
    </Modal>
  );
}