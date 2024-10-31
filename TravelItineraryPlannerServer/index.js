const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const EmployeeModel = require('./models/Employee');


const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/Employee');


// Rate limiter for login
const loginLimiter = rateLimit({
    windowMs: 2 * 60 * 1000, // 2 minutes
    max: 5, // 5 requests or chances to login correctly
    message: { error: "You have exceeded the number of login attempts. Please try again in 2 minutes."} // Custom message in JSON format
});


// Register route
app.post('/register', (req, res) => {
    EmployeeModel.create(req.body)
    .then(employees => res.json(employees))
    .catch(err => res.json(err))
});

// Login route
app.post('/login', loginLimiter, (req, res) => {
    const {email, password} = req.body;
    EmployeeModel.findOne({email: email})
    .then(user => {
        if(user) {
            if(user.password === password) {
                res.json("Login successful");
            }else {
                res.json("Password incorrect");
            }
        }else{
            res.json("User has yet to exist");
        }
    })
    .catch(err => res.status(400).json("Error: " + err));
});


app.listen(5000, () => {
    console.log('Server has started!');
});