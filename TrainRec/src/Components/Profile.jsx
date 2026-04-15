import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import '../App.css';
import API_BASE from '../config';

const ProfilePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // --- Profile state ---
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newGoal, setNewGoal] = useState('');

  // --- Account/Edit state ---
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [authPassword, setAuthPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/me/full_profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const profileData = await res.json();
        setData(profileData);
        setEditData({
          nickname: profileData.nickname,
          height_in: profileData.height_in,
          weight_lb: profileData.weight_lb,
          fitness_activity: profileData.fitness_activity
        });
      } else if (res.status === 401) {
        navigate('/login');
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  // --- Goal handlers ---
  const handleAddGoal = async () => {
    if (!newGoal.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/me/add_goal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text: newGoal })
      });
      if (res.ok) { setNewGoal(''); fetchProfile(); }
    } catch (err) { console.error("Add failed:", err); }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/me/delete_goal/${goalId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) { fetchProfile(); }
    } catch (err) { console.error("Delete failed:", err); }
  };

  // --- Image handlers ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/me/upload_icon`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        fetchProfile();
        window.dispatchEvent(new Event('avatarUpdate'));
      }
    } catch (err) { console.error("Upload error:", err); }
  };

  const handleDeleteImage = async (e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/me/remove_icon`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchProfile();
        window.dispatchEvent(new Event('avatarUpdate'));
      }
    } catch (err) { console.error("Remove image error:", err); }
  };

  const triggerFileInput = () => {
    document.getElementById('profile-pic-upload').click();
  };

  // --- Account edit handler ---
  const handleUpdate = async () => {
    if (!authPassword) {
      setStatusMsg({ type: 'error', text: 'Confirm password required.' });
      return;
    }
    const res = await fetch(`${API_BASE}/me/update_profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ ...editData, confirm_password: authPassword })
    });
    if (res.ok) {
      setStatusMsg({ type: 'success', text: 'Profile updated!' });
      setIsEditing(false); setAuthPassword(''); fetchProfile();
    } else {
      const result = await res.json();
      setStatusMsg({ type: 'error', text: result.error || 'Update failed' });
    }
  };

  // --- Date / zodiac helpers ---
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const [year, month, day] = dateString.split('-');
    return `${month}/${day}/${year}`;
  };

  const getZodiacSign = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1;
    const signs = [
      { name: "Capricorn ♑", m: 1, d: 20 }, { name: "Aquarius ♒", m: 2, d: 19 },
      { name: "Pisces ♓", m: 3, d: 20 }, { name: "Aries ♈", m: 4, d: 20 },
      { name: "Taurus ♉", m: 5, d: 21 }, { name: "Gemini ♊", m: 6, d: 21 },
      { name: "Cancer ♋", m: 7, d: 23 }, { name: "Leo ♌", m: 8, d: 23 },
      { name: "Virgo ♍", m: 9, d: 23 }, { name: "Libra ♎", m: 10, d: 23 },
      { name: "Scorpio ♏", m: 11, d: 22 }, { name: "Sagittarius ♐", m: 12, d: 22 }
    ];
    return (signs.find(s => (month === s.m && day <= s.d) || month < s.m) || signs[0]).name;
  };

  if (loading) return <div className="login-page-container">Loading...</div>;
  if (!data) return <div className="login-page-container">Please Log In</div>;

  return (
    <div
      className="login-page-container"
      data-theme={theme.palette.mode}
      style={{
        padding: '60px 20px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ width: '100%', maxWidth: '1100px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <h1 className="login-logo" style={{ margin: 0, color: isDark ? '#ffffff' : '#1a1625' }}>
            Profile<span style={{ color: '#7ba789' }}>REC</span>
          </h1>
        </div>

        {/* ── ORIGINAL PROFILE SECTION: avatar sidebar + goals box ── */}
        <div className="profile-layout-grid">

          {/* LEFT: avatar & nickname */}
          <div className="profile-sidebar">
            <input
              type="file"
              id="profile-pic-upload"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
            <div className="avatar-wrapper">
              <Avatar
                src={data.profile_pic || "/static/images/avatar/2.jpg"}
                alt=""
                onClick={triggerFileInput}
                sx={{
                  width: 140,
                  height: 140,
                  border: `3px solid ${isDark ? '#7ba789' : '#3d5c46'}`,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.03)' }
                }}
              />
              {/* Pencil button */}
              <button
                className="floating-action-btn"
                onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}
                title="Edit image"
                style={{ top: '0px', left: '-10px', color: isDark ? '#ffffff' : '#1a1625', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.6))' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              {/* Trash button */}
              {data.profile_pic && (
                <button
                  className="floating-action-btn delete-btn"
                  onClick={handleDeleteImage}
                  title="Remove image"
                  style={{ top: '0px', right: '-10px', color: isDark ? '#ffffff' : '#1a1625', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.6))' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              )}
            </div>
            <h2 className="nickname-display" style={{ color: isDark ? '#ffffff' : '#1a1625' }}>
              {data.nickname || "Trainee"}
            </h2>
          </div>

          {/* RIGHT: Fitness Goals box */}
          <div className="profile-main">
            <div className="neon-goals-box" style={{
              backgroundColor: isDark ? 'rgba(123, 167, 137, 0.15)' : '#ffffff',
              borderColor: isDark ? 'rgba(123, 167, 137, 0.4)' : '#7ba789'
            }}>
              <div className="goals-header">
                <h2 className="goals-title">Fitness Goals</h2>
              </div>
              <div className="goal-input-container">
                <textarea
                  className="goals-textarea"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="Set a new milestone..."
                  rows="2"
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    color: isDark ? '#fff' : '#1a1625'
                  }}
                />
                <button onClick={handleAddGoal} className="goals-add-btn">ADD GOAL</button>
              </div>
              <div className="goals-list">
                {data.goals && data.goals.length > 0 ? (
                  data.goals.map(goal => (
                    <div key={goal.id} className="goal-list-item" style={{ borderBottom: '1px solid rgba(123,167,137,0.1)' }}>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="trash-btn"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                      <span className="goal-text-content">{goal.text}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: isDark ? '#7ba789' : '#3d5c46', opacity: isDark ? 0.5 : 0.8, fontStyle: 'italic', padding: '20px' }}>
                    No active goals.
                  </p>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* ── ACCOUNT SECTION: neon info cards + edit profile ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="login-logo" style={{ margin: 0, fontSize: '1.6rem', color: isDark ? '#ffffff' : '#1a1625' }}>
            Account<span style={{ color: '#ff9f43' }}>REC</span>
          </h2>
          <button
            className="signin-bar"
            style={{ width: 'auto', padding: '12px 40px', background: isEditing ? '#ff4d4d' : '#9d50bb' }}
            onClick={() => { setIsEditing(!isEditing); setStatusMsg({ type: '', text: '' }); }}
          >
            {isEditing ? 'CANCEL' : 'EDIT PROFILE'}
          </button>
        </div>

        <div className="account-grid">
          <div className="neon-account-card neon-purple">
            <span className="card-label">Name</span>
            <span className="card-value">{data.name}</span>
          </div>
          <div className="neon-account-card neon-blue">
            <span className="card-label">Email</span>
            <span className="card-value">{data.email}</span>
          </div>
          <div className="neon-account-card neon-purple">
            <span className="card-label">Password</span>
            <span className="card-value">••••••••</span>
            <button
              onClick={() => navigate('/login', { state: { initialView: 'reset' } })}
              className="reset-btn-link"
            >
              Reset Password
            </button>
          </div>

          <div className={`neon-account-card ${isEditing ? 'neon-yellow' : 'neon-blue'}`}>
            <span className="card-label">Nickname</span>
            {isEditing
              ? <input className="card-input" value={editData.nickname} onChange={e => setEditData({ ...editData, nickname: e.target.value })} />
              : <span className="card-value">{data.nickname}</span>}
          </div>
          <div className="neon-account-card neon-purple">
            <span className="card-label">Sex</span>
            <span className="card-value">{data.sex}</span>
          </div>
          <div className="neon-account-card neon-blue">
            <span className="card-label">Zodiac & Birthday</span>
            <span className="card-value">{getZodiacSign(data.birthdate)}</span>
            <span style={{ fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', marginTop: '4px', fontWeight: 'bold' }}>
              Born: {formatDate(data.birthdate)}
            </span>
          </div>

          <div className={`neon-account-card ${isEditing ? 'neon-yellow' : 'neon-purple'}`}>
            <span className="card-label">Weight (lb)</span>
            {isEditing
              ? <input type="number" className="card-input" value={editData.weight_lb} onChange={e => setEditData({ ...editData, weight_lb: e.target.value })} />
              : <span className="card-value">{data.weight_lb}</span>}
          </div>
          <div className={`neon-account-card ${isEditing ? 'neon-yellow' : 'neon-blue'}`}>
            <span className="card-label">Height (in)</span>
            {isEditing
              ? <input type="number" className="card-input" value={editData.height_in} onChange={e => setEditData({ ...editData, height_in: e.target.value })} />
              : <span className="card-value">{data.height_in}</span>}
          </div>
          <div className={`neon-account-card ${isEditing ? 'neon-yellow' : 'neon-purple'}`}>
            <span className="card-label">Fitness</span>
            {isEditing ? (
              <select className="card-input" value={editData.fitness_activity} onChange={e => setEditData({ ...editData, fitness_activity: e.target.value })}>
                <option value="Sedentary">Sedentary</option>
                <option value="Lightly Active">Lightly Active</option>
                <option value="Moderately Active">Moderately Active</option>
                <option value="Very Active">Very Active</option>
              </select>
            ) : <span className="card-value">{data.fitness_activity}</span>}
          </div>
        </div>

        {/* Confirm edit section */}
        {isEditing && (
          <div className="confirm-box neon-orange">
            <h2 className="welcome-text" style={{ textAlign: 'center', marginBottom: '10px' }}>Confirm Changes</h2>
            <input
              type="password"
              placeholder="Enter Password"
              className="custom-input"
              value={authPassword}
              onChange={e => setAuthPassword(e.target.value)}
            />
            <button className="signin-bar" style={{ background: '#4dff4d', color: '#000' }} onClick={handleUpdate}>SAVE CHANGES</button>
          </div>
        )}

        {statusMsg.text && (
          <p style={{ marginTop: '20px', fontWeight: 'bold', color: statusMsg.type === 'error' ? '#ff4d4d' : '#4dff4d' }}>
            {statusMsg.text}
          </p>
        )}

      </div>
    </div>
  );
};

export default ProfilePage;
