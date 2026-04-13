import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AccountPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // States for editing
  const [editData, setEditData] = useState({});
  const [authPassword, setAuthPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAccountData();
  }, []);

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
    } catch (err) {
      console.error("Error loading account:", err);
    } finally {
      setLoading(false); // This runs no matter what!
    }
  };
  const handleSaveBio = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/update_bio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ bio: bioText }) // Sending the new bio
    });

    if (response.ok) {
      const updatedData = await response.json();
      setData(updatedData); // Update the UI with the new data
      setIsEditingBio(false); // Close the edit mode
      alert("Bio updated successfully!");
    } else {
      alert("Failed to save bio.");
    }
  } catch (err) {
    console.error("Error saving bio:", err);
  }
};

  const handleUpdate = async () => {
    if (!authPassword) {
      setStatusMsg({ type: 'error', text: 'Please enter your password to confirm changes.' });
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/me/update_profile', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ ...editData, confirm_password: authPassword })
      });
      
      const result = await res.json();

      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        setAuthPassword('');
        fetchAccountData();
      } else {
        setStatusMsg({ type: 'error', text: result.error || 'Update failed' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Server error. Try again.' });
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Account Details...</div>;
  if (!user) return <div className="p-10 text-center">No user data found.</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Account Settings</h2>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* --- Top to Bottom User Info --- */}
        <section className="grid grid-cols-1 gap-6">
          <InfoRow label="Full Name" value={user.name} />
          <InfoRow label="Email Address" value={user.email} />
          <InfoRow label="Sex" value={user.sex} />
          <InfoRow label="Birthday" value={user.birthdate} />
          
          <div className="flex justify-between items-end border-b pb-2">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Password</p>
              <p className="text-lg tracking-widest font-black text-gray-700">********</p>
            </div>
            <button 
              onClick={() => navigate('/reset-password')}
              className="text-xs text-blue-500 font-bold hover:underline"
            >
              Reset Password
            </button>
          </div>

          {/* Editable Fields */}
          <EditableRow 
            label="Nickname" 
            isEditing={isEditing} 
            value={isEditing ? editData.nickname : user.nickname} 
            onChange={(val) => setEditData({...editData, nickname: val})}
          />

          <div className="grid grid-cols-2 gap-4">
            <EditableRow 
              label="Weight (lbs)" 
              type="number"
              isEditing={isEditing} 
              value={isEditing ? editData.weight_lb : user.weight_lb} 
              onChange={(val) => setEditData({...editData, weight_lb: val})}
            />
            <EditableRow 
              label="Height (in)" 
              type="number"
              isEditing={isEditing} 
              value={isEditing ? editData.height_in : user.height_in} 
              onChange={(val) => setEditData({...editData, height_in: val})}
            />
          </div>

          <EditableRow 
            label="Fitness Activity" 
            isEditing={isEditing} 
            value={isEditing ? editData.fitness_activity : user.fitness_activity} 
            onChange={(val) => setEditData({...editData, fitness_activity: val})}
          />
        </section>

        {/* --- Authentication and Footer --- */}
        {isEditing && (
          <div className="mt-10 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-sm font-semibold text-gray-600 mb-4">Confirm changes with your password:</p>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <input 
                type="password"
                placeholder="Enter current password"
                className="flex-grow p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
              />
              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  onClick={handleUpdate}
                  className="flex-grow bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition"
                >
                  Confirm
                </button>
                <button 
                  onClick={() => { setIsEditing(false); setStatusMsg({type:'', text:''}); }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {statusMsg.text && (
          <p className={`text-center text-sm font-bold ${statusMsg.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
            {statusMsg.text}
          </p>
        )}
      </div>
    </div>
  );
};

// Helper component for static rows
const InfoRow = ({ label, value }) => (
  <div className="border-b border-gray-50 pb-2">
    <p className="text-xs font-bold text-gray-400 uppercase">{label}</p>
    <p className="text-gray-700 font-medium">{value || "Not set"}</p>
  </div>
);

// Helper component for editable rows
const EditableRow = ({ label, value, isEditing, onChange, type="text" }) => (
  <div className="border-b border-gray-50 pb-2">
    <p className="text-xs font-bold text-gray-400 uppercase">{label}</p>
    {isEditing ? (
      <input 
        type={type}
        className="w-full mt-1 p-1 border-b border-blue-300 focus:border-blue-600 outline-none bg-blue-50/30"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    ) : (
      <p className="text-gray-700 font-medium">{value || "Not set"}</p>
    )}
  </div>
);

export default AccountPage;