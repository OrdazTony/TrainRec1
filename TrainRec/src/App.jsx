import React from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import ResponsiveAppBar from './Components/ResponsiveAppBar'
import Dashboard from './Components/Dashboard'
import Workouts from './Components/Workouts'
import Progress from './Components/Progress'



export default function App() {
  return (
    <>
      <ResponsiveAppBar />
        <Routes>
          <Route path="/" element={<Dashboard />}></Route>
          <Route path='/workouts' element={<Workouts />}></Route>
          <Route path='/progress' element={<Progress />}></Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

    </>
  )
}

