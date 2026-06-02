// src/pages/explore/Explore.jsx

import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiSearch, FiHash, FiTrendingUp } from 'react-icons/fi';
import API from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import useDebounce from '../../hooks/useDebounce';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Avatar from '../../components/common/Avatar';
import VerifiedBadge from '../../components/common/VerifiedBadge';
import { formatNumber, timeAgo } from '../../utils/formatters';

var TABS = [
  { key: 'users', label: 'People', icon: '👤' },
  { key: 'posts', label: 'Posts', icon: '📰' },
  { key: 'groups', label: 'Groups', icon: '👥' },
  { key: 'marketplace', label: 'Market', icon: '🏪' },
];

export default function Explore() {
  var searchParams = useSearchParams();
  var setSearchParams = searchParams[1];
  var queryParam = searchParams[0].get('q') || '';

  var queryState = useState(queryParam);
  var query = queryState[0];
  var setQuery = queryState[1];

  var activeState = useState('users');
  var activeTab = activeState[0];
  var setActiveTab = activeState[1];

  var resultsState = useState({ users: { data: [], total: 0 }, posts: { data: [], total: 0 }, groups: { data: [], total: 0 }, marketplace: { data: [], total: 0 } });
  var results = resultsState[0];
  var setResults = resultsState[1];

  var trendingState = useState([]);
  var trending = trendingState[0];
  var setTrending = trendingState[1];

  var hashtagsState = useState([]);
  var hashtags = hashtagsState[0];
  var setHashtags = hashtagsState[1];

  var loadState = useState(false);
  var loading = loadState[0];
  var setLoading = loadState[1];

  var debouncedQuery = useDebounce(query, 400);

  useEffect(function () {
    if (debouncedQuery) {
      setSearchParams({ q: debouncedQuery });
      setLoading(true);
      API.get(ENDPOINTS.SEARCH.ALL, { params: { q: debouncedQuery } })
        .then(function (res) { setResults(res.data.data || {}); })
        .catch(function () {})
        .finally(function () { setLoading(false); });
    } else {
      setResults({ users: { data: [], total: 0 }, posts: { data: [], total: 0 }, groups: { data: [], total: 0 }, marketplace: { data: [], total: 0 } });
      fetchTrending();
      fetchHashtags();
    }
  }, [debouncedQuery]);

  useEffect(function () {
    fetchTrending();
    fetchHashtags();
  }, []);

  var fetchTrending = async function () {
    try {
      var res = await API.get(ENDPOINTS.SEARCH.TRENDING);
      setTrending(res.data.data || []);
    } catch (err) {}
  };

  var fetchHashtags = async function () {
    try {
      var res = await API.get('/search/hashtags');
      setHashtags(res.data.data || []);
    } catch (err) {}
  };

  var items = results[activeTab] ? results[activeTab].data || [] : [];
  var isSearching = !!debouncedQuery;

  return (
    <div style={{ paddingBottom: 64 }}>
      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <FiSearch style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} size={20} />
        <input
          type="text"
          value={query}
          onChange={function (e) { setQuery(e.target.value); }}
          placeholder="Search users, posts, groups, marketplace..."
          style={{ width: '100%', padding: '16px 16px 16px 48px', background: '#0F172A', border: '1px solid #1E293B', borderRadius: 16, color: '#F8FAFC', fontSize: 16, outline: 'none', boxSizing: 'border-box' }}
          autoFocus
        />
      </div>

      {/* Tabs */}
      {isSearching && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {TABS.map(function (tab) {
            var count = results[tab.key] ? results[tab.key].total || 0 : 0;
            return (
              <button
                key={tab.key}
                onClick={function () { setActiveTab(tab.key); }}
                style={{
                  flex: 1, padding: '10px 8px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                  border: 'none', cursor: 'pointer',
                  background: activeTab === tab.key ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)' : '#1E293B',
                  color: activeTab === tab.key ? 'white' : '#94A3B8',
                }}
              >
                {tab.icon} {tab.label} {count > 0 && '(' + count + ')'}
              </button>
            );
          })}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <Loader className="py-20" />
      ) : isSearching ? (
        items.length === 0 ? (
          <EmptyState icon="🔍" title="No results found" description={'Try a different search term for "' + debouncedQuery + '"'} />
        ) : (
          <div>
            {/* People */}
            {activeTab === 'users' && items.map(function (u) {
              return (
                <Link key={u._id} to={'/' + u.username} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, background: '#0F172A', borderRadius: 16, border: '1px solid #1E293B', marginBottom: 8, textDecoration: 'none' }}>
                  <Avatar src={u.avatar} alt={u.firstName} size="lg" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 700, color: '#F8FAFC', fontSize: 15 }}>{u.firstName} {u.lastName}</span>
                      {u.isVerified && <VerifiedBadge size="xs" />}
                    </div>
                    <div style={{ fontSize: 13, color: '#64748B' }}>@{u.username}</div>
                    {u.bio && <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 4, lineHeight: 1.4 }}>{u.bio.slice(0, 100)}</div>}
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{formatNumber(u.followersCount)} followers</div>
                  </div>
                </Link>
              );
            })}

            {/* Posts */}
            {activeTab === 'posts' && items.map(function (p) {
              return (
                <Link key={p._id} to={'/post/' + p._id} style={{ display: 'block', padding: 16, background: '#0F172A', borderRadius: 16, border: '1px solid #1E293B', marginBottom: 8, textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <Avatar src={p.author && p.author.avatar} alt="" size="xs" />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: '#F8FAFC' }}>{p.author && p.author.firstName} {p.author && p.author.lastName}</span>
                        {p.author && p.author.isVerified && <VerifiedBadge size="xs" />}
                      </div>
                      <span style={{ fontSize: 11, color: '#64748B' }}>@{p.author && p.author.username} · {timeAgo(p.createdAt)}</span>
                    </div>
                  </div>
                  <p style={{ color: '#CBD5E1', fontSize: 14, lineHeight: 1.5, margin: '0 0 10px' }}>{p.content && p.content.slice(0, 250)}</p>
                  {p.media && p.media.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                      {p.media.slice(0, 4).map(function (m, i) {
                        return (
                          <div key={i} style={{ flex: 1, height: 80, borderRadius: 10, overflow: 'hidden', background: '#1E293B' }}>
                            <img src={m.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748B' }}>
                    <span>❤️ {formatNumber(p.likesCount || p.loveCount || 0)}</span>
                    <span>💬 {formatNumber(p.commentsCount || 0)}</span>
                    <span>🔄 {formatNumber(p.sharesCount || 0)}</span>
                    <span>👁️ {formatNumber(p.viewsCount || 0)}</span>
                  </div>
                </Link>
              );
            })}

            {/* Groups */}
            {activeTab === 'groups' && items.map(function (g) {
              return (
                <Link key={g._id} to={'/groups/' + g._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, background: '#0F172A', borderRadius: 16, border: '1px solid #1E293B', marginBottom: 8, textDecoration: 'none' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24, fontWeight: 700, flexShrink: 0 }}>
                    {g.name ? g.name[0].toUpperCase() : 'G'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: '#F8FAFC', fontSize: 15 }}>{g.name}</div>
                    {g.description && <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2, lineHeight: 1.3 }}>{g.description.slice(0, 80)}</div>}
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                      {formatNumber(g.membersCount)} members · {g.privacy === 'public' ? '🌍 Public' : '🔒 Private'}
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Marketplace */}
            {activeTab === 'marketplace' && items.map(function (m) {
              return (
                <Link key={m._id} to={'/marketplace/' + m._id} style={{ display: 'flex', gap: 12, padding: 14, background: '#0F172A', borderRadius: 16, border: '1px solid #1E293B', marginBottom: 8, textDecoration: 'none' }}>
                  <div style={{ width: 80, height: 80, borderRadius: 12, overflow: 'hidden', background: '#1E293B', flexShrink: 0 }}>
                    {m.images && m.images[0] ? (
                      <img src={m.images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🛍️</div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: '#F8FAFC', fontSize: 14 }}>{m.title}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: 4 }}>
                      {m.isFree ? 'FREE' : (m.currency || 'KSh') + ' ' + (m.price ? m.price.toLocaleString() : '0')}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>{m.condition} · {m.location && m.location.name}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )
      ) : (
        /* Browse Mode — Trending + Hashtags */
        <div>
          {/* Trending Posts */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiTrendingUp style={{ color: '#3B82F6' }} /> Trending Now
            </h3>
            {trending.length === 0 ? (
              <EmptyState icon="🔥" title="Nothing trending" description="Check back later" />
            ) : (
              <div>
                {trending.slice(0, 10).map(function (post, i) {
                  return (
                    <Link key={post._id || i} to={'/post/' + post._id} style={{ display: 'block', padding: 14, background: '#0F172A', borderRadius: 16, border: '1px solid #1E293B', marginBottom: 8, textDecoration: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: '#3B82F6' }}>#{i + 1}</span>
                        <Avatar src={post.author && post.author.avatar} alt="" size="xs" />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontWeight: 600, fontSize: 13, color: '#F8FAFC' }}>{post.author && post.author.firstName} {post.author && post.author.lastName}</span>
                          {post.author && post.author.isVerified && <VerifiedBadge size="xs" />}
                        </div>
                      </div>
                      <p style={{ color: '#CBD5E1', fontSize: 14, lineHeight: 1.5, margin: '0 0 8px' }}>{post.content && post.content.slice(0, 200)}</p>
                      {post.media && post.media[0] && (
                        <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 8, maxHeight: 200 }}>
                          <img src={post.media[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748B' }}>
                        <span>❤️ {formatNumber(post.likesCount || post.loveCount || 0)}</span>
                        <span>💬 {formatNumber(post.commentsCount || 0)}</span>
                        <span>🔄 {formatNumber(post.sharesCount || 0)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Trending Hashtags */}
          {hashtags.length > 0 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiHash style={{ color: '#8B5CF6' }} /> Trending Hashtags
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {hashtags.map(function (tag) {
                  return (
                    <Link
                      key={tag._id}
                      to={'/explore?q=' + encodeURIComponent(tag.name)}
                      style={{ padding: '8px 16px', background: '#1E293B', borderRadius: 20, textDecoration: 'none', color: '#94A3B8', fontSize: 13, fontWeight: 500, border: '1px solid #334155' }}
                    >
                      #{tag.name} <span style={{ color: '#64748B' }}>{tag.postsCount}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}