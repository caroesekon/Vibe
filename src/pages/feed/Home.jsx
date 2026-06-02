// src/pages/feed/Home.jsx

import { useEffect, useCallback } from 'react';
import StoriesBar from '../../components/stories/StoriesBar';
import CreatePost from '../../components/feed/CreatePost';
import PostCard from '../../components/feed/PostCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import useFeedStore from '../../store/useFeedStore';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import { Link } from 'react-router-dom';

export default function Home() {
  var posts = useFeedStore(function (s) { return s.posts; });
  var fetchFeed = useFeedStore(function (s) { return s.fetchFeed; });
  var hasMore = useFeedStore(function (s) { return s.hasMore; });
  var loading = useFeedStore(function (s) { return s.loading; });
  var reset = useFeedStore(function (s) { return s.reset; });

  var lastRef = useInfiniteScroll(function () { fetchFeed(); }, hasMore, loading);

  useEffect(function () {
    fetchFeed(true);
    return function () { reset(); };
  }, []);

  if (!loading && posts.length === 0) {
    return (
      <div style={{ paddingBottom: 64 }}>
        <StoriesBar />
        <CreatePost />
        <EmptyState
          icon="📰"
          title="Welcome to Vibe"
          description="Your feed is empty. Follow people to see their posts here, or explore trending content."
          action={
            <Link to="/explore" style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: 'white', borderRadius: 12, textDecoration: 'none', fontSize: 14, fontWeight: 600, display: 'inline-block' }}>
              Explore Vibe
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 64 }}>
      <StoriesBar />
      <div style={{ marginBottom: 16 }}><CreatePost /></div>
      {posts.map(function (post, i) {
        return (
          <div key={post._id} ref={i === posts.length - 1 ? lastRef : null} style={{ marginBottom: 16 }}>
            <PostCard post={post} />
          </div>
        );
      })}
      {loading && <Loader className="py-10" />}
      {!hasMore && posts.length > 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
          <p style={{ color: '#64748B', fontSize: 14 }}>You're all caught up!</p>
        </div>
      )}
    </div>
  );
}