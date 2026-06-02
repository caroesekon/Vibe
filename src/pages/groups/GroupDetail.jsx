// src/pages/groups/GroupDetail.jsx

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUsers, FiLock, FiGlobe, FiMoreHorizontal, FiSettings } from 'react-icons/fi';
import API from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import useAuthStore from '../../store/useAuthStore';
import PostCard from '../../components/feed/PostCard';
import CreatePost from '../../components/feed/CreatePost';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { formatNumber } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function GroupDetail() {
  var id = useParams().id;
  var navigate = useNavigate();
  var user = useAuthStore(function (s) { return s.user; });

  var groupState = useState(null);
  var group = groupState[0];
  var setGroup = groupState[1];

  var postsState = useState([]);
  var posts = postsState[0];
  var setPosts = postsState[1];

  var loadState = useState(true);
  var loading = loadState[0];
  var setLoading = loadState[1];

  var joinLoadState = useState(false);
  var joinLoading = joinLoadState[0];
  var setJoinLoading = joinLoadState[1];

  var showSettingsState = useState(false);
  var showSettings = showSettingsState[0];
  var setShowSettings = showSettingsState[1];

  var editFormState = useState({ name: '', description: '', privacy: '' });
  var editForm = editFormState[0];
  var setEditForm = editFormState[1];

  var isMember = group && user && group.members && group.members.some(function (m) { return m === user._id || (m._id && m._id === user._id) || m.toString() === user._id.toString(); });
  var isAdmin = group && user && (group.creator && (group.creator._id === user._id || group.creator === user._id || group.creator.toString() === user._id.toString())) || (group.admins && group.admins.some(function (a) { return a === user._id || (a._id && a._id === user._id) || a.toString() === user._id.toString(); }));

  useEffect(function () { fetchGroup(); }, [id]);

  var fetchGroup = async function () {
    setLoading(true);
    try {
      var res = await API.get(ENDPOINTS.GROUPS.GET(id));
      setGroup(res.data.data);
      setEditForm({ name: res.data.data.name, description: res.data.data.description || '', privacy: res.data.data.privacy });
      fetchPosts();
    } catch (err) { toast.error('Group not found'); }
    setLoading(false);
  };

  var fetchPosts = async function () {
    try {
      var res = await API.get(ENDPOINTS.GROUPS.POSTS(id));
      setPosts(res.data.data || []);
    } catch (err) {}
  };

  var handleJoin = async function () {
    setJoinLoading(true);
    try {
      if (isMember) { await API.post(ENDPOINTS.GROUPS.LEAVE(id)); toast.success('Left group'); }
      else { await API.post(ENDPOINTS.GROUPS.JOIN(id)); toast.success(group.privacy === 'private' ? 'Request sent' : 'Joined!'); }
      fetchGroup();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setJoinLoading(false);
  };

  var handleSaveSettings = async function () {
    try {
      await API.put(ENDPOINTS.GROUPS.GET(id).replace('/groups/', '/groups/'), editForm);
      toast.success('Group updated');
      setShowSettings(false);
      fetchGroup();
    } catch (err) { toast.error('Failed to update'); }
  };

  if (loading) return <Loader className="py-20" />;
  if (!group) return <EmptyState icon="👥" title="Group not found" />;

  return (
    <div style={{ paddingBottom: 64 }}>
      <Link to="/groups" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748B', textDecoration: 'none', marginBottom: 16, fontSize: 14 }}>
        <FiArrowLeft size={18} /> Back to Groups
      </Link>

      {/* Group Header */}
      <div style={{ background: '#0F172A', borderRadius: 16, border: '1px solid #1E293B', overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ height: 120, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }} />
        <div style={{ padding: '0 20px 20px', marginTop: -40 }}>
          <div style={{ width: 72, height: 72, borderRadius: 18, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800, color: 'white', border: '4px solid #0F172A', marginBottom: 12 }}>
            {group.name ? group.name[0].toUpperCase() : 'G'}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#F8FAFC', margin: '0 0 4px' }}>{group.name}</h1>
              <p style={{ color: '#94A3B8', fontSize: 13, margin: '0 0 8px', lineHeight: 1.5 }}>{group.description}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#64748B' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiUsers size={14} /> {formatNumber(group.membersCount)} members</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{group.privacy === 'public' ? <FiGlobe size={14} /> : <FiLock size={14} />} {group.privacy === 'public' ? 'Public' : 'Private'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {isAdmin && (
                <button onClick={function () { setShowSettings(true); }} style={{ width: 40, height: 40, borderRadius: 12, border: '1px solid #334155', background: '#1E293B', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiSettings size={18} />
                </button>
              )}
              <Button onClick={handleJoin} loading={joinLoading} variant={isMember ? 'secondary' : 'primary'}>
                {isMember ? 'Leave' : group.privacy === 'private' ? 'Request to Join' : 'Join Group'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Group Feed */}
      {isMember && (
        <div style={{ marginBottom: 16 }}>
          <CreatePost />
        </div>
      )}

      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC', marginBottom: 12 }}>Posts</h3>
      {posts.length === 0 ? (
        <EmptyState icon="📰" title="No posts yet" description="Be the first to post in this group" />
      ) : (
        posts.map(function (post) {
          return <div key={post._id} style={{ marginBottom: 12 }}><PostCard post={post} /></div>;
        })
      )}

      {/* Settings Modal */}
      <Modal isOpen={showSettings} onClose={function () { setShowSettings(false); }} title="Group Settings" size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', color: '#94A3B8', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Group Name</label>
            <input type="text" value={editForm.name} onChange={function (e) { setEditForm(Object.assign({}, editForm, { name: e.target.value })); }} style={{ width: '100%', padding: '10px 14px', background: '#1E293B', border: '1px solid #334155', borderRadius: 10, color: '#F8FAFC', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', color: '#94A3B8', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Description</label>
            <textarea value={editForm.description} onChange={function (e) { setEditForm(Object.assign({}, editForm, { description: e.target.value })); }} rows={3} style={{ width: '100%', padding: '10px 14px', background: '#1E293B', border: '1px solid #334155', borderRadius: 10, color: '#F8FAFC', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
          </div>
          <div>
            <label style={{ display: 'block', color: '#94A3B8', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Privacy</label>
            <select value={editForm.privacy} onChange={function (e) { setEditForm(Object.assign({}, editForm, { privacy: e.target.value })); }} style={{ width: '100%', padding: '10px 14px', background: '#1E293B', border: '1px solid #334155', borderRadius: 10, color: '#F8FAFC', fontSize: 14, outline: 'none', cursor: 'pointer' }}>
              <option value="public">🌍 Public</option>
              <option value="private">🔒 Private</option>
            </select>
          </div>
          <Button onClick={handleSaveSettings} size="lg">Save Changes</Button>
          <Button variant="danger" onClick={function () { toast.error('Delete from group settings'); }}>Delete Group</Button>
        </div>
      </Modal>
    </div>
  );
}