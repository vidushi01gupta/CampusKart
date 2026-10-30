import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();
const COLLEGE_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@glbitm\.ac\.in$/i;

const createToken = (user) =>
  jwt.sign({ id: user._id, email: user.email, name: user.name }, process.env.JWT_SECRET || 'campus-bazaar-secret-key', {
    expiresIn: '7d',
  });


router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: 'Name, email and password are required'
    });
  }

  // Allow only GL Bajaj college email addresses
  const normalizedEmail = email.trim().toLowerCase();

  if (!COLLEGE_EMAIL_REGEX.test(normalizedEmail)) {
    return res.status(400).json({
      message: 'Registration is allowed only with a GL Bajaj college email ID (@glbitm.ac.in).'
    });
  }

  try {
    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists'
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password
    });

    const token = createToken(user);

    res.status(201).json({
      token,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        points: user.points ?? 100,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = createToken(user);

    res.json({
      token,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        points: user.points ?? 100,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
