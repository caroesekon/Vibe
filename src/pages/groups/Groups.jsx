// src/pages/groups/Groups.jsx

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiSearch } from 'react-icons/fi';
import API from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import GroupCard from '../../components/groups/GroupCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function Groups() {
  var t = useTranslation().t;

  var groupsState = useState([]);
  var groups = groupsState[0];
  var setGroups = groupsState[1];

  var myGroupsState = useState([]);
  var myGroups = myGroupsState[0];
  var setMyGroups = myGroupsState[1];

  var loadState = useState(true);
  var loading = loadState[0];
  var setLoading = loadState[1];

  var tabState = useState('discover');
  var tab = tabState[0];
  var setTab = tabState[1];

  var searchState = useState('');
  var search = searchState[0];
  var setSearch = searchState[1];

  var showCreateState = useState(false);
  var showCreate = showCreateState[0];
  var setShowCreate = showCreateState[1];

  var newGroupState = useState({ name: '', description: '', privacy: 'public', category: '' });
  var newGroup = newGroupState[0];
  var setNewGroup = newGroupState[1];

  var createLoadState = useState(false);
  var createLoading = createLoadState[0];
  var setCreateLoading = createLoadState[1];

  useEffect(function () {
    Promise.all([
      API.get(ENDPOINTS.GROUPS.LIST),
      API.get(ENDPOINTS.GROUPS.MY).catch(function () { return { data: { data: [] } }; }),
    ]).then(function (results) {
      setGroups(results[0].data.data || []);
      setMyGroups(results[1].data.data || []);
    }).catch(function () {}).finally(function () { setLoading(false); });
  }, []);

  var handleCreate = async function () {
    if (!newGroup.name.trim()) return toast.error('Group name required');
    setCreateLoading(true);
    try {
      var res = await API.post(ENDPOINTS.GROUPS.CREATE, newGroup);
      setMyGroups([res.data.data].concat(myGroups));
      setShowCreate(false);
      setNewGroup({ name: '', description: '', privacy: 'public', category: '' });
      toast.success('Group created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
    setCreateLoading(false);
  };

  if (loading) return <Loader className="py-20" />;

  var displayGroups = tab === 'my' ? myGroups : groups;

  return (
    <div style={{ paddingBottom: 64 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC' }}>{t('groups.title')}</h2>
        <button onClick={function () { setShowCreate(true); }} style={{ width: 40, height: 40, borderRadius: 12, border: 'none', background: '#1E293B', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FiPlus size={20} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, background: '#0F172A', borderRadius: 12, padding: 4, border: '1px solid #1E293B' }}>
        <button onClick={function () { setTab('discover'); }} style={{ flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', background: tab === 'discover' ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)' : 'transparent', color: tab === 'discover' ? 'white' : '#94A3B8' }}>🌍 Discover</button>
        <button onClick={function () { setTab('my'); }} style={{ flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', background: tab === 'my' ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)' : 'transparent', color: tab === 'my' ? 'white' : '#94A3B8' }}>👥 My Groups</button>
      </div>

      {displayGroups.length === 0 ? (
        <EmptyState icon="👥" title={tab === 'my' ? 'No groups yet' : 'No groups found'} description={tab === 'my' ? 'Create or join a group' : 'Be the first to create one'} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {displayGroups.map(function (group) { return <GroupCard key={group._id} group={group} />; })}
        </div>
      )}

      {/* Create Group Modal */}
      <Modal isOpen={showCreate} onClose={function () { setShowCreate(false); }} title="Create Group" size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', color: '#94A3B8', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Group Name *</label>
            <input type="text" value={newGroup.name} onChange={function (e) { setNewGroup(Object.assign({}, newGroup, { name: e.target.value })); }} placeholder="Enter group name" style={{ width: '100%', padding: '10px 14px', background: '#1E293B', border: '1px solid #334155', borderRadius: 10, color: '#F8FAFC', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', color: '#94A3B8', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Description</label>
            <textarea value={newGroup.description} onChange={function (e) { setNewGroup(Object.assign({}, newGroup, { description: e.target.value })); }} placeholder="What's this group about?" rows={3} style={{ width: '100%', padding: '10px 14px', background: '#1E293B', border: '1px solid #334155', borderRadius: 10, color: '#F8FAFC', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
          </div>
          <div>
            <label style={{ display: 'block', color: '#94A3B8', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Privacy</label>
            <select value={newGroup.privacy} onChange={function (e) { setNewGroup(Object.assign({}, newGroup, { privacy: e.target.value })); }} style={{ width: '100%', padding: '10px 14px', background: '#1E293B', border: '1px solid #334155', borderRadius: 10, color: '#F8FAFC', fontSize: 14, outline: 'none', cursor: 'pointer' }}>
              <option value="public">🌍 Public — Anyone can join</option>
              <option value="private">🔒 Private — Request to join</option>
            </select>
          </div>
          <Button onClick={handleCreate} loading={createLoading} size="lg">Create Group</Button>
        </div>
      </Modal>
    </div>
  );
}