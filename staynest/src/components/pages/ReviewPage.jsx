import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ReviewPage = () => {
  const { id: listingId } = useParams(); // listingId from URL
  const currentUser = JSON.parse(localStorage.getItem('staynest_user'));
  const [reviews, setReviews] = useState([]);
  const [listingOwnerId, setListingOwnerId] = useState(null);
  const [error, setError] = useState('');

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`https://staynest-backend-thd5.onrender.com/api/reviews/listing/${listingId}`);
      setReviews(res.data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews.');
    }
  };

  const fetchListingOwner = async () => {
    try {
      const res = await axios.get(`https://staynest-backend-thd5.onrender.com/api/listings/${listingId}`);
      setListingOwnerId(res.data.user_id);
    } catch (err) {
      console.error('Error fetching listing owner:', err);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchListingOwner();
  }, [listingId]);

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await axios.delete(`https://staynest-backend-thd5.onrender.com/api/reviews/${reviewId}`, {
        data: { userId: currentUser.id },
        withCredentials: true,
      });

      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err) {
      console.error('Failed to delete review:', err);
      setError('Failed to delete review.');
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Reviews</h3>
      {error && <div className="alert alert-danger">{error}</div>}

      {reviews.length === 0 ? (
        <p className="text-muted">No reviews yet for this listing.</p>
      ) : (
        <div className="list-group">
          {reviews.map((review) => {
            const isOwnReview = review.user_id === currentUser.id;
            const canDeleteOthersReview = !isOwnReview && listingOwnerId === currentUser.id;

            return (
              <div key={review.id} className="list-group-item mb-3 border rounded p-3 shadow-sm">
                <h5 className="mb-2">{review.user_name || 'Anonymous'}</h5>
                <p>{review.comment}</p>
                <div className="d-flex gap-2">
                  {isOwnReview && (
                    <a
                      href={`/edit-review/${review.id}`}
                      className="btn btn-sm btn-outline-primary"
                    >
                      Edit
                    </a>
                  )}
                  {(isOwnReview || canDeleteOthersReview) && (
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="btn btn-sm btn-outline-danger"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReviewPage;
