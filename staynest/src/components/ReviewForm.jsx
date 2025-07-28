import React, { useState } from 'react';

const ReviewForm = ({ initialData, onSubmit, onCancel }) => {
  const [rating, setRating] = useState(initialData?.rating || '');
  const [comment, setComment] = useState(initialData?.comment || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating || !comment.trim()) return;
    onSubmit({ rating, comment });
  };

  return (
    <form onSubmit={handleSubmit} className="card p-3 mb-4 shadow-sm">
      <h5 className="mb-3">{initialData ? 'Edit Review' : 'Add Review'}</h5>

      <div className="mb-3">
        <label htmlFor="rating" className="form-label">Rating (1-5)</label>
        <input
          type="number"
          id="rating"
          className="form-control"
          min="1"
          max="5"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="comment" className="form-label">Comment</label>
        <textarea
          id="comment"
          className="form-control"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="3"
          required
        ></textarea>
      </div>

      <div className="d-flex justify-content-end gap-2">
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary">
          {initialData ? 'Update' : 'Submit'}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
