import React from 'react';
import ReviewForm from './ReviewForm';
import ReviewCard from './ReviewCard';

const ListingCard = ({
  listing,
  currentUser,
  visibleContacts,
  toggleContact,
  visibleReviews,
  toggleReviews,
  editingReviewId,
  setEditingReviewId,
  handleReviewUpdate,
  handleReviewDelete,
  handleReviewSubmit,
}) => {
  const isOwner = listing.user_id === currentUser?.id;

  // Ensure listing.images is parsed from JSON if stored as string
  const imagesArray = Array.isArray(listing.image_url)
    ? listing.image_url
    : typeof listing.image_url === 'string'
      ? (() => {
          try {
            return JSON.parse(listing.image_url);
          } catch (e) {
            return [];
          }
        })()
      : [];

  return (
    <div className="card h-100 shadow-sm">
      {imagesArray.length > 0 ? (
        <div id={`carousel-${listing.id}`} className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-inner">
            {imagesArray.map((img, index) => (
              <div
                key={index}
                className={`carousel-item ${index === 0 ? 'active' : ''}`}
              >
                <img
                  src={`https://staynest-backend-thd5.onrender.com${img}`}
                  className="d-block w-100"
                  alt={`Slide ${index}`}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
          {imagesArray.length > 1 && (
            <>
              <button className="carousel-control-prev" type="button" data-bs-target={`#carousel-${listing.id}`} data-bs-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              </button>
              <button className="carousel-control-next" type="button" data-bs-target={`#carousel-${listing.id}`} data-bs-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
              </button>
            </>
          )}
        </div>
      ) : (
        <div
          className="bg-secondary text-white d-flex align-items-center justify-content-center"
          style={{ height: '200px' }}
        >
          No Images Available
        </div>
      )}

      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{listing.title}</h5>
        <p className="card-text">{listing.description}</p>
        <p className="text-muted">📍 {listing.location}</p>
        <p className="fw-bold text-success mb-2">₹ {listing.price}</p>

        {/* Contact Reveal */}
        <button
          className="btn btn-outline-primary btn-sm mb-2"
          onClick={() => toggleContact(listing.id)}
        >
          For Booking - Contact
        </button>
        {visibleContacts[listing.id] && (
          <div className="text-muted small">
            {listing.email && <p>📧 Email: {listing.email}</p>}
            {listing.phone && <p>📞 Phone: {listing.phone}</p>}
          </div>
        )}

        <hr />

        {/* Review Toggle */}
        <button
          className="btn btn-outline-secondary btn-sm mb-2"
          onClick={() => toggleReviews(listing.id)}
        >
          {visibleReviews[listing.id] ? 'Hide Reviews' : 'Show Reviews'}
        </button>

        {visibleReviews[listing.id] && (
          <>
            <div className="mb-2">
              {listing.reviews && listing.reviews.length > 0 ? (
                listing.reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    currentUser={currentUser}
                    listingOwnerId={listing.user_id}
                    editingReviewId={editingReviewId}
                    setEditingReviewId={setEditingReviewId}
                    handleReviewUpdate={handleReviewUpdate}
                    handleReviewDelete={handleReviewDelete}
                  />
                ))
              ) : (
                <p className="text-muted small">No reviews yet.</p>
              )}
            </div>

            {/* Review Form */}
            <ReviewForm
              listingId={listing.id}
              onSubmit={(data) => handleReviewSubmit(listing.id, data)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ListingCard;
