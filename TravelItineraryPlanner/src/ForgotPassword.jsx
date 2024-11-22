import React, { useState } from 'react';
import axiosInstance from './utils/axios';
import { Link, useNavigate } from 'react-router-dom';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        axiosInstance.post('/forgot-password', { email })
            .then((response) => {
                setMessage('Reset token sent! Redirecting to reset page...');

                // Redirect to resetPassword page after 3 secs if request is successful
                setTimeout(() => {
                    navigate('/reset-password');
                }, 3000);
            })
            .catch((error) => {
                console.error(error);
                setMessage("Failed to send reset token. Please try again.");
            });
    };

    return (
        <div className="d-flex justify-content-center align-items-center bg-secondary vh-100">
            <div className="bg-white p-3 rounded w-25">
                <h2>Forgot Password</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email">
                            <strong>Email</strong>
                        </label>
                        <input
                            type="email"
                            placeholder="Email..."
                            className="form-control rounded-0"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-warning w-100 rounded-0">
                        Send Reset Link
                    </button>
                    <p>
                        Received code? 
                        <Link to="/reset-password"> Click here to reset</Link>
                    </p>
                </form>
                {message && <p className="text-center">{message}</p>}
            </div>
        </div>
    );
}

export default ForgotPassword;