import React from 'react'
import { colorModeContext, useMode } from './themes'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { Routes, Route, Navigate } from 'react-router-dom'
import ResponsiveAppBar from './Components/ResponsiveAppBar'
import Dashboard from './Components/Dashboard'
import Workouts from './Components/Workouts'
import Progress from './Components/Progress'
import Weather from './Components/Weather'
import GymLocator from './Components/GymLocator'

export default function App() {
  const [theme, colorMode] = useMode();

  return (
    <colorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ResponsiveAppBar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path='/workouts' element={<Workouts />} />
            <Route path='/progress' element={<Progress />} />
            <Route path='/weather' element={<Weather />} />
            <Route path='/gymlocator' element={<GymLocator/>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
      </ThemeProvider>
    </colorModeContext.Provider>
  )
}

