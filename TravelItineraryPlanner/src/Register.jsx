import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from './utils/axios';
import "./styles/Register.css";
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import FontAwesome eye icons

function Register() {
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [confirmPassword, setConfirmPassword] = useState();
    const [message, setMessage] = useState();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    
    // Validation states
    const [isLengthValid, setIsLengthValid] = useState(false);
    const [isCharacterValid, setIsCharacterValid] = useState(false);
    const [isNumberValid, setIsNumberValid] = useState(false);
    const [isSpecialCharValid, setIsSpecialCharValid] = useState(false);
    const [isFocused, setIsFocused] = useState(false); // Track if the password field is focused
    
    const navigate = useNavigate();

    // Regular Expressions
    const lengthRegEx = /.{8,}/;
    const characterRegEx = /[a-zA-Z]/;
    const numberRegEx = /[0-9]/;
    const specialCharRegEx = /[!@#$%^&*(),.?":{}|<>]/;

    const handlePasswordChange = (e) => {
        const passwordInput = e.target.value;
        setPassword(passwordInput);

        // Check password validation conditions
        setIsLengthValid(lengthRegEx.test(passwordInput));
        setIsCharacterValid(characterRegEx.test(passwordInput));
        setIsNumberValid(numberRegEx.test(passwordInput));
        setIsSpecialCharValid(specialCharRegEx.test(passwordInput));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage("Passwords do not match!");
            return;
        }
        try {
            console.log('Sending registration data:', { name, email, password });
            const response = await axiosInstance.post("/register", {
                name, 
                email, 
                password
            });
            console.log('Registration response:', response.data);
            setMessage("Registered Successfully!");
            navigate('/login');
        } catch(err) {
            console.error('Registration error:', err);
            setMessage("Registration failed");
        }
    };

    return (
        <div className="register-container d-flex justify-content-center align-items-center bg-secondary vh-100">
            <div className="bg-white p-3 rounded col-lg-4 col-md-6 col-sm-12">
                <h3>Create an account.</h3>
                {message && <div className="alert alert-danger">{message}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3 mt-4">
                        <label htmlFor="username">
                            <strong>Username</strong>
                        </label>
                        <input
                            type="text"
                            placeholder="Username..."
                            autoComplete="off"
                            name="username"
                            className="form-control"
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
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
                    <div className="mb-3 position-relative">
                        <label htmlFor="password">
                            <strong>Password</strong>
                        </label>
                        <input
                            type={passwordVisible ? "text" : "password"}
                            placeholder="Password..."
                            name="password"
                            className="form-control"
                            onChange={handlePasswordChange}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                        />
                        <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setPasswordVisible(!passwordVisible)}
                        >
                            {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    {/* Show Password Validation only when the password field is focused */}
                    {isFocused && (
                        <ul className="password-requirements">
                            <li style={{ color: isLengthValid ? 'green' : '#8f8f8f' }}>
                                {isLengthValid ? '✔' : ''} Password needs to be more than 8 characters
                            </li>
                            <li style={{ color: isCharacterValid ? 'green' : '#8f8f8f' }}>
                                {isCharacterValid ? '✔' : ''} Should contain at least one letter
                            </li>
                            <li style={{ color: isNumberValid ? 'green' : '#8f8f8f' }}>
                                {isNumberValid ? '✔' : ''} Should contain at least one number
                            </li>
                            <li style={{ color: isSpecialCharValid ? 'green' : '#8f8f8f' }}>
                                {isSpecialCharValid ? '✔' : ''} Should contain at least one special character
                            </li>
                        </ul>
                    )}

                    <div className="mb-5 position-relative">
                        <label htmlFor="confirmPassword">
                            <strong>Confirm Password</strong>
                        </label>
                        <input
                            type={confirmPasswordVisible ? "text" : "password"}
                            placeholder="Confirm Password..."
                            name="confirmPassword"
                            className="form-control"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                        >
                            {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    <button type="submit" className="btn btn-create w-100 btn-default text-decoration-none">
                        Create
                    </button>
                </form>
                <div className="haveaccountedy d-flex justify-content-center align-items-center mb-3">
                    <p className="mb-0">Already have an account? </p>
                    <Link to="/login" className="login-link bg-light text-decoration-none ms-2 m-0">
                        Login
                    </Link>
                </div>
            </div>
        </div>    
    );
}

export default Register;
