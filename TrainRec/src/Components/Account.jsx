import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles'; // <--- 1. Import useTheme
import '../App.css';

const AccountPage = () => {
  const navigate = useNavigate();
  const theme = useTheme(); // <--- 2. Initialize theme
  const isDark = theme.palette.mode === 'dark'; // <--- 3. Create a boolean for easy checks

  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState({});
  const [authPassword, setAuthPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => { fetchAccountData(); }, []);

  const fetchAccountData = async () => {
    try {
      const res = await fetch('http://localhost:5000/me', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setEditData({
          nickname: data.nickname,
          height_in: data.height_in,
          weight_lb: data.weight_lb,
          fitness_activity: data.fitness_activity
        });
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };
  
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

  const handleUpdate = async () => {
    if (!authPassword) {
      setStatusMsg({ type: 'error', text: 'Confirm password required.' });
      return;
    }
    const res = await fetch('http://localhost:5000/me/update_profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ ...editData, confirm_password: authPassword })
    });
    if (res.ok) {
      setStatusMsg({ type: 'success', text: 'Profile updated!' });
      setIsEditing(false); setAuthPassword(''); fetchAccountData();
    } else {
      const result = await res.json();
      setStatusMsg({ type: 'error', text: result.error || 'Update failed' });
    }
  };

  if (loading) return <div className="login-page-container">Loading Account...</div>;

  return (
    <div 
      className="login-page-container" 
      data-theme={theme.palette.mode} 
      style={{ 
        padding: '60px 20px', 
        minHeight: '100vh',
        // THIS pulls the exact background color from your MUI theme (Dashboard)
        backgroundColor: theme.palette.background.default, 
        color: theme.palette.text.primary,
        transition: 'all 0.3s ease'
      }}
    >
      
      {/* HEADER */}
      <div style={{ width: '100%', maxWidth: '1100px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
        {/* Update text color so it remains visible in light mode */}
        <h1 className="login-logo" style={{ margin: 0, color: isDark ? '#ffffff' : '#1a1625' }}>
          Account<span style={{color: '#ff9f43'}}>REC</span>
        </h1>
        <button 
          className="signin-bar" 
          style={{ width: 'auto', padding: '12px 40px', background: isEditing ? '#ff4d4d' : '#9d50bb' }} 
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'CANCEL' : 'EDIT PROFILE'}
        </button>
      </div>

      <div className="account-grid">
        {/* ROW 1: Name, Email, Password (All standardized size) */}
        <div className="neon-account-card neon-purple">
          <span className="card-label">Name</span>
          <span className="card-value">{user.name}</span>
        </div>

        <div className="neon-account-card neon-blue">
          <span className="card-label">Email</span>
          <span className="card-value">{user.email}</span>
        </div>

        <div className="neon-account-card neon-purple">
          <span className="card-label">Password</span>
          <span className="card-value">••••••••</span>
          {/* RESET PASSWORD - Tiny and Bottom Right */}
          <button 
            onClick={() => navigate('/login', { state: { initialView: 'reset' } })}  className="reset-btn-link">
    Reset Password
  </button>
        </div>

        {/* ROW 2: Nickname, Sex, Zodiac */}
        <div className={`neon-account-card ${isEditing ? 'neon-yellow' : 'neon-blue'}`}>
          <span className="card-label">Nickname</span>
          {isEditing ? <input className="card-input" value={editData.nickname} onChange={e => setEditData({...editData, nickname: e.target.value})} /> : <span className="card-value">{user.nickname}</span>}
        </div>

        <div className="neon-account-card neon-purple">
          <span className="card-label">Sex</span>
          <span className="card-value">{user.sex}</span>
        </div>

        <div className="neon-account-card neon-blue">
  <span className="card-label">Zodiac & Birthday</span>
  <span className="card-value">{getZodiacSign(user.birthdate)}</span>
  
  <span style={{ 
    fontSize: '11px', 
    color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', /* Flips color based on mode */
    marginTop: '4px',
    fontWeight: 'bold' 
  }}>
    Born: {formatDate(user.birthdate)}
  </span>
</div>

        {/* ROW 3: Weight, Height, Fitness */}
        <div className={`neon-account-card ${isEditing ? 'neon-yellow' : 'neon-purple'}`}>
          <span className="card-label">Weight (lb)</span>
          {isEditing ? <input type="number" className="card-input" value={editData.weight_lb} onChange={e => setEditData({...editData, weight_lb: e.target.value})} /> : <span className="card-value">{user.weight_lb}</span>}
        </div>

        <div className={`neon-account-card ${isEditing ? 'neon-yellow' : 'neon-blue'}`}>
          <span className="card-label">Height (in)</span>
          {isEditing ? <input type="number" className="card-input" value={editData.height_in} onChange={e => setEditData({...editData, height_in: e.target.value})} /> : <span className="card-value">{user.height_in}</span>}
        </div>

        <div className={`neon-account-card ${isEditing ? 'neon-yellow' : 'neon-purple'}`}>
          <span className="card-label">Fitness</span>
          {isEditing ? (
            <select className="card-input" value={editData.fitness_activity} onChange={e => setEditData({...editData, fitness_activity: e.target.value})}>
              <option value="Sedentary">Sedentary</option>
              <option value="Lightly Active">Lightly Active</option>
              <option value="Moderately Active">Moderately Active</option>
              <option value="Very Active">Very Active</option>
            </select>
          ) : <span className="card-value">{user.fitness_activity}</span>}
        </div>
      </div>

      {/* CONFIRM SECTION */}
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
          <button className="signin-bar" style={{background: '#4dff4d', color: '#000'}} onClick={handleUpdate}>SAVE CHANGES</button>
        </div>
      )}

      {statusMsg.text && (
        <p style={{ marginTop: '20px', fontWeight: 'bold', color: statusMsg.type === 'error' ? '#ff4d4d' : '#4dff4d' }}>
          {statusMsg.text}
        </p>
      )}
    </div>
  );
};

export default AccountPage;