const express = require('express');
const userRouter = express.Router();
const User = require('../model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userAuth = require('../middleware/auth');
const validator = require('validator');

// signup
userRouter.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        //Fields validation -existence
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Please fill all fields' });
        }
        // Fields validation - email pawword format  //validator lib
        const isEmailValid = validator.isEmail(email);
        const isPasswordValid = validator.isStrongPassword(password, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        });
        if (!isEmailValid) {
            return res.status(400).json({ message: 'Email is not valid' });
        }
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Password is not strong enough' });
        }

        //Check if user already exists
        const existUser = await User.findOne({ email });
        if (existUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User created successfully. Please Log In!' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

//login
userRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        //Fields validation -existence
        if (!email || !password) {
            return res.status(400).json({ message: 'Please fill all fields' });
        }
        //Email validation
        const isEmailValid = validator.isEmail(email);
        if (!isEmailValid) {
            return res.status(400).json({ message: 'Email is not valid' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Set to true if using HTTPS
            sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax", // Adjust as needed
        });
        // delete password from user object
        const userData = user.toObject();
        delete userData.password;
        res.status(200).json({ message: 'Login successful', data: userData });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
})

//get profile
userRouter.get('/profile', userAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
})

//update profile only name and email
userRouter.put('/profile', userAuth, async (req, res) => {
    try {
        const { name, email } = req.body;
        //name validation
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }
        //email validation
        const isEmailValid = validator.isEmail(email);
        if (!isEmailValid) {
            return res.status(400).json({ error: 'Email is not valid' });
        }

        const user = await User.findByIdAndUpdate(req.user._id, { name, email }, { new: true }).select('-password');
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
})

//change password
userRouter.put('/changepassword', userAuth, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        //Fields validation -existence
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ error: 'Please fill all fields' });
        }
        //Password validation
        const isPasswordValid = validator.isStrongPassword(newPassword, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        });
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Password is not strong enough' });
        }

        const user = await User.findById(req.user._id);
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({ message: 'Password changed successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
})


//logout
userRouter.get('/logout', userAuth, async (req, res) => {
    try {
        res.clearCookie('token');
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
})


module.exports = userRouter;