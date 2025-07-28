import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import ReviewCard from '../ReviewCard';
import ReviewForm from '../ReviewForm';

const MyListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [visibleReviews, setVisibleReviews] = useState({});
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Load user on mount
  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('staynest_user'));
      if (storedUser) {
        setCurrentUser(storedUser);
      } else {
        throw new Error('No user');
      }
    } catch {
      localStorage.removeItem('staynest_user');
      navigate('/login', { replace: true });
    }
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) return;
    loadMyListings();
  }, [currentUser]);

  const loadMyListings = async () => {
    try {
      const { data: userListings } = await axios.get(`https://staynest-backend-thd5.onrender.com/api/listings/user/${currentUser.id}`, {
        withCredentials: true,
      });

      const enriched = await Promise.all(
        userListings.map(async (listing) => {
          try {
            const { data } = await axios.get(`https://staynest-backend-thd5.onrender.com/api/reviews/${listing.id}`, {
              withCredentials: true,
            });
            return { ...listing, reviews: data.reviews };
          } catch {
            return { ...listing, reviews: [] };
          }
        })
      );

      setListings(enriched);
    } catch (err) {
      console.error('Error loading your listings:', err);
    }
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profileImage', file);
    formData.append('userId', currentUser.id);

    try {
      const { data } = await axios.post('https://staynest-backend-thd5.onrender.com/api/users/profile-pic', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      const updatedUser = { ...currentUser, profile_image_url: data.image_url };
      localStorage.setItem('staynest_user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      window.location.reload();
    } catch (err) {
      console.error('Error uploading profile image:', err.response?.data || err.message);
      alert('Failed to upload profile picture.');
    }
  };

  const toggleReviews = (id) =>
    setVisibleReviews((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleDeleteListing = async (id) => {
    if (!window.confirm('Delete this listing and all its reviews?')) return;
    try {
      await axios.delete(`https://staynest-backend-thd5.onrender.com/api/listings/${id}`, {
        data: { userId: currentUser.id },
        withCredentials: true,
      });
      setListings((l) => l.filter((ls) => ls.id !== id));
    } catch (err) {
      console.error('Error deleting listing:', err);
    }
  };

  const handleDeleteReview = async (reviewId, listingId) => {
    try {
      await axios.delete(`https://staynest-backend-thd5.onrender.com/api/reviews/${reviewId}`, {
        data: { userId: currentUser.id },
        withCredentials: true,
      });
      setListings((ls) =>
        ls.map((l) =>
          l.id === listingId
            ? { ...l, reviews: l.reviews.filter((r) => r.id !== reviewId) }
            : l
        )
      );
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  const handleReviewUpdate = async (reviewId, listingId, { comment, rating }) => {
    try {
      await axios.put(
        `https://staynest-backend-thd5.onrender.com/api/reviews/${reviewId}`,
        { comment, rating },
        { withCredentials: true }
      );
      setListings((ls) =>
        ls.map((l) =>
          l.id === listingId
            ? {
                ...l,
                reviews: l.reviews.map((r) =>
                  r.id === reviewId ? { ...r, comment, rating } : r
                ),
              }
            : l
        )
      );
      setEditingReviewId(null);
    } catch (err) {
      console.error('Error updating review:', err);
    }
  };

  const handleReviewAdd = async (listingId, { comment, rating }) => {
    try {
      const { data } = await axios.post(
        `https://staynest-backend-thd5.onrender.com/api/reviews/add`,
        {
          user_id: currentUser.id,
          listing_id: listingId,
          rating,
          comment,
        },
        { withCredentials: true }
      );
      setListings((ls) =>
        ls.map((l) =>
          l.id === listingId
            ? { ...l, reviews: [...(l.reviews || []), data.review] }
            : l
        )
      );
    } catch (err) {
      console.error('Error adding review:', err.response?.data || err.message);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="container mt-4">
      {/* Profile Section */}
      <div className="d-flex align-items-center mb-4 p-3 bg-light rounded shadow-sm">
        <div className="position-relative me-3">
          <img
            src={
              currentUser.profile_image_url
                ? `https://staynest-backend-thd5.onrender.com${currentUser.profile_image_url}`
                : `https://i.pravatar.cc/150?u=${currentUser.id}`
            }
            alt="Profile"
            className="rounded-circle"
            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
          />
          <label
            htmlFor="profileUpload"
            className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-1"
            style={{ cursor: 'pointer', fontSize: '0.8rem' }}
            title="Change photo"
          >
            <i className="bi bi-camera-fill"></i>
          </label>
          <input
            type="file"
            id="profileUpload"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleProfilePicUpload}
          />
        </div>
        <div>
          <h5 className="mb-1">{currentUser.name}</h5>
          <p className="mb-0 text-muted">
            {currentUser.email} | {currentUser.phone}
          </p>
        </div>
      </div>

      <h2 className="mb-4">My Listings</h2>

      {listings.length === 0 ? (
        <p className="text-muted">You haven't added any listings yet.</p>
      ) : (
        <div className="row">
          {listings.map((listing) => (
            <div key={listing.id} className="col-md-6 mb-4">
              <div className="card h-100">
                {Array.isArray(listing.image_url) && listing.image_url.length > 0 ? (
                  <div
                    id={`carousel-${listing.id}`}
                    className="carousel slide"
                    data-bs-ride="carousel"
                  >
                    <div className="carousel-inner">
                      {listing.image_url.map((img, index) => (
                        <div
                          key={index}
                          className={`carousel-item ${index === 0 ? 'active' : ''}`}
                        >
                          <img
                            src={`https://staynest-backend-thd5.onrender.com${img}`}
                            className="d-block w-100"
                            alt={`Slide ${index + 1}`}
                            style={{ height: 200, objectFit: 'cover' }}
                          />
                        </div>
                      ))}
                    </div>
                    {listing.image_url.length > 1 && (
                      <>
                        <button
                          className="carousel-control-prev"
                          type="button"
                          data-bs-target={`#carousel-${listing.id}`}
                          data-bs-slide="prev"
                        >
                          <span className="carousel-control-prev-icon"></span>
                        </button>
                        <button
                          className="carousel-control-next"
                          type="button"
                          data-bs-target={`#carousel-${listing.id}`}
                          data-bs-slide="next"
                        >
                          <span className="carousel-control-next-icon"></span>
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <img
                    src={`https://staynest-backend-thd5.onrender.com${listing.image_url}`}
                    className="card-img-top"
                    alt={listing.title}
                    style={{ height: 200, objectFit: 'cover' }}
                  />
                )}

                <div className="card-body d-flex flex-column">
                  <h5>{listing.title}</h5>
                  <p>{listing.description}</p>
                  <p className="text-muted">
                    {listing.location} — ₹{listing.price}
                  </p>

                  <button
                    className="btn btn-outline-secondary btn-sm mb-2"
                    onClick={() => toggleReviews(listing.id)}
                  >
                    {visibleReviews[listing.id] ? 'Hide Reviews' : 'Show Reviews'}
                  </button>

                  {visibleReviews[listing.id] && (
                    <div className="mt-auto">
                      <h6>Reviews</h6>
                      {listing.reviews.length === 0 ? (
                        <p className="text-muted">No reviews yet.</p>
                      ) : (
                        listing.reviews.map((review) =>
                          editingReviewId === review.id ? (
                            <ReviewForm
                              key={review.id}
                              initialData={{
                                comment: review.comment,
                                rating: review.rating,
                              }}
                              onSubmit={(data) =>
                                handleReviewUpdate(review.id, listing.id, data)
                              }
                              onCancel={() => setEditingReviewId(null)}
                            />
                          ) : (
                            <ReviewCard
                              key={review.id}
                              review={review}
                              currentUser={currentUser}
                              onEdit={
                                review.user_id === currentUser?.id
                                  ? () => setEditingReviewId(review.id)
                                  : null
                              }
                              onDelete={
                                review.user_id === currentUser?.id ||
                                listing.user_id === currentUser?.id
                                  ? () =>
                                      handleDeleteReview(review.id, listing.id)
                                  : null
                              }
                            />
                          )
                        )
                      )}
                      <ReviewForm onSubmit={(data) => handleReviewAdd(listing.id, data)} />
                    </div>
                  )}

                  <div className="mt-auto d-flex justify-content-between">
                    <Link
                      to={`/edit-listing/${listing.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      Edit
                    </Link>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteListing(listing.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListingsPage;
