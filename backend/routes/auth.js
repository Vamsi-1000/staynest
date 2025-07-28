import express from 'express';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import { createUser } from '../models/userModel.js';


const router = express.Router();

// REGISTER
router.post('/register', (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Check if user already exists
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error('DB Error (select user):', err);
      return res.status(500).json({ message: 'Server error while checking user.' });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      const insertQuery = 'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)';
      db.query(insertQuery, [name, email, phone, hashedPassword], (err, insertResult) => {
        if (err) {
          console.error('DB Error (insert user):', err);
          return res.status(500).json({ message: 'Server error during registration.' });
        }

        const userId = insertResult.insertId;

        // Fetch created user
        db.query('SELECT * FROM users WHERE id = ?', [userId], (err, userResults) => {
          if (err) {
            console.error('DB Error (fetch new user):', err);
            return res.status(500).json({ message: 'Server error after registration.' });
          }

          const user = userResults[0];

          // Set session
          req.login(user, (err) => {
            if (err) {
              console.error('Login error:', err);
              return res.status(500).json({ message: 'Session error.' });
            }

            res.status(200).json({ message: 'User registered and logged in!', user });
          });
        });
      });
    } catch (error) {
      console.error('Hashing error:', error);
      res.status(500).json({ message: 'Server error during password processing.' });
    }
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
