//import { useState } from 'react'    Commtented out for now because it is not being used for now and kept giving soft errors
import 'bootstrap/dist/css/bootstrap.min.css'
import Register from './Register'
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import Login from './Login'
import Home from './Home'
import ForgotPassword from './ForgotPassword'
import ResetPassword from './ResetPassword'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path='/home' 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password' element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
