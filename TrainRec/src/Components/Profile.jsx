import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import '../App.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const theme = useTheme(); 
  const isDark = theme.palette.mode === 'dark'; 

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newGoal, setNewGoal] = useState('');
  
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/me/full_profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const profileData = await res.json();
        setData(profileData);
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

  const handleAddGoal = async () => {
    if (!newGoal.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/me/add_goal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: newGoal }) 
      });

      if (res.ok) {
        setNewGoal('');
        fetchProfile(); 
      }
    } catch (err) {
      console.error("Add failed:", err);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/me/delete_goal/${goalId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        fetchProfile(); 
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // --- NEW: Image Upload Handlers ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/me/upload_icon', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData // Browser sets Content-Type automatically for FormData
      });

      if (res.ok) {
        fetchProfile(); // Refresh profile to grab the new image URL
        window.dispatchEvent(new Event('avatarUpdate')); // Notify other components (like AppBar) to update their avatar
      } else {
        console.error("Failed to upload image");
      }
    } catch (err) {
      console.error("Upload error:", err);
    }
  };


const handleDeleteImage = async (e) => {
    e.stopPropagation(); // Prevents the click from accidentally opening the file uploader
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/me/remove_icon', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        fetchProfile(); // Refreshes the page to show the default avatar
        window.dispatchEvent(new Event('avatarUpdate')); // Notify other components (like AppBar) to update their avatar
      }
    } catch (err) {
      console.error("Remove image error:", err);
    }
  };

  const triggerFileInput = () => {
    document.getElementById('profile-pic-upload').click();
  };
  // ----------------------------------

  if (loading) return <div className="login-page-container">Loading...</div>;
  if (!data) return <div className="login-page-container">Please Log In</div>;

  return (
    <div 
      className="login-page-container" 
      data-theme={theme.palette.mode}
      style={{ 
        padding: '60px 20px',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default, 
        color: theme.palette.text.primary,
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ width: '100%', maxWidth: '1100px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <h1 className="login-logo" style={{ margin: 0, color: isDark ? '#ffffff' : '#1a1625' }}>
            Profile<span style={{color: '#7ba789'}}>REC</span>
          </h1>
        </div>

        <div className="profile-layout-grid">
          
          {/* LEFT SIDE: ICON & NICKNAME UNDERNEATH */}
          <div className="profile-sidebar">
            
            <input 
              type="file" 
              id="profile-pic-upload" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleImageUpload} 
            />

            <div className="avatar-wrapper">
              
              {/* 1. Use MUI Avatar to display the profile picture and handle the default generic fallback */}
              <Avatar 
                src={data.profile_pic ? `http://localhost:5000/static/uploads/${data.profile_pic}` : "/static/images/avatar/2.jpg"}
                alt="" /* <--- Use an empty string to allow the generic default icon */
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
              
              {/* 2. EDIT (PENCIL) BUTTON - FLOATING TOP LEFT */}
              <button 
                className="floating-action-btn"
                onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}
                title="Edit image"
                style={{
                  top: '0px',
                  left: '-10px',
                  color: isDark ? '#ffffff' : '#1a1625',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.6))' // Visible over light images
                }}
              >
                {/* Pencil SVG */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              
              {/* 3. DELETE (TRASH) BUTTON - FLOATING TOP RIGHT */}
              {data.profile_pic && (
                <button 
                  className="floating-action-btn delete-btn"
                  onClick={handleDeleteImage}
                  title="Remove image"
                  style={{
                    top: '0px',
                    right: '-10px',
                    color: isDark ? '#ffffff' : '#1a1625',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.6))'
                  }}
                >
                  {/* Trash SVG */}
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

          {/* RIGHT SIDE: NEON SAGE GOAL BOX */}
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
                <button onClick={handleAddGoal} className="goals-add-btn">
                  ADD GOAL
                </button>
              </div>

              <div className="goals-list">
                {data.goals && data.goals.length > 0 ? (
                  data.goals.map(goal => (
                    <div key={goal.id} className="goal-list-item" style={{ borderBottom: '1px solid rgba(123,167,137,0.1)' }}>
                      <button 
                       onClick={() => {console.log("Goal Object:", goal); 
                       handleDeleteGoal(goal.id);
                        }} 
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
                  <p style={{ 
                      color: isDark ? '#7ba789' : '#3d5c46', 
                      opacity: isDark ? 0.5 : 0.8, 
                      fontStyle: 'italic', 
                      padding: '20px' 
                    }}>
                      No active goals.
                  </p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;