import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const profileData = await res.json();
        setData(profileData);
        if (profileData.bio) {
          setBioText(profileData.bio);
        }
      } else {
        if (res.status === 401) navigate('/login');
      }
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleBioSave = async () => {
    try {
      const res = await fetch('http://localhost:5000/me/update_bio', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ bio: bioText })
      });

      if (res.ok) {
        setIsEditingBio(false);
        fetchProfile(); 
      }
    } catch (err) {
      console.error("Error saving bio:", err);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-400 bg-[#1a1625] min-h-screen">Loading Profile...</div>;
  if (!data) return <div className="p-10 text-center text-gray-400 bg-[#1a1625] min-h-screen">Please log in to view profile.</div>;

  return (
    <div className="min-h-screen bg-[#1a1625] p-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-start mt-10">
        
        {/* CENTERED LEFT COLUMN: Icon, Nickname, Email */}
        <div className="flex flex-col items-center flex-shrink-0 w-full md:w-auto">
          {/* Smaller Profile Icon with a Distinct Outer Circle (Border) */}
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)] overflow-hidden">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png" 
              alt="Profile" 
              className="w-20 h-20 object-cover"
            />
          </div>
          
          {/* Centered Nickname below the icon */}
          <h1 className="mt-6 text-3xl font-bold text-white tracking-tight text-center">
            {data.nickname || "User Name"}
          </h1>
          
          {/* Formatted and centered Email below the nickname */}
          <p className="mt-2 text-lg text-gray-300 font-medium text-center">
            Email: {data.email}
          </p>
        </div>

        {/* RIGHT COLUMN: Neon Cyan Bio Box - TrainREC Aesthetic */}
        <div className="flex-grow w-full">
          <div className="relative bg-[#00FFFF] rounded-3xl p-8 shadow-[0_0_30px_rgba(0,255,255,0.2)] overflow-hidden group">
            {/* Glossy overlay effect like the dashboard */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            
            <div className="flex justify-between items-start relative z-10">
              <h2 className="text-[#1a1625] text-2xl font-black tracking-tight mb-4">
                User Bio
              </h2>
              <button 
                onClick={() => isEditingBio ? handleBioSave() : setIsEditingBio(true)}
                className="bg-[#1a1625]/20 hover:bg-[#1a1625]/30 text-[#1a1625] text-xs font-bold py-1.5 px-5 rounded-full transition shadow-inner"
              >
                {isEditingBio ? "CONFIRM" : "EDIT BIO"}
              </button>
            </div>

            <div className="relative z-10">
              {isEditingBio ? (
                <textarea 
                  className="w-full bg-[#1a1625]/10 border-none rounded-xl p-4 text-[#1a1625] placeholder-[#1a1625]/60 focus:ring-2 focus:ring-[#1a1625]/50 outline-none resize-none font-medium leading-relaxed"
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  placeholder="Tell us about your fitness journey..."
                  rows="5"
                />
              ) : (
                <p className="text-[#1a1625]/90 text-lg font-medium leading-relaxed italic">
                  "{data.bio || "Add a personal bio here to keep track of your fitness journey!"}"
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;