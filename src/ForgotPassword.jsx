import React, { useState } from 'react';
import axiosInstance from './utils/axios';
import { Link, useNavigate } from 'react-router-dom';
import "./styles/ForgotPassword.css"

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        axiosInstance.post('/forgot-password', { email })
            .then((response) => {
                setMessage('Reset token sent! Redirecting to reset page...');

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
            <div className="forgot-password-container bg-white p-3 rounded w-25">
                <h3>Forgot Password</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4 mt-3">
                        <label htmlFor="email">
                            <h6>Email</h6>
                        </label>
                        <input
                            type="email"
                            placeholder="Email"
                            className="form-control"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-create w-100 btn-default text-decoration-none">
                        Send Reset Link
                    </button>
                    <p className="haveaccountedy d-flex justify-content-center align-items-center mb-3">
                        Received code? 
                        <Link to="/reset-password" className="reset-link ms-2"> Click here to reset</Link>
                    </p>
                </form>
                {message && <p className="text-center">{message}</p>}
            </div>
        </div>
    );
}

export default ForgotPassword;