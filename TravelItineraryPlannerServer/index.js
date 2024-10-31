const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const EmployeeModel = require('./models/Employee');


const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/Employee');


// Register route
app.post('/register', (req, res) => {
    EmployeeModel.create(req.body)
    .then(employees => res.json(employees))
    .catch(err => res.json(err))
});

// Login route
app.post('/login', (req, res) => {
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
});

app.listen(5000, () => {
    console.log('Server has started!');
});