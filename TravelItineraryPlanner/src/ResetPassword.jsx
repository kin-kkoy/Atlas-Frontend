import React, { useState } from 'react';
import axiosInstance from './utils/axios';
import { useNavigate } from 'react-router-dom';

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
            <div className="bg-white p-3 rounded w-25">
                <h2>Reset Password</h2>
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
                    <div className="mb-3">
                        <label htmlFor="resetToken">
                            <strong>Reset Token</strong>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter your reset token..."
                            className="form-control rounded-0"
                            onChange={(e) => setResetToken(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="newPassword">
                            <strong>New Password</strong>
                        </label>
                        <input
                            type="password"
                            placeholder="New Password..."
                            className="form-control rounded-0"
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 rounded-0">
                        Reset Password
                    </button>
                </form>
                {message && <p className="text-center">{message}</p>}
            </div>
        </div>
    );
}

export default ResetPassword;
