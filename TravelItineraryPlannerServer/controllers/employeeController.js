const bcrypt = require('bcrypt');
const EmployeeModel = require('../models/Employee');

const employeeController = {
    register: async (req, res) => {
        try {
            console.log('Registration attempt:', req.body);
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            console.log('Hashed password:', hashedPassword);
            
            const employee = await EmployeeModel.create({ 
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword 
            });
            console.log('Created employee:', employee);
            
            res.status(201).json({ message: "Registered Successfully" });
        } catch(err) {
            console.error('Registration error:', err);
            res.status(500).json({ error: "Registration failed" });
        }
    },

    login: async (req, res) => {
        try {
            console.log('Login attempt:', req.body);
            const { email, password } = req.body;
            const user = await EmployeeModel.findOne({ email });
            
            if (!user) {
                console.log('User not found:', email);
                return res.status(404).json("User not found");
            }

            console.log('Found user:', user);
            console.log('Comparing passwords:');
            console.log('Input password:', password);
            console.log('Stored hash:', user.password);
            
            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            console.log('Password match result:', isPasswordCorrect);

            if (isPasswordCorrect) {
                res.json("Login successful");
            } else {
                res.status(401).json("Password incorrect");
            }
        } catch(err) {
            console.error('Login error:', err);
            res.status(500).json({ error: "Login failed! " + err.message });
        }
    },

    forgotPassword: async (req, res) => {
        const { email } = req.body;
        const user = await EmployeeModel.findOne({ email });

        if(!user){
            return res.status(404).json({ error: "User not found" });
        }

        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        const resetTokenExpiry = Date.now() + 1000 * 60 * 10; // 10 minutes
        
        user.resetToken = resetToken;
        user.resetTokenExpiry = resetTokenExpiry;
        await user.save();

        console.log("Token: " + resetToken);
        res.json({ message: "Reset token sent, please check console" });
    },

    resetPassword: async (req, res) => {
        const { email, resetToken, newPassword } = req.body;
        const user = await EmployeeModel.findOne({ 
            email, resetToken, resetTokenExpiry: { $gt: Date.now() } 
        });

        if(!user){
            return res.status(404).json({ error: "Invalid or expired token" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.json({ message: "Password reset successful" });
    }
};

module.exports = employeeController;