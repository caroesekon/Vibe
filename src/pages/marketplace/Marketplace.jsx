// src/pages/marketplace/Marketplace.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiFilter, FiPlus, FiX } from 'react-icons/fi';
import API from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import ListingCard from '../../components/marketplace/ListingCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { MARKETPLACE_CATEGORIES, MARKETPLACE_CONDITIONS } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function Marketplace() {
  var listingsState = useState([]);
  var listings = listingsState[0];
  var setListings = listingsState[1];

  var loadState = useState(true);
  var loading = loadState[0];
  var setLoading = loadState[1];

  var searchState = useState('');
  var search = searchState[0];
  var setSearch = searchState[1];

  var categoryState = useState('');
  var category = categoryState[0];
  var setCategory = categoryState[1];

  var conditionState = useState('');
  var condition = conditionState[0];
  var setCondition = conditionState[1];

  var sortState = useState('createdAt');
  var sort = sortState[0];
  var setSort = sortState[1];

  var filterState = useState(false);
  var showFilter = filterState[0];
  var setShowFilter = filterState[1];

  var createState = useState(false);
  var showCreate = createState[0];
  var setShowCreate = createState[1];

  var newListingState = useState({ title: '', description: '', price: '', currency: 'KSh', isFree: false, category: 'other', condition: 'good', location: '' });
  var newListing = newListingState[0];
  var setNewListing = newListingState[1];

  var filesState = useState([]);
  var files = filesState[0];
  var setFiles = filesState[1];

  var createLoadState = useState(false);
  var createLoading = createLoadState[0];
  var setCreateLoading = createLoadState[1];

  useEffect(function () { fetchListings(); }, [category, condition, sort]);

  var fetchListings = async function () {
    setLoading(true);
    try {
      var params = { sort: sort, limit: 50 };
      if (category) params.category = category;
      if (condition) params.condition = condition;
      if (search) params.search = search;
      var res = await API.get(ENDPOINTS.MARKETPLACE.LIST, { params: params });
      setListings(res.data.data || []);
    } catch (err) {}
    setLoading(false);
  };

  var handleSearch = function (e) {
    e.preventDefault();
    fetchListings();
  };

  var handleCreate = async function () {
    if (!newListing.title.trim()) return toast.error('Title required');
    setCreateLoading(true);
    try {
      var formData = new FormData();
      formData.append('title', newListing.title);
      formData.append('description', newListing.description);
      formData.append('price', newListing.isFree ? '0' : newListing.price);
      formData.append('currency', newListing.currency);
      formData.append('isFree', newListing.isFree ? 'true' : 'false');
      formData.append('category', newListing.category);
      formData.append('condition', newListing.condition);
      formData.append('location', JSON.stringify({ name: newListing.location }));
      files.forEach(function (f) { formData.append('images', f); });

      await API.post(ENDPOINTS.MARKETPLACE.CREATE, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Listing created!');
      setShowCreate(false);
      setNewListing({ title: '', description: '', price: '', currency: 'KSh', isFree: false, category: 'other', condition: 'good', location: '' });
      setFiles([]);
      fetchListings();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setCreateLoading(false);
  };

  return (
    <div style={{ paddingBottom: 64 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC' }}>Marketplace</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={function () { setShowFilter(!showFilter); }} style={{ width: 40, height: 40, borderRadius: 12, border: 'none', background: '#1E293B', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiFilter size={18} /></button>
          <button onClick={function () { setShowCreate(true); }} style={{ width: 40, height: 40, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiPlus size={20} /></button>
        </div>
      </div>

      {showFilter && (
        <div style={{ background: '#0F172A', borderRadius: 14, padding: 14, border: '1px solid #1E293B', marginBottom: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <select value={category} onChange={function (e) { setCategory(e.target.value); }} style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px', color: '#F8FAFC', fontSize: 13, cursor: 'pointer' }}>
            <option value="">All Categories</option>
            {MARKETPLACE_CATEGORIES.map(function (c) { return <option key={c} value={c}>{c}</option>; })}
          </select>
          <select value={condition} onChange={function (e) { setCondition(e.target.value); }} style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px', color: '#F8FAFC', fontSize: 13, cursor: 'pointer' }}>
            <option value="">All Conditions</option>
            {MARKETPLACE_CONDITIONS.map(function (c) { return <option key={c.value} value={c.value}>{c.label}</option>; })}
          </select>
          <select value={sort} onChange={function (e) { setSort(e.target.value); }} style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px', color: '#F8FAFC', fontSize: 13, cursor: 'pointer' }}>
            <option value="createdAt">Latest</option>
            <option value="price_asc">Price: Low-High</option>
            <option value="price_desc">Price: High-Low</option>
            <option value="views">Most Viewed</option>
          </select>
        </div>
      )}

      <form onSubmit={handleSearch} style={{ position: 'relative', marginBottom: 16 }}>
        <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} size={18} />
        <input type="text" value={search} onChange={function (e) { setSearch(e.target.value); }} placeholder="Search marketplace..." style={{ width: '100%', padding: '12px 14px 12px 44px', background: '#0F172A', border: '1px solid #1E293B', borderRadius: 14, color: '#F8FAFC', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
      </form>

      {loading ? <Loader className="py-20" /> : listings.length === 0 ? <EmptyState icon="🏪" title="No listings" description="Create the first listing" /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12 }}>
          {listings.map(function (item) { return <ListingCard key={item._id} item={item} />; })}
        </div>
      )}

      {/* Create Listing Modal */}
      <Modal isOpen={showCreate} onClose={function () { setShowCreate(false); }} title="Create Listing" size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="text" value={newListing.title} onChange={function (e) { setNewListing(Object.assign({}, newListing, { title: e.target.value })); }} placeholder="Title *" style={{ width: '100%', padding: '10px 14px', background: '#1E293B', border: '1px solid #334155', borderRadius: 10, color: '#F8FAFC', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          <textarea value={newListing.description} onChange={function (e) { setNewListing(Object.assign({}, newListing, { description: e.target.value })); }} placeholder="Description" rows={3} style={{ width: '100%', padding: '10px 14px', background: '#1E293B', border: '1px solid #334155', borderRadius: 10, color: '#F8FAFC', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input type="checkbox" checked={newListing.isFree} onChange={function (e) { setNewListing(Object.assign({}, newListing, { isFree: e.target.checked })); }} style={{ accentColor: '#3B82F6' }} />
              <span style={{ color: '#94A3B8', fontSize: 13 }}>Free item</span>
            </label>
          </div>

          {!newListing.isFree && (
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" value={newListing.price} onChange={function (e) { setNewListing(Object.assign({}, newListing, { price: e.target.value })); }} placeholder="Price" style={{ flex: 1, padding: '10px 14px', background: '#1E293B', border: '1px solid #334155', borderRadius: 10, color: '#F8FAFC', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              <select value={newListing.currency} onChange={function (e) { setNewListing(Object.assign({}, newListing, { currency: e.target.value })); }} style={{ width: 80, padding: '10px', background: '#1E293B', border: '1px solid #334155', borderRadius: 10, color: '#F8FAFC', fontSize: 14, outline: 'none', cursor: 'pointer' }}>
                <option value="KSh">KSh</option>
                <option value="USD">USD</option>
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <select value={newListing.category} onChange={function (e) { setNewListing(Object.assign({}, newListing, { category: e.target.value })); }} style={{ flex: 1, padding: '10px', background: '#1E293B', border: '1px solid #334155', borderRadius: 10, color: '#F8FAFC', fontSize: 14, outline: 'none', cursor: 'pointer' }}>
              {MARKETPLACE_CATEGORIES.map(function (c) { return <option key={c} value={c}>{c}</option>; })}
            </select>
            <select value={newListing.condition} onChange={function (e) { setNewListing(Object.assign({}, newListing, { condition: e.target.value })); }} style={{ flex: 1, padding: '10px', background: '#1E293B', border: '1px solid #334155', borderRadius: 10, color: '#F8FAFC', fontSize: 14, outline: 'none', cursor: 'pointer' }}>
              {MARKETPLACE_CONDITIONS.map(function (c) { return <option key={c.value} value={c.value}>{c.label}</option>; })}
            </select>
          </div>

          <input type="text" value={newListing.location} onChange={function (e) { setNewListing(Object.assign({}, newListing, { location: e.target.value })); }} placeholder="Location (e.g. Nairobi)" style={{ width: '100%', padding: '10px 14px', background: '#1E293B', border: '1px solid #334155', borderRadius: 10, color: '#F8FAFC', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />

          <div>
            <label style={{ display: 'block', color: '#94A3B8', fontSize: 13, marginBottom: 8 }}>Images (max 8)</label>
            <input type="file" multiple accept="image/*" onChange={function (e) { setFiles(Array.from(e.target.files)); }} style={{ color: '#94A3B8', fontSize: 13 }} />
            {files.length > 0 && <div style={{ color: '#64748B', fontSize: 12, marginTop: 4 }}>{files.length} file(s) selected</div>}
          </div>

          <Button onClick={handleCreate} loading={createLoading} size="lg">Create Listing</Button>
        </div>
      </Modal>
    </div>
  );
}