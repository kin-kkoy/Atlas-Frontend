import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from './utils/axios';

function Login() {
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [message, setMessage] = useState(); // for messages
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await axiosInstance.post("/login", { email, password });
            if (response.data.token) {
                console.log('JWT Token:', response.data.token);
                console.log('Calendar ID:', response.data.user.calendarId); // Changed from calendar._id to calendarId

                localStorage.setItem('token', response.data.token);
                localStorage.setItem('calendarId', response.data.user.calendarId); // Changed from calendar._id to calendarId

                navigate('/home');
            } else {
                setMessage(response.data.error);
            }
        } catch (err) {
            console.error('Login error:', err.response?.data || err); // Add this line for debugging
            setMessage(err.response?.data?.error || "Login failed");
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center bg-secondary vh-100">
            <div className="bg-white p-3 rounded w-25">
                <h2>Login</h2>
                {message && <div className="alert alert-danger">{message}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email">
                            <strong>Email</strong>
                        </label>
                        <input
                            type="email"
                            placeholder="Email..."
                            autoComplete="off"
                            name="email"
                            className="form-control rounded-0"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password">
                            <strong>Password</strong>
                        </label>
                        <input
                            type="password"
                            placeholder="Password..."
                            name="password"
                            className="form-control rounded-0"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-success w-100 rounded-0">
                        Login
                    </button>
                </form>
                <p>
                    Forgot Your Password? 
                    <Link to="/forgot-password">Click here</Link>
                </p>
                <p>Dont have an Account?</p>
                <Link to="/register" className="btn btn-default border w-100 bg-light rounded-0 text-decoration-none">
                    Register now
                </Link>
            </div>
        </div>    
    );
}

export default Login;