import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from './utils/axios';
import intlTelInput from 'intl-tel-input';
import 'intl-tel-input/build/css/intlTelInput.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./styles/LandingPage.css";

function App() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [signupData, setSignupData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post('/login', { email, password });
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
            console.error('Login error:', err.response?.data || err);
            setMessage(err.response?.data?.error || 'Login failed');
        }
    };

    const handleSignupSubmit = (e) => {
        e.preventDefault();
        // You can implement signup API call here
    };

    React.useEffect(() => {
        const input = document.querySelector('#signupPhone');
        intlTelInput(input, {
            preferredCountries: ['us', 'gb', 'ca'],
            separateDialCode: true,
            utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.8/build/js/utils.js'
        });
    }, []);

    return (
        <div className="container">
            <nav className="navbar navbar-expand-lg">
                <div className="container">
                    <a href="#" className="navbar-brand">
                        <img src="src/assets/AtlasLogo.png" alt="Atlas Logo" />
                    </a>
                    <h5 className="atlas-gradient">TLAS</h5>
                    <div className="d-flex ms-auto">
                        {/* <button
                            type="button"
                            className="btn btn-login btn-link me-3"
                            data-bs-toggle="modal"
                            data-bs-target="#loginModal"
                        >
                            Login
                        </button> */}
                        <Link to="/login" className="btn btn-login text-decoration-none me-3">
                            Login
                        </Link>

                        {/* <button
                            type="button"
                            className="btn btn-get-started btn-link"
                            data-bs-toggle="modal"
                            data-bs-target="#signupModal"
                        >
                            Get Started
                        </button> */}
                        <Link to="/register" className="btn btn-get-started btn-default text-decoration-none">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            <section className="hero-section text-center">
                <div className="hero-section-container">
                    <h1 className="atlas-gradient">PLANNING DREAMS, CONNECTING WORLDS</h1>
                    <h5>
                        Effortlessly plan your travels with friends and loved ones with <b>ATLAS</b> that
                        provides all the tools you need.
                    </h5>
                    {/* <button
                        type="button"
                        className="btn btn-get-started btn-link"
                        data-bs-toggle="modal"
                        data-bs-target="#signupModal"
                    >
                        Get Started
                    </button> */}
                    <Link to="/register" className="btn btn-get-started btn-default text-decoration-none">
                        Get Started
                    </Link>
                </div>
            </section>

            {/* Login Modal */}
            <div className="modal fade" id="loginModal" tabIndex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="loginModalLabel">Login</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="loginEmail" className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="loginEmail"
                                        placeholder="Enter your email"
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="loginPassword" className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="loginPassword"
                                        placeholder="Enter your password"
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-100">
                                    Login
                                </button>
                            </form>
                            {message && <div className="alert alert-danger mt-3">{message}</div>}
                            <p>
                                Forgot Your Password? <Link to="/forgot-password">Click here</Link>
                            </p>
                            <p>Don't have an Account?</p>
                            <Link to="/register" className="btn btn-default border w-100 bg-light rounded-0 text-decoration-none">
                                Register now
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Signup Modal */}
            <div className="modal fade" id="signupModal" tabIndex="-1" aria-labelledby="signupModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="signupModalLabel">Create an account</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSignupSubmit}>
                                <div className="row">
                                    <div className="col-6 mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="signupFirstName"
                                            placeholder="First Name"
                                            onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-6 mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="signupLastName"
                                            placeholder="Last Name"
                                            onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-6 mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="signupUsername"
                                            placeholder="Username"
                                            onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-6 mb-3">
                                        <input
                                            type="tel"
                                            id="signupPhone"
                                            className="form-control"
                                            placeholder="Phone Number"
                                            onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="signupEmail"
                                        placeholder="Enter your email"
                                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="signupPassword"
                                        placeholder="Create a password"
                                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="signupConfirmPassword"
                                        placeholder="Confirm password"
                                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="btn btn-success w-100">
                                    Sign Up
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;