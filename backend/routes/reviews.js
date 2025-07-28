import express from 'express';
import db from '../config/db.js';

const router = express.Router();

//  GET all reviews for a listing
router.get('/:listingId', (req, res) => {
  const { listingId } = req.params;
  const sql = `
    SELECT r.*, u.name AS username, l.user_id AS listingOwnerId
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    JOIN listings l ON r.listing_id = l.id
    WHERE r.listing_id = ?
  `;

  db.query(sql, [listingId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching reviews' });

    const listingOwnerId = results.length > 0 ? results[0].listingOwnerId : null;
    res.json({ reviews: results, listingOwnerId });
  });
});

// POST a new review
router.post('/add', (req, res) => {
  const { user_id, listing_id, rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5 || !comment.trim()) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  const insertSql = 'INSERT INTO reviews (user_id, listing_id, rating, comment) VALUES (?, ?, ?, ?)';
  db.query(insertSql, [user_id, listing_id, rating, comment], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error inserting review' });

    const insertedReview = {
      id: result.insertId,
      user_id,
      listing_id,
      rating,
      comment,
      created_at: new Date()
    };
    res.json({ message: 'Review added', review: insertedReview });
  });
});

// PUT edit review
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  const updateSql = 'UPDATE reviews SET rating = ?, comment = ? WHERE id = ?';
  db.query(updateSql, [rating, comment, id], (err) => {
    if (err) return res.status(500).json({ message: 'Error updating review' });
    res.json({ message: 'Review updated' });
  });
});

//  DELETE a single review (author or listing owner)
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const requesterId = req.body.userId;

  const fetchSql = `
    SELECT r.*, l.user_id AS listingOwnerId 
    FROM reviews r 
    JOIN listings l ON r.listing_id = l.id 
    WHERE r.id = ?
  `;

  db.query(fetchSql, [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const review = results[0];
    if (requesterId !== review.user_id && requesterId !== review.listingOwnerId) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    db.query('DELETE FROM reviews WHERE id = ?', [id], (err) => {
      if (err) return res.status(500).json({ message: 'Error deleting review' });
      res.json({ message: 'Review deleted' });
    });
  });
});

// DELETE all reviews for a listing
router.delete('/by-listing/:listingId', (req, res) => {
  const { listingId } = req.params;
  db.query('DELETE FROM reviews WHERE listing_id = ?', [listingId], (err) => {
    if (err) return res.status(500).json({ message: 'Error deleting listing reviews' });
    res.json({ message: 'All reviews deleted for listing' });
  });
});

export default router;