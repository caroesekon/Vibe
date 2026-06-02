// src/pages/profile/EditProfile.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCamera } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import useAuthStore from '../../store/useAuthStore';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

export default function EditProfile() {
  var navigate = useNavigate();
  var user = useAuthStore(function (s) { return s.user; });
  var setUser = useAuthStore(function (s) { return s.setUser; });

  var formState = useState({
    firstName: user ? user.firstName : '',
    lastName: user ? user.lastName : '',
    bio: user ? user.bio || '' : '',
    website: user ? user.website || '' : '',
    location: user ? user.location || '' : '',
  });
  var form = formState[0];
  var setForm = formState[1];

  var loadState = useState(false);
  var loading = loadState[0];
  var setLoading = loadState[1];

  var avatarFileState = useState(null);
  var avatarFile = avatarFileState[0];
  var setAvatarFile = avatarFileState[1];

  var coverFileState = useState(null);
  var coverFile = coverFileState[0];
  var setCoverFile = coverFileState[1];

  var avatarPreviewState = useState(null);
  var avatarPreview = avatarPreviewState[0];
  var setAvatarPreview = avatarPreviewState[1];

  var coverPreviewState = useState(null);
  var coverPreview = coverPreviewState[0];
  var setCoverPreview = coverPreviewState[1];

  var set = function (key) { return function (e) { var f = {}; f[key] = e.target.value; setForm(Object.assign({}, form, f)); }; };

  var handleAvatar = function (e) {
    var file = e.target.files[0];
    if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)); }
  };

  var handleCover = function (e) {
    var file = e.target.files[0];
    if (file) { setCoverFile(file); setCoverPreview(URL.createObjectURL(file)); }
  };

  var handleSubmit = async function (e) {
    e.preventDefault();
    setLoading(true);

    try {
      var formData = new FormData();
      formData.append('firstName', form.firstName.trim());
      formData.append('lastName', form.lastName.trim());
      formData.append('bio', form.bio.trim());
      formData.append('website', form.website.trim());
      formData.append('location', form.location.trim());
      if (avatarFile) formData.append('avatar', avatarFile);
      if (coverFile) formData.append('cover', coverFile);

      var res = await API.put(ENDPOINTS.USERS.UPDATE_PROFILE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUser(Object.assign({}, user, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        bio: form.bio.trim(),
        website: form.website.trim(),
        location: form.location.trim(),
        avatar: res.data.data.avatar || user.avatar,
        coverPhoto: res.data.data.coverPhoto || user.coverPhoto,
      }));

      toast.success('Profile updated!');
      navigate('/' + (user && user.username));
    } catch (err) {
      toast.error('Failed to update profile');
    }
    setLoading(false);
  };

  if (!user) return <Loader className="py-20" />;

  return (
    <div style={{ paddingBottom: 64 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={function () { navigate(-1); }} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 4 }}>
          <FiArrowLeft size={20} />
        </button>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC' }}>Edit Profile</h2>
      </div>

      <div style={{ background: '#0F172A', borderRadius: 16, border: '1px solid #1E293B', overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ height: 160, background: coverPreview ? 'none' : (user.coverPhoto ? 'none' : 'linear-gradient(135deg, #3B82F6, #8B5CF6)'), position: 'relative' }}>
          {(coverPreview || user.coverPhoto) && <img src={coverPreview || user.coverPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          <label style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.6)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'white', fontSize: 12 }}>
            <FiCamera size={14} /> Change Cover
            <input type="file" accept="image/*" onChange={handleCover} style={{ display: 'none' }} />
          </label>
        </div>

        <div style={{ padding: '0 20px 20px', marginTop: -40 }}>
          <div style={{ position: 'relative', width: 80, height: 80, marginBottom: 16 }}>
            <Avatar src={avatarPreview || user.avatar} alt={user.firstName} size="xl" />
            <label style={{ position: 'absolute', bottom: 0, right: -4, width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '3px solid #0F172A' }}>
              <FiCamera size={14} color="white" />
              <input type="file" accept="image/*" onChange={handleAvatar} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ background: '#0F172A', borderRadius: 16, padding: 20, border: '1px solid #1E293B' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>First Name</label>
            <input type="text" value={form.firstName} onChange={set('firstName')} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Last Name</label>
            <input type="text" value={form.lastName} onChange={set('lastName')} style={inputStyle} />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Bio</label>
          <textarea value={form.bio} onChange={set('bio')} maxLength={500} rows={3} placeholder="Tell us about yourself..." style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
          <span style={{ fontSize: 11, color: '#64748B', textAlign: 'right', display: 'block', marginTop: 4 }}>{form.bio.length}/500</span>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Website</label>
          <input type="url" value={form.website} onChange={set('website')} placeholder="https://yourwebsite.com" style={inputStyle} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Location</label>
          <input type="text" value={form.location} onChange={set('location')} placeholder="Nairobi, Kenya" style={inputStyle} />
        </div>

        <Button type="submit" loading={loading} className="w-full" size="lg">Save Changes</Button>
      </form>
    </div>
  );
}

var labelStyle = { display: 'block', color: '#94A3B8', fontSize: 13, fontWeight: 500, marginBottom: 6 };
var inputStyle = { width: '100%', padding: '10px 14px', background: '#1E293B', border: '1px solid #334155', borderRadius: 10, color: '#F8FAFC', fontSize: 14, outline: 'none', boxSizing: 'border-box' };