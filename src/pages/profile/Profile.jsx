// src/pages/profile/Profile.jsx

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiMapPin, FiLink, FiCalendar, FiMoreHorizontal, FiGrid, FiFilm, FiBookmark, FiShoppingBag, FiUsers, FiMessageCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import useAuthStore from '../../store/useAuthStore';
import Avatar from '../../components/common/Avatar';
import VerifiedBadge from '../../components/common/VerifiedBadge';
import PostCard from '../../components/feed/PostCard';
import ListingCard from '../../components/marketplace/ListingCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { formatNumber, formatDate, timeAgo } from '../../utils/formatters';

var TABS = [
  { key: 'posts', label: 'Posts', icon: FiGrid },
  { key: 'reels', label: 'Reels', icon: FiFilm },
  { key: 'saved', label: 'Saved', icon: FiBookmark },
  { key: 'listings', label: 'Listings', icon: FiShoppingBag },
];

export default function Profile() {
  var username = useParams().username;
  var navigate = useNavigate();
  var currentUser = useAuthStore(function (s) { return s.user; });
  var setUser = useAuthStore(function (s) { return s.setUser; });

  var profileState = useState(null);
  var profile = profileState[0];
  var setProfile = profileState[1];

  var postsState = useState([]);
  var posts = postsState[0];
  var setPosts = postsState[1];

  var reelsState = useState([]);
  var reels = reelsState[0];
  var setReels = reelsState[1];

  var savedPostsState = useState([]);
  var savedPosts = savedPostsState[0];
  var setSavedPosts = savedPostsState[1];

  var listingsState = useState([]);
  var listings = listingsState[0];
  var setListings = listingsState[1];

  var activeState = useState('posts');
  var activeTab = activeState[0];
  var setActiveTab = activeState[1];

  var loadState = useState(true);
  var loading = loadState[0];
  var setLoading = loadState[1];

  var followLoadState = useState(false);
  var followLoading = followLoadState[0];
  var setFollowLoading = followLoadState[1];

  var showMenuState = useState(false);
  var showMenu = showMenuState[0];
  var setShowMenu = showMenuState[1];

  var showFollowersState = useState(false);
  var showFollowers = showFollowersState[0];
  var setShowFollowers = showFollowersState[1];

  var showFollowingState = useState(false);
  var showFollowing = showFollowingState[0];
  var setShowFollowing = showFollowingState[1];

  var showFriendsState = useState(false);
  var showFriends = showFriendsState[0];
  var setShowFriends = showFriendsState[1];

  var followersState = useState([]);
  var followers = followersState[0];
  var setFollowers = followersState[1];

  var followingState = useState([]);
  var following = followingState[0];
  var setFollowing = followingState[1];

  var friendsState = useState([]);
  var friends = friendsState[0];
  var setFriends = friendsState[1];

  var isOwner = currentUser && profile && currentUser._id === profile._id;
  var isFollowing = profile && profile.isFollowing;
  var isFriend = profile && profile.isFriend;

  useEffect(function () {
    if (!username) return;
    fetchProfile();
  }, [username]);

  var fetchProfile = async function () {
    setLoading(true);
    try {
      var res = await API.get(ENDPOINTS.USERS.PROFILE(username));
      setProfile(res.data.data);
      if (res.data.data._id) {
        fetchPosts(res.data.data._id);
        fetchReels(res.data.data._id);
        fetchListings(res.data.data._id);
      }
    } catch (err) {
      toast.error('User not found');
    }
    setLoading(false);
  };

  var fetchPosts = async function (userId) {
    try {
      var res = await API.get(ENDPOINTS.POSTS.USER_POSTS(userId));
      setPosts((res.data.data || []).filter(function (p) { return !p.media || !p.media.length || p.media[0].type !== 'video'; }));
    } catch (err) {}
  };

  var fetchReels = async function (userId) {
    try {
      var res = await API.get(ENDPOINTS.POSTS.USER_POSTS(userId));
      setReels((res.data.data || []).filter(function (p) { return p.media && p.media.length && p.media[0].type === 'video'; }));
    } catch (err) {}
  };

  var fetchListings = async function (userId) {
    try {
      var res = await API.get(ENDPOINTS.MARKETPLACE.LIST, { params: { seller: userId } });
      setListings(res.data.data || []);
    } catch (err) {}
  };

  var fetchFollowers = async function () {
    try {
      var res = await API.get(ENDPOINTS.USERS.FOLLOWERS(profile._id));
      setFollowers(res.data.data || []);
      setShowFollowers(true);
    } catch (err) {}
  };

  var fetchFollowing = async function () {
    try {
      var res = await API.get(ENDPOINTS.USERS.FOLLOWING(profile._id));
      setFollowing(res.data.data || []);
      setShowFollowing(true);
    } catch (err) {}
  };

  var fetchFriends = async function () {
    try {
      var res = await API.get(ENDPOINTS.USERS.FRIENDS(profile._id));
      setFriends(res.data.data || []);
      setShowFriends(true);
    } catch (err) {}
  };

  var handleFollow = async function () {
    setFollowLoading(true);
    try {
      var res = await API.post(ENDPOINTS.USERS.FOLLOW(profile._id));
      var updated = Object.assign({}, profile);
      updated.isFollowing = res.data.data.following;
      updated.followersCount += updated.isFollowing ? 1 : -1;
      setProfile(updated);
      if (currentUser) {
        var u = Object.assign({}, currentUser);
        u.followingCount += updated.isFollowing ? 1 : -1;
        setUser(u);
      }
    } catch (err) { toast.error('Failed'); }
    setFollowLoading(false);
  };

  var handleFriendRequest = async function () {
    try {
      if (isFriend) {
        await API.delete(ENDPOINTS.USERS.UNFRIEND(profile._id));
        setProfile(Object.assign({}, profile, { isFriend: false, friendsCount: (profile.friendsCount || 1) - 1 }));
      } else {
        await API.post(ENDPOINTS.USERS.FRIEND_REQUEST(profile._id));
        toast.success('Friend request sent');
      }
      setShowMenu(false);
    } catch (err) { toast.error('Failed'); }
  };

  var handleBlock = async function () {
    try {
      await API.post(ENDPOINTS.USERS.BLOCK(profile._id));
      toast.success('User blocked');
      setShowMenu(false);
    } catch (err) { toast.error('Failed'); }
  };

  var handleMessage = async function () {
    try {
      var res = await API.post(ENDPOINTS.MESSAGES.CREATE_CONVERSATION, { participantId: profile._id });
      navigate('/messages/' + res.data.data._id);
    } catch (err) { toast.error('Cannot start chat'); }
  };

  if (loading) return <Loader className="py-20" />;
  if (!profile) return <EmptyState icon="👤" title="User not found" description="This account doesn't exist or has been removed" />;

  var tabContent = activeTab === 'posts' ? posts : activeTab === 'reels' ? reels : activeTab === 'listings' ? listings : savedPosts;

  return (
    <div style={{ paddingBottom: 64 }}>
      {/* Cover Photo */}
      <div style={{ height: 180, borderRadius: '0 0 16px 16px', background: profile.coverPhoto ? 'none' : 'linear-gradient(135deg, #3B82F6, #8B5CF6)', position: 'relative', overflow: 'hidden', marginBottom: -40 }}>
        {profile.coverPhoto && <img src={profile.coverPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      </div>

      {/* Profile Info */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
          <Avatar src={profile.avatar} alt={profile.firstName} size="xl" style={{ border: '4px solid #020617', marginTop: -40 }} />

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {isOwner ? (
              <Link to="/settings/profile" style={{ padding: '8px 18px', borderRadius: 10, border: '1px solid #334155', background: '#1E293B', color: '#CBD5E1', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                Edit Profile
              </Link>
            ) : (
              <>
                <Button onClick={handleMessage} variant="secondary" size="sm"><FiMessageCircle size={14} style={{ marginRight: 4 }} /> Message</Button>
                <Button onClick={handleFollow} loading={followLoading} variant={isFollowing ? 'secondary' : 'primary'} size="sm">
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
                <div style={{ position: 'relative' }}>
                  <button onClick={function () { setShowMenu(!showMenu); }} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #334155', background: '#1E293B', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiMoreHorizontal size={18} />
                  </button>
                  {showMenu && (
                    <div style={{ position: 'absolute', right: 0, top: 40, background: '#0F172A', border: '1px solid #1E293B', borderRadius: 12, padding: 4, width: 180, zIndex: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                      <button onClick={handleFriendRequest} style={menuStyle}>{isFriend ? '👥 Unfriend' : '🤝 Add Friend'}</button>
                      <button onClick={handleBlock} style={{ ...menuStyle, color: '#EF4444' }}>🚫 Block</button>
                      <button onClick={function () { navigator.clipboard.writeText(window.location.href); toast.success('Profile link copied'); setShowMenu(false); }} style={menuStyle}>📋 Copy Link</button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Name + Badge */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#F8FAFC', margin: 0 }}>{profile.firstName} {profile.lastName}</h1>
            {profile.isVerified && <VerifiedBadge size="md" />}
            {profile.isPremium && <span style={{ fontSize: 10, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: 'white', padding: '2px 8px', borderRadius: 8, fontWeight: 700 }}>PRO</span>}
          </div>
          <p style={{ color: '#64748B', fontSize: 14, margin: '2px 0' }}>@{profile.username}</p>
        </div>

        {/* Bio */}
        {profile.bio && <p style={{ color: '#CBD5E1', fontSize: 14, lineHeight: 1.5, margin: '10px 0', whiteSpace: 'pre-wrap' }}>{profile.bio}</p>}

        {/* Details */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, margin: '8px 0', fontSize: 13, color: '#94A3B8' }}>
          {profile.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiMapPin size={14} /> {profile.location}</span>}
          {profile.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#3B82F6', textDecoration: 'none' }}><FiLink size={14} /> Website</a>}
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiCalendar size={14} /> Joined {formatDate(profile.createdAt)}</span>
          {isOwner && profile.isOnline !== undefined && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: profile.isOnline ? '#10B981' : '#64748B' }}>
              {profile.isOnline ? '🟢 Online' : '⚫ Offline'}
            </span>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 20, margin: '14px 0', fontSize: 14 }}>
          <span><strong style={{ color: '#F8FAFC' }}>{formatNumber(profile.postsCount || 0)}</strong> <span style={{ color: '#94A3B8' }}>posts</span></span>
          <button onClick={fetchFollowers} style={statBtn}><strong style={{ color: '#F8FAFC' }}>{formatNumber(profile.followersCount || 0)}</strong> <span style={{ color: '#94A3B8' }}>followers</span></button>
          <button onClick={fetchFollowing} style={statBtn}><strong style={{ color: '#F8FAFC' }}>{formatNumber(profile.followingCount || 0)}</strong> <span style={{ color: '#94A3B8' }}>following</span></button>
          <button onClick={fetchFriends} style={statBtn}><strong style={{ color: '#F8FAFC' }}>{formatNumber(profile.friendsCount || 0)}</strong> <span style={{ color: '#94A3B8' }}>friends</span></button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1E293B', marginTop: 8 }}>
        {TABS.map(function (tab) {
          var Icon = tab.icon;
          return (
            <button key={tab.key} onClick={function () { setActiveTab(tab.key); }} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 0',
              background: 'none', border: 'none', borderBottom: activeTab === tab.key ? '2px solid #3B82F6' : '2px solid transparent',
              color: activeTab === tab.key ? '#3B82F6' : '#64748B', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            }}>
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div style={{ marginTop: 16 }}>
        {tabContent.length === 0 ? (
          <EmptyState icon={activeTab === 'posts' ? '📰' : activeTab === 'reels' ? '🎬' : activeTab === 'saved' ? '🔖' : '🏪'} title={'No ' + activeTab} description={isOwner ? 'Create your first ' + activeTab.slice(0, -1) : 'Nothing to show'} />
        ) : activeTab === 'listings' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12 }}>
            {listings.map(function (item) { return <ListingCard key={item._id} item={item} />; })}
          </div>
        ) : (
          tabContent.map(function (post) {
            return <div key={post._id} style={{ marginBottom: 12 }}><PostCard post={post} /></div>;
          })
        )}
      </div>

      {/* Followers Modal */}
      <UserListModal isOpen={showFollowers} onClose={function () { setShowFollowers(false); }} title="Followers" users={followers} />
      <UserListModal isOpen={showFollowing} onClose={function () { setShowFollowing(false); }} title="Following" users={following} />
      <UserListModal isOpen={showFriends} onClose={function () { setShowFriends(false); }} title="Friends" users={friends} />
    </div>
  );
}

function UserListModal({ isOpen, onClose, title, users }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title + ' (' + users.length + ')'} size="sm">
      {users.length === 0 ? (
        <p style={{ color: '#64748B', textAlign: 'center', padding: 20 }}>No one yet</p>
      ) : (
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {users.map(function (u) {
            return (
              <Link key={u._id} to={'/' + u.username} onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', textDecoration: 'none', borderBottom: '1px solid #1E293B' }}>
                <Avatar src={u.avatar} alt={u.firstName} size="sm" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: '#F8FAFC' }}>{u.firstName} {u.lastName}</span>
                    {u.isVerified && <VerifiedBadge size="xs" />}
                  </div>
                  <span style={{ fontSize: 12, color: '#64748B' }}>@{u.username}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

var menuStyle = { display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', color: '#CBD5E1', fontSize: 13, cursor: 'pointer', borderRadius: 8 };
var statBtn = { background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 14, display: 'flex', gap: 4 };