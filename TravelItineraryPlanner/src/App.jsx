import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import Register from './Register'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Login from './Login'
import Home from './Home'

function App() {
  

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path='/home' element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
