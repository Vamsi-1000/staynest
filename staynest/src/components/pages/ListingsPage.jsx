import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReviewCard from '../ReviewCard';
import ReviewForm from '../ReviewForm';

const ListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleContacts, setVisibleContacts] = useState({});
  const [visibleReviews, setVisibleReviews] = useState({});
  const [editingReviewId, setEditingReviewId] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem('staynest_user'));

  useEffect(() => {
  if (!currentUser) {
    navigate('/login', { replace: true });
  }
}, [currentUser]);


  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const { data: listings } = await axios.get('https://staynest-backend-thd5.onrender.com/api/listings', { withCredentials: true });
      const enriched = await Promise.all(
        listings.map(async (listing) => {
          try {
            const { data } = await axios.get(`https://staynest-backend-thd5.onrender.com/api/reviews/${listing.id}`, { withCredentials: true });
            return { ...listing, reviews: data.reviews };
          } catch {
            return { ...listing, reviews: [] };
          }
        })
      );
      setListings(enriched);
    } catch (err) {
      console.error('Error fetching listings:', err);
    }
  };

  const toggleContact = (id) => {
    setVisibleContacts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleReviews = (id) => {
    setVisibleReviews((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleReviewDelete = async (reviewId, listingId) => {
    try {
      await axios.delete(`https://staynest-backend-thd5.onrender.com/api/reviews/${reviewId}`, {
        data: { userId: currentUser.id },
        withCredentials: true,
      });
      setListings((prev) =>
        prev.map((l) =>
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
      setListings((prev) =>
        prev.map((l) =>
          l.id === listingId
            ? {
                ...l,
                reviews: l.reviews.map((r) =>
                  r.id === reviewId ? { ...r, comment, rating, username: r.username } : r
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

  const handleReviewSubmit = async (listingId, { comment, rating }) => {
    try {
      const { data } = await axios.post(
        'https://staynest-backend-thd5.onrender.com/api/reviews/add',
        {
          user_id: currentUser.id,
          listing_id: listingId,
          comment,
          rating,
        },
        { withCredentials: true }
      );
      setListings((prev) =>
        prev.map((l) =>
          l.id === listingId
            ? { ...l, reviews: [...(l.reviews || []), data.review] }
            : l
        )
      );
    } catch (err) {
      console.error('Error submitting review:', err.response?.data || err.message);
    }
  };

  const filteredListings = listings.filter((listing) =>
  listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  listing.username?.toLowerCase().includes(searchTerm.toLowerCase())
);


  return (
    <div className="container mt-4">
      <h2 className="mb-4">Explore Listings</h2>

      <input
        type="text"
        className="form-control"
        placeholder="Search by title or owner name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      /> &nbsp;


      {filteredListings.length === 0 ? (
        <p className="text-muted">No listings found.</p>
      ) : (
        <div className="row">
          {filteredListings.map((listing) => (
            <div className="col-md-6 mb-4" key={listing.id}>
              <div className="card h-100 shadow-sm">
                <div id={`carousel-${listing.id}`} className="carousel slide" data-bs-ride="carousel">
  <div className="carousel-inner">
    {listing.image_url.map((img, idx) => (
      <div className={`carousel-item ${idx === 0 ? 'active' : ''}`} key={idx}>
        <img
          src={`https://staynest-backend-thd5.onrender.com${img}`}
          className="d-block w-100"
          alt={`Slide ${idx}`}
          style={{ height: '200px', objectFit: 'cover' }}
        />
      </div>
    ))}
  </div>
  {listing.image_url.length > 1 && (
    <>
      <button className="carousel-control-prev" type="button" data-bs-target={`#carousel-${listing.id}`} data-bs-slide="prev">
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button className="carousel-control-next" type="button" data-bs-target={`#carousel-${listing.id}`} data-bs-slide="next">
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </>
  )}
</div>

                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{listing.title}</h5>
                  <p className="card-text">{listing.description}</p>
                  <p className="text-muted">📍 {listing.location}</p>
                  <p className="fw-bold text-success mb-2">₹ {listing.price}</p>
                  <p className="text-muted small">👤 Listed by: {listing.username}</p>

                  <button
                    className="btn btn-outline-primary btn-sm mb-2"
                    onClick={() => toggleContact(listing.id)}
                  >
                    For Booking - Contact
                  </button>
                  {visibleContacts[listing.id] && (
                    <div className="text-muted small mb-2">
                      {listing.email && <p>📧 Email: {listing.email}</p>}
                      {listing.phone && <p>📞 Phone: {listing.phone}</p>}
                    </div>
                  )}

                  <button
                    className="btn btn-outline-secondary btn-sm mb-2"
                    onClick={() => toggleReviews(listing.id)}
                  >
                    {visibleReviews[listing.id] ? 'Hide Reviews' : 'Show Reviews'}
                  </button>

                  {visibleReviews[listing.id] && (
                    <div className="mt-2">
                      <h6>Reviews</h6>
                      {listing.reviews && listing.reviews.length > 0 ? (
                        listing.reviews.map((review) =>
                          editingReviewId === review.id ? (
                            <ReviewForm
                              key={review.id}
                              initialData={{ comment: review.comment, rating: review.rating }}
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
                                  ? () => handleReviewDelete(review.id, listing.id)
                                  : null
                              }
                            />
                          )
                        )
                      ) : (
                        <p className="text-muted">No reviews yet.</p>
                      )}

                      <ReviewForm
                        listingId={listing.id}
                        onSubmit={(data) => handleReviewSubmit(listing.id, data)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListingsPage;
