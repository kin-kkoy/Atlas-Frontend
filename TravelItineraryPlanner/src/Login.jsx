    import React from 'react';
    import { useState } from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import axiosInstance from './utils/axios';
    import "./styles/Login.css";

    function Login() {
        const [email, setEmail] = useState();
        const [password, setPassword] = useState();
        const [message, setMessage] = useState(); // for messages ni
        const navigate = useNavigate();

        const handleSubmit = async (e) => {
            e.preventDefault()
            try {
                const response = await axiosInstance.post("/login", { email, password });
                if (response.data.token) {
                    console.log('JWT Token:', response.data.token);
                    console.log('Calendar ID:', response.data.user.calendarId);

                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('calendarId', response.data.user.calendarId);

                    navigate('/home');
                } else {
                    setMessage(response.data.error);
                }
            } catch (err) {
                console.error('Login error:', err.response?.data || err);
                setMessage(err.response?.data?.error || "Login failed");
            }
        };

        return (
            <div className="login-container d-flex justify-content-center align-items-center bg-secondary vh-100">
                <div className="bg-white p-3 rounded col-lg-3 col-md-6 col-sm-12">
                    <h3>Login</h3>
                    {message && <div className="alert alert-danger">{message}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3 mt-4">
                            <label htmlFor="email">
                                <strong>Email</strong>
                            </label>
                            <input
                                type="email"
                                placeholder="Email..."
                                autoComplete="off"
                                name="email"
                                className="form-control"
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
                                className="form-control"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn btn-create w-100 btn-default text-decoration-none mb-3">
                            Login
                        </button>
                    </form>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <p className="mb-0">
                            <Link to="/forgot-password" className="create-link bg-light">
                                Forgot password
                            </Link>
                        </p>
                        
                        <div className="d-flex align-items-center">
                            <Link to="/register" className="create-link bg-light ms-2">
                                Create an account
                            </Link>
                        </div>
                    </div>

                </div>
            </div>    
        );
    }

    export default Login;