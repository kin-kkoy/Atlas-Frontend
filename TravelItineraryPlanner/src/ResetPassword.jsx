import React, { useState } from 'react';
import axiosInstance from './utils/axios';
import { useNavigate } from 'react-router-dom';
import "./styles/ResetPassword.css"

function ResetPassword() {
    const [email, setEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        axiosInstance.post('http://localhost:5000/reset-password', { email, resetToken, newPassword })
            .then((response) => {
                setMessage(response.data.message);
                navigate('/login'); // Redirect after successful reset
            })
            .catch((error) => {
                console.error(error);
                setMessage("Failed to reset password. Please try again.");
            });
    };

    return (
        <div className="d-flex justify-content-center align-items-center bg-secondary vh-100">
            <div className="reset-password-container bg-white p-3 rounded w-25">
                <h4>Reset Password</h4>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3 mt-4">
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
                    <div className="mb-3">
                        <label htmlFor="resetToken">
                            <h6>Reset Token</h6>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter your reset token"
                            className="form-control"
                            onChange={(e) => setResetToken(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="newPassword">
                            <h6>New Password</h6>
                        </label>
                        <input
                            type="password"
                            placeholder="New Password"
                            className="form-control"
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-create w-100 btn-default text-decoration-none mb-2">
                        Reset Password
                    </button>
                </form>
                {message && <p className="text-center">{message}</p>}
            </div>
        </div>
    );
}

export default ResetPassword;