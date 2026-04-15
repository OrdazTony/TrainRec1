import React from 'react'
import { colorModeContext, useMode } from './themes'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import ResponsiveAppBar from './Components/ResponsiveAppBar'
import Dashboard from './Components/Dashboard'
import Workouts from './Components/Workouts'
import Progress from './Components/Progress'
import Weather from './Components/Weather'
import LoginPage from './Components/Login'
import ProfilePage from './Components/Profile'
import GymLocator from './Components/GymLocator'

function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" state={{ initialView: 'login' }} replace />;
  return children;
}

export default function App() {
  const [theme, colorMode] = useMode();
  const location = useLocation();

  const hideNav = location.pathname === '/login';

  return (
    <colorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {!hideNav && <ResponsiveAppBar />}
          <Routes>
            <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path='/workouts' element={<RequireAuth><Workouts /></RequireAuth>} />
            <Route path='/progress' element={<RequireAuth><Progress /></RequireAuth>} />
            <Route path='/weather' element={<RequireAuth><Weather /></RequireAuth>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
            <Route path='/gymlocator' element={<RequireAuth><GymLocator /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
      </ThemeProvider>
    </colorModeContext.Provider>
  )
}

