import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const ProfilePage = () => {
  const navigate = useNavigate();
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
      // This MUST match the data.get("text") in Python
      body: JSON.stringify({ text: newGoal }) 
    });

    if (res.ok) {
      setNewGoal('');
      fetchProfile(); // Reloads the list from the DB
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
      fetchProfile(); // Refresh the list
    }
  } catch (err) {
    console.error("Delete failed:", err);
  }
};


  if (loading) return <div className="login-page-container">Loading...</div>;
  if (!data) return <div className="login-page-container">Please Log In</div>;

  return (
    <div className="login-page-container" style={{ padding: '60px 20px' }}>
      <div style={{ width: '100%', maxWidth: '1100px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        
        {/* HEADER - SETTINGS REMOVED */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <h1 className="login-logo" style={{ margin: 0 }}>Profile<span style={{color: '#7ba789'}}>REC</span></h1>
        </div>

        <div className="profile-layout-grid">
          
          {/* LEFT SIDE: ICON & NICKNAME UNDERNEATH */}
          <div className="profile-sidebar">
            <img 
              src="/path-to-your-bolt-image.png" 
              alt="Profile Icon" 
              style={{ width: '140px', height: '140px', objectFit: 'contain' }}
            />
            <h2 className="nickname-display">{data.nickname || "Trainee"}</h2>
          </div>

          {/* RIGHT SIDE: NEON SAGE GOAL BOX */}
          <div className="profile-main">
            <div className="neon-goals-box">
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
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff' }}
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
                       onClick={() => {console.log("Goal Object:", goal); // Checks if 'id' exists
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
                  <p style={{ color: '#7ba789', opacity: 0.5, fontStyle: 'italic', padding: '20px' }}>
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