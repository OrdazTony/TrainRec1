import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('login'); // 'login', 'register', or 'reset'
  const [formData, setFormData] = useState({
    email: '', password: '', name: '', nickname: '', 
    birthdate: '', weight_lb: '', height_in: '', 
    fitness_activity: '', sex: 'Other', new_password: ''
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
      // Logic for Password Reset
      if (endpoint === 'reset_password') {
        alert("Password updated successfully! Please log in.");
        setView('login'); // This stays on the page but switches to the Login form
        return; // Stop here so we don't navigate to the dashboard
      }

      // Logic for Login and Register
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      navigate('/'); 
      
    } else {
      alert(data.error || "Something went wrong");
    }
  } catch (err) {
    console.error("Connection error:", err);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        
        {/* --- LOGIN VIEW --- */}
        {view === 'login' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Login to TrainRec</h2>
            <input name="email" type="email" placeholder="Email" onChange={handleChange} className="w-full p-2 border rounded" />
            <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full p-2 border rounded" />
            <button onClick={() => handleAction('login', { email: formData.email, password: formData.password })} className="w-full bg-blue-600 text-white py-2 rounded font-bold">Login</button>
            <div className="flex justify-between text-sm text-blue-600">
              <button onClick={() => setView('register')}>New User?</button>
              <button onClick={() => setView('reset')}>Forgot Password?</button>
            </div>
          </div>
        )}

        {/* --- REGISTER VIEW (New User) --- */}
        {view === 'register' && (
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-center">Create Account</h2>
            <input name="name" placeholder="Full Name" onChange={handleChange} className="w-full p-2 border rounded text-sm" />
            <input name="email" type="email" placeholder="Email" onChange={handleChange} className="w-full p-2 border rounded text-sm" />
            <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full p-2 border rounded text-sm" />
            <input name="nickname" placeholder="Nickname" onChange={handleChange} className="w-full p-2 border rounded text-sm" />
            <div className="grid grid-cols-2 gap-2">
                <input name="birthdate" type="date" onChange={handleChange} className="p-2 border rounded text-sm" />
                <select name="sex" onChange={handleChange} className="p-2 border rounded text-sm">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <input name="weight_lb" type="number" placeholder="Weight (lbs)" onChange={handleChange} className="p-2 border rounded text-sm" />
                <input name="height_in" type="number" placeholder="Height (in)" onChange={handleChange} className="p-2 border rounded text-sm" />
            </div>
            <input name="fitness_activity" placeholder="Fitness Activity (e.g. Running)" onChange={handleChange} className="w-full p-2 border rounded text-sm" />
            <button onClick={() => handleAction('register', formData)} className="w-full bg-green-600 text-white py-2 rounded font-bold">Submit & Start</button>
            <button onClick={() => setView('login')} className="w-full text-gray-500 text-sm">Back to Login</button>
          </div>
        )}

        {/* --- RESET PASSWORD VIEW --- */}
        {view === 'reset' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Reset Password</h2>
            <p className="text-xs text-gray-500 text-center">Enter your email and a new password</p>
            <input name="email" type="email" placeholder="Email" onChange={handleChange} className="w-full p-2 border rounded" />
            <input name="new_password" type="password" placeholder="New Password" onChange={handleChange} className="w-full p-2 border rounded" />
            <button onClick={() => handleAction('reset_password', { email: formData.email, new_password: formData.new_password })} className="w-full bg-orange-500 text-white py-2 rounded font-bold">Confirm New Password</button>
            <button onClick={() => setView('login')} className="w-full text-gray-500 text-sm">Back to Login</button>
          </div>
        )}

      </div>
    </div>
  );
};

export default LoginPage;