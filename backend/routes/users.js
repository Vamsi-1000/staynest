import express from 'express';
import db from '../config/db.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });

// Route to upload and save profile image
router.post('/profile-pic', upload.single('profileImage'), (req, res) => {
  const { userId } = req.body;
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const imageUrl = `/uploads/${req.file.filename}`;

  const sql = 'UPDATE users SET profile_image_url = ? WHERE id = ?';
  db.query(sql, [imageUrl, userId], (err, result) => {
    if (err) {
      console.error('Error updating profile image:', err);
      return res.status(500).json({ error: 'Failed to update profile image' });
    }
    res.json({ image_url: imageUrl });
  });
});

// Route to fetch all usernames
router.get('/usernames', (req, res) => {
  const sql = 'SELECT id, name FROM users';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching usernames:', err);
      return res.status(500).json({ message: 'Failed to fetch usernames' });
    }
    res.json(results);
  });
});

export default router;
