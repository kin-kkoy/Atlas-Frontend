const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
//const jwt = require('jsonwebtoken'); //i'll use this later
const bcrypt = require('bcrypt');
const EmployeeModel = require('./models/Employee');


const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/Employee');

// Can use a .env file to store the secret key
// Secret key for JWT
//const JWT_SECRET = 'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTczMDM3MTQzMSwiaWF0IjoxNzMwMzcxNDMxfQ.JVrQa7P6pD-rn0zdJOfOxfJM-VT0JQyd1BYJ5gY1Ypk';


// Rate limiter for login
const loginLimiter = rateLimit({
    windowMs: 2 * 60 * 1000, // 2 minutes
    max: 5, // 5 requests or chances to login correctly
    message: { error: "You have exceeded the number of login attempts. Please try again in 2 minutes."} // Custom message in JSON format
});


// Register route
app.post('/register', async (req, res) => {

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const employee = await EmployeeModel.create({ ...req.body, password: hashedPassword });
        res.status(201).json({ message: "Registered Successfully!" });
    }catch(err) {
        res.status(500).json({ error: "Registration failed" });
    }

    // EmployeeModel.create(req.body)
    // .then(employees => res.json(employees))
    // .catch(err => res.json(err))
});

// Login route
app.post('/login', loginLimiter, async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await EmployeeModel.findOne({ email });
        if(user){
            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            if(isPasswordCorrect){
                // const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET);
                // return res.json({ status: 'ok', data: token });
                res.json("Login successful");
            }else{
                res.status(401).json("Password incorrect");
            }
        }else{
            res.status(404).json("User has yet to exist");
        }
    }catch(err){
        res.status(500).json({ error: "Login failed! " + err.message });
    }
});



/*  IDEALLY THIS SHOULD GIVE AN EMAIL WHICH CONTAINS THE RESETPASSWORD LINK
    BUT FOR NOW, IT WILL JUST GIVE A RANDOM 6-DIGIT CODE TO THE CONSOLE AND THEN
    USE THAT CODE TO CHANGE THE PASSWORD THE RESET TOKEN
*/
// Forgot Password route
// Generate & send token to user's email (but no email sa for now)
app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const user = await EmployeeModel.findOne({ email });

    if(!user){
        return res.status(404).json({ error: "User not found" });
    }

    /* the original one w/out using the 6-digit code */
    // const resetToken = crypto.randomBytes(32).toString('hex');
    // const resetTokenExpiry = Date.now() + 1000 * 60 * 10; // 10 minutes

    /* the one with the 6-digit code */
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpiry = Date.now() + 1000 * 60 * 10; // 10 minutes
    
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    /*  Normally this is where you' send the resetToken to the user's  */
    // Send email to user's email
    // res.json({ message: "Reset token sent to email", resetToken });

    // Mock token/6-digit code sa ta
    console.log("Token: " + resetToken);
    res.json({ message: "Reset token sent, please check console" });
});

// Reset Password route
// Use the token to reset password
app.post('/reset-password', async (req, res) => {
    const { email, resetToken, newPassword } = req.body;
    const user = await EmployeeModel.findOne({ 
        email, resetToken, resetTokenExpiry: { $gt: Date.now() } 
    });

    if(!user){
        return res.status(404).json({ error: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined; // Clear the token after reset
    user.resetTokenExpiry = undefined; // Clear the expiry after reset
    await user.save();

    res.json({ message: "Password reset successful" });

});





app.listen(5000, () => {
    console.log('Server has started!');
});