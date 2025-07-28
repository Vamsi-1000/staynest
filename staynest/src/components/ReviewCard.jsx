import React from 'react';

const ReviewCard = ({ review, currentUser, onEdit, onDelete }) => {
  const isAuthor = currentUser.id === review.user_id;

  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <p className="fw-bold mb-1">{review.username}</p>
        <span className="badge bg-warning text-dark">⭐ {review.rating}</span>
        </div>
        <p className="mb-2">{review.comment}</p>

        <div className="d-flex gap-2">
          {onEdit && isAuthor && (
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => onEdit(review)}
            >
              Edit
            </button>
          )}

          {onDelete && (
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => onDelete(review)}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
