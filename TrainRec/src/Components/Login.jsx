import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../App.css'; 

const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [view, setView] = useState(location.state?.initialView || 'login');

  const [formData, setFormData] = useState({
    email: '', 
    password: '', 
    name: '', 
    nickname: '', 
    birthdate: '', 
    weight_lb: '', 
    height_in: '', 
    fitness_activity: 'Sedentary', 
    sex: '', // Changed to empty string for the "Gender" placeholder
    new_password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAction = async (endpoint, payload) => {
    try {
      const response = await fetch(`http://localhost:5000/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.ok) {
        if (endpoint === 'reset_password') {
          alert("Password updated successfully!");
          setView('login');
          return;
        }
        if (data.token) localStorage.setItem('token', data.token);
        navigate('/'); 
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error("Connection error:", err);
    }
  };

  return (
    <div className="tr-login-overlay">
      
      <h1 className="tr-logo-text">TrainREC</h1>

      <div className="tr-orange-card">
        
        {/* --- LOGIN VIEW --- */}
        {view === 'login' && (
          <div style={{ width: '100%' }}>
            <span className="tr-welcome">Welcome,</span>
            <input name="email" type="email" placeholder="Username" className="tr-input-field" onChange={handleChange} />
            <input name="password" type="password" placeholder="Password" className="tr-input-field" onChange={handleChange} />
            <button className="tr-signin-btn" onClick={() => handleAction('login', { email: formData.email, password: formData.password })}>
              Sign In
            </button>
            <button className="tr-forgot-btn" onClick={() => setView('reset')}>forgot password?</button>
          </div>
        )}

        {/* --- REGISTER VIEW --- */}
        {view === 'register' && (
          <div style={{ width: '100%' }}>
            <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '20px' }}>Create Account</h2>
            
            <input name="name" placeholder="Full Name" className="tr-input-field" onChange={handleChange} />
            <input name="nickname" placeholder="Profile Nickname" className="tr-input-field" onChange={handleChange} />
            <input name="email" type="email" placeholder="Email" className="tr-input-field" onChange={handleChange} />
            <input name="password" type="password" placeholder="Password" className="tr-input-field" onChange={handleChange} />
            
            {/* Birthday and Gender Row */}
            <div className="tr-grid">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ color: '#888', fontSize: '10px', marginLeft: '5px' }}>Birthday</label>
                <input name="birthdate" type="date" className="tr-input-field" onChange={handleChange} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ color: '#888', fontSize: '10px', marginLeft: '5px' }}>Gender</label>
                <select name="sex" className="tr-input-field" onChange={handleChange} value={formData.sex}>
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="tr-grid">
              <input name="weight_lb" type="number" placeholder="Weight (lb)" className="tr-input-field" onChange={handleChange} />
              <input name="height_in" type="number" placeholder="Height (in)" className="tr-input-field" onChange={handleChange} />
            </div>

            {/* Activity Level */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#888', fontSize: '10px', marginLeft: '5px' }}>Activity Level</label>
              <select 
                name="fitness_activity" 
                className="tr-input-field" 
                onChange={handleChange} 
                value={formData.fitness_activity}
                style={{ marginTop: '5px' }}
              >
                <option value="Sedentary">Sedentary (Little to no exercise)</option>
                <option value="Lightly Active">Lightly Active (1-3 days/week)</option>
                <option value="Moderately Active">Moderately Active (3-5 days/week)</option>
                <option value="Very Active">Very Active (6-7 days/week)</option>
                <option value="Extra Active">Extra Active (Very physical job/training)</option>
              </select>
            </div>

            <button className="tr-signin-btn" onClick={() => handleAction('register', formData)}>
              Submit & Join
            </button>
            <button className="tr-forgot-btn" style={{ float: 'none', width: '100%', marginTop: '15px' }} onClick={() => setView('login')}>
              Back to Login
            </button>
          </div>
        )}

        {/* --- RESET VIEW --- */}
        {view === 'reset' && (
          <div style={{ width: '100%' }}>
            <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '20px' }}>Reset</h2>
            <input name="email" type="email" placeholder="Email Address" className="tr-input-field" onChange={handleChange} />
            <input name="new_password" type="password" placeholder="New Password" className="tr-input-field" onChange={handleChange} />
            <button className="tr-signin-btn" onClick={() => handleAction('reset_password', { email: formData.email, new_password: formData.new_password })}>Update Password</button>
            <button className="tr-forgot-btn" style={{ float: 'none', width: '100%', marginTop: '15px' }} onClick={() => setView('login')}>Cancel</button>
          </div>
        )}
      </div>

      <div className="text-center" style={{ marginTop: '40px' }}>
        <button className="tr-create-btn" onClick={() => setView('register')}>
          Create new Account
        </button>
      </div>

    </div>
  );
};

export default LoginPage;