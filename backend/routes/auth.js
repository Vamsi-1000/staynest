import express from 'express';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import db from '../config/db.js';

const router = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error.' });
    if (results.length > 0) return res.status(400).json({ message: 'User already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertQuery = 'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)';
    db.query(insertQuery, [name, email, phone, hashedPassword], (err) => {
      if (err) return res.status(500).json({ message: 'Error registering user.' });
      res.json({ message: 'User registered successfully!' });
    });
  });
});

// LOGIN
router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ message: 'Login successful!', user: req.user });
});

// LOGOUT
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});


// Check session validity (used on frontend to persist login)
router.get('/check', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ user: req.user });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});



export default router;