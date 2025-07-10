const User = require('../models/User');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

router.post('/signup', async (req, res) => {
    const { firstname, lastname, company, location, email, phone, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            firstname,
            lastname,
            company,
            location,
            email,
            phone,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered ' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Signed in successfully', token });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/onboard', async (req, res) => {
    console.log('Onboard payload:', req.body);
    const { company, location, websites, industries, products, onboardingProgress } = req.body;

    try {
        const userExist = await User.findOne({ email: req.body.email });
        console.log('User found:', userExist);
        if (!userExist) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        userExist.company = company;
        userExist.location = location;
        userExist.websites = websites;
        userExist.industries = industries;
        userExist.products = products;
        if (typeof onboardingProgress === 'number') {
            userExist.onboardingProgress = onboardingProgress;
        }

        await userExist.save();

        res.status(200).json({ message: 'User onboarding data saved successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/getusers', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ users });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/request-reset', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const resetLink = `${process.env.BASE_URL}/new-pass?token=${token}`;
        // const resetLink = `${process.env.BASE_URL}/new-pass`;


        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 15 minutes.</p>`,
        });

        res.status(200).json({ message: 'Password reset email sent' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(400).json({ message: 'Invalid token or user does not exist' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (err) {
        res.status(400).json({ message: 'Invalid or expired token' });
    }
})
router.get('/user/:email', async (req, res) => {
    console.log('Requested email:', req.params.email); // Should print the decoded email
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/google-signup', async (req, res) => {
    const { firstname, lastname, email, company, location, phone, googleId, photoURL } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            // Optionally update user info if needed
            return res.status(200).json({ message: 'User already exists', user });
        }

        // Create a new user without password
        const newUser = new User({
            firstname,
            lastname,
            company,
            location,
            email,
            phone,
            googleId,   // Store Google ID if you want
            photoURL    // Store photo URL if you want
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered via Google', user: newUser });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
