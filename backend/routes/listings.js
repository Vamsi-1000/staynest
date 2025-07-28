import express from 'express';
import db from '../config/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

//  Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ message: 'User session expired. Please login again.' });
};


/*LISTING ROUTES*/

// Add Listing
router.post('/add', isAuthenticated, upload.array('images', 10), (req, res) => {
  const { title, description, location, price } = req.body;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'At least one image is required' });
  }

  const userId = req.user.id;
  const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
  const imagePathString = JSON.stringify(imagePaths);

  const sql = `INSERT INTO listings (user_id, title, description, location, price, image_url)
                VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(sql, [userId, title, description, location, price, imagePathString], (err, result) => {
    if (err) {
      console.error('Insert error:', err);
      return res.status(500).json({ message: 'Failed to add listing' });
    }

    res.json({ message: 'Listing added successfully', id: result.insertId });
  });
});

//  Get All Listings (with owner contact info)
router.get('/', (_, res) => {
  const sql = `
    SELECT listings.*, users.name AS username, users.email, users.phone
    FROM listings
    JOIN users ON listings.user_id = users.id
    ORDER BY listings.id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Fetch error:', err);
      return res.status(500).json({ message: 'Failed to fetch listings' });
    }

    //  Parse image_url JSON string to array
    const listings = results.map(l => ({
      ...l,
      image_url: l.image_url ? JSON.parse(l.image_url) : []
    }));

    res.json(listings);
  });
});

//  Get Single Listing by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT listings.*, users.name AS username, users.email, users.phone
    FROM listings
    JOIN users ON listings.user_id = users.id
    WHERE listings.id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error fetching listing:', err);
      return res.status(500).json({ message: 'Failed to fetch listing' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    //  Parse image_url JSON string to array
    const listing = {
      ...results[0],
      image_url: results[0].image_url ? JSON.parse(results[0].image_url) : []
    };

    res.json(listing);
  });
});

//  Get Listings by User ID with Reviews
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;

  const listingsQuery = `
    SELECT listings.*, users.name AS username
    FROM listings
    JOIN users ON listings.user_id = users.id
    WHERE listings.user_id = ?
  `;

  db.query(listingsQuery, [userId], (err, listings) => {
    if (err) {
      console.error('User listings error:', err);
      return res.status(500).json({ message: 'Failed to fetch user listings' });
    }

    if (listings.length === 0) return res.json([]);

    const listingIds = listings.map(l => l.id);
    const reviewsQuery = `
      SELECT r.*, u.name AS reviewer_name FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE listing_id IN (?)
    `;

    db.query(reviewsQuery, [listingIds], (err, reviews) => {
      if (err) {
        console.error('Reviews fetch error:', err);
        return res.status(500).json({ message: 'Failed to fetch reviews' });
      }

      const listingsWithReviews = listings.map(listing => ({
        ...listing,
        image_url: listing.image_url ? JSON.parse(listing.image_url) : [], // Parse image_url
        reviews: reviews.filter(r => r.listing_id === listing.id)
      }));

      res.json(listingsWithReviews);
    });
  });
});

// Get Listings by Username (case-insensitive)
router.get('/user/by-name/:name', (req, res) => {
  const { name } = req.params;
  const sql = `
    SELECT listings.*, users.name AS username
    FROM listings
    JOIN users ON listings.user_id = users.id
    WHERE LOWER(users.name) = LOWER(?)
  `;

  db.query(sql, [name], (err, results) => {
    if (err) {
      console.error('Search by name error:', err);
      return res.status(500).json({ message: 'Failed to fetch listings by name' });
    }

    const listings = results.map(l => ({
      ...l,
      image_url: l.image_url ? JSON.parse(l.image_url) : []
    }));

    res.json(listings);
  });
});

// Edit Listing (Supports multiple image uploads)
router.put('/:id', isAuthenticated, upload.array('images', 10), (req, res) => {
  const { title, description, location, price } = req.body;

  let imagePathToUse;

  if (req.files && req.files.length > 0) {
    const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
    imagePathToUse = JSON.stringify(imagePaths);
  } else {
    imagePathToUse = req.body.image_url;
  }

  const sql = `
    UPDATE listings
    SET title = ?, description = ?, location = ?, price = ?, image_url = ?
    WHERE id = ?
  `;

  db.query(sql, [title, description, location, price, imagePathToUse, req.params.id], (err) => {
    if (err) {
      console.error('Update error:', err);
      return res.status(500).json({ message: 'Failed to update listing' });
    }
    res.json({ message: 'Listing updated successfully' });
  });
});

//  Delete Listing and Related Reviews
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const deleteReviewsSql = 'DELETE FROM reviews WHERE listing_id = ?';
  db.query(deleteReviewsSql, [id], (err) => {
    if (err) {
      console.error(' Error deleting reviews:', err);
      return res.status(500).json({ message: 'Failed to delete reviews' });
    }

    const deleteListingSql = 'DELETE FROM listings WHERE id = ?';
    db.query(deleteListingSql, [id], (err2) => {
      if (err2) {
        console.error(' Error deleting listing:', err2);
        return res.status(500).json({ message: 'Failed to delete listing' });
      }

      res.json({ message: 'Listing and associated reviews deleted successfully' });
    });
  });
});

export default router;
