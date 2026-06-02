import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import Avatar from '../components/common/Avatar';
import FooterLinks from '../components/common/FooterLinks';

export default function RightSidebar() {
  var suggestionsState = useState([]);
  var suggestions = suggestionsState[0];
  var setSuggestions = suggestionsState[1];

  var trendingState = useState([]);
  var trending = trendingState[0];
  var setTrending = trendingState[1];

  useEffect(function () {
    API.get(ENDPOINTS.USERS.SUGGESTIONS)
      .then(function (res) { setSuggestions((res.data.data || []).slice(0, 5)); })
      .catch(function () {});
    API.get(ENDPOINTS.SEARCH.TRENDING, { params: { limit: 5 } })
      .then(function (res) { setTrending(res.data.data || []); })
      .catch(function () {});
  }, []);

  return (
    <aside style={{ width: 280, flexShrink: 0, padding: '16px 12px', display: 'none' }} className="right-sidebar">
      <style>{'@media (min-width: 1024px) { .right-sidebar { display: block !important; } }'}</style>

      <div style={{ background: '#0F172A', borderRadius: 16, padding: 16, border: '1px solid #1E293B', marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#94A3B8', marginBottom: 12 }}>Who to Follow</h3>
        {suggestions.map(function (u) {
          return (
            <Link key={u._id} to={'/' + u.username} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', textDecoration: 'none', borderBottom: '1px solid #1E293B' }}>
              <Avatar src={u.avatar} alt={u.firstName} size="sm" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.firstName} {u.lastName}</div>
                <div style={{ fontSize: 11, color: '#64748B' }}>@{u.username}</div>
              </div>
            </Link>
          );
        })}
      </div>

      <div style={{ background: '#0F172A', borderRadius: 16, padding: 16, border: '1px solid #1E293B', marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#94A3B8', marginBottom: 12 }}>Trending</h3>
        {trending.map(function (post, i) {
          return (
            <Link key={post._id || i} to={'/post/' + post._id} style={{ display: 'block', padding: '8px 0', textDecoration: 'none', borderBottom: '1px solid #1E293B' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#3B82F6', flexShrink: 0 }}>#{i + 1}</span>
                <p style={{ fontSize: 12, color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>{post.content ? post.content.slice(0, 55) + '...' : 'Trending post'}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div style={{ padding: '4px 8px' }}>
        <FooterLinks />
        <p style={{ textAlign: 'center', color: '#475569', fontSize: 11, marginTop: 8 }}>© {new Date().getFullYear()} Vibe by HDM</p>
      </div>
    </aside>
  );
}