// src/pages/marketplace/MarketplaceDetail.jsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiCalendar, FiMessageCircle } from 'react-icons/fi';
import API from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import useAuthStore from '../../store/useAuthStore';
import Avatar from '../../components/common/Avatar';
import VerifiedBadge from '../../components/common/VerifiedBadge';
import Loader from '../../components/common/Loader';
import { formatNumber, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function MarketplaceDetail() {
  var id = useParams().id;
  var user = useAuthStore(function (s) { return s.user; });

  var itemState = useState(null);
  var item = itemState[0];
  var setItem = itemState[1];

  var loadState = useState(true);
  var loading = loadState[0];
  var setLoading = loadState[1];

  var imgState = useState(0);
  var activeImg = imgState[0];
  var setActiveImg = imgState[1];

  useEffect(function () {
    API.get(ENDPOINTS.MARKETPLACE.GET(id))
      .then(function (res) { setItem(res.data.data); })
      .catch(function () { toast.error('Listing not found'); })
      .finally(function () { setLoading(false); });
  }, [id]);

  if (loading) return <Loader className="py-20" />;
  if (!item) return null;

  var isOwner = user && item.seller && (item.seller._id === user._id || item.seller === user._id);

  return (
    <div style={{ paddingBottom: 64 }}>
      <Link to="/marketplace" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748B', textDecoration: 'none', marginBottom: 16, fontSize: 14 }}><FiArrowLeft size={18} /> Back</Link>

      {item.images && item.images.length > 0 && (
        <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 16, background: '#0F172A' }}>
          <img src={item.images[activeImg].url} alt="" style={{ width: '100%', height: 320, objectFit: 'cover' }} />
          {item.images.length > 1 && (
            <div style={{ display: 'flex', gap: 6, padding: 10 }}>
              {item.images.map(function (img, i) {
                return <div key={i} onClick={function () { setActiveImg(i); }} style={{ width: 56, height: 56, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', border: activeImg === i ? '2px solid #3B82F6' : '2px solid transparent' }}><img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>;
              })}
            </div>
          )}
        </div>
      )}

      <div style={{ background: '#0F172A', borderRadius: 16, padding: 20, border: '1px solid #1E293B', marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#F8FAFC', marginBottom: 8 }}>{item.title}</h1>
        <div style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 12 }}>
          {item.isFree ? 'FREE' : (item.currency || 'KSh') + ' ' + (item.price ? item.price.toLocaleString() : '0')}
        </div>
        <p style={{ color: '#CBD5E1', fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>{item.description}</p>
        <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#64748B' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiMapPin size={14} /> {item.location && item.location.name}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiCalendar size={14} /> {formatDate(item.createdAt)}</span>
          <span>👁️ {formatNumber(item.viewsCount)} views</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <span style={{ background: '#1E293B', padding: '4px 10px', borderRadius: 6, fontSize: 12, color: '#94A3B8' }}>{item.category}</span>
          <span style={{ background: '#1E293B', padding: '4px 10px', borderRadius: 6, fontSize: 12, color: '#94A3B8' }}>{item.condition}</span>
        </div>
      </div>

      <div style={{ background: '#0F172A', borderRadius: 16, padding: 20, border: '1px solid #1E293B' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to={'/' + (item.seller && item.seller.username)} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <Avatar src={item.seller && item.seller.avatar} alt={item.seller && item.seller.firstName} size="md" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontWeight: 600, color: '#F8FAFC', fontSize: 14 }}>{item.seller && item.seller.firstName} {item.seller && item.seller.lastName}</span>
                {item.seller && item.seller.isVerified && <VerifiedBadge />}
              </div>
              <span style={{ fontSize: 12, color: '#64748B' }}>@{item.seller && item.seller.username}</span>
            </div>
          </Link>
          {!isOwner && (
            <Link to={'/messages?participant=' + (item.seller && item.seller._id)} style={{ padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiMessageCircle size={16} /> Contact Seller
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}