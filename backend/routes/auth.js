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

  try {
    const [existingUsers] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertQuery = 'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)';
    const [result] = await db.promise().query(insertQuery, [name, email, phone, hashedPassword]);

    const userId = result.insertId;

    // Fetch the created user
    const [rows] = await db.promise().query('SELECT * FROM users WHERE id = ?', [userId]);
    const user = rows[0];

    // Set session
    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: 'Session error' });
      res.status(200).json({ message: 'User registered and logged in!', user });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
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
