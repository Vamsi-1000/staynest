import React from 'react';
import { Link } from 'react-router-dom';

const ListingList = ({ listings }) => {
  if (!listings || listings.length === 0) {
    return <p className="text-muted">No listings found.</p>;
  }

  return (
    <div className="row">
      {listings.map((listing) => (
        <div className="col-md-4 mb-4" key={listing.id}>
          <div className="card h-100">
            {Array.isArray(listing.image_url) && listing.image_url.length > 0 ? (
  <div
    id={`carousel-list-${listing.id}`}
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
            style={{ height: '200px', objectFit: 'cover' }}
          />
        </div>
      ))}
    </div>
    {listing.image_url.length > 1 && (
      <>
        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target={`#carousel-list-${listing.id}`}
          data-bs-slide="prev"
        >
          <span className="carousel-control-prev-icon"></span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target={`#carousel-list-${listing.id}`}
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
    alt={listing.title}
    className="card-img-top"
    style={{ height: '200px', objectFit: 'cover' }}
  />
)}

            <div className="card-body d-flex flex-column">
              <h5 className="card-title">{listing.title}</h5>
              <p className="card-text text-truncate">{listing.description}</p>
              <p className="text-muted mb-2">
                {listing.location} — ₹{listing.price}
              </p>
              <Link
                to={`/listing/${listing.id}`}
                className="btn btn-outline-primary mt-auto"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListingList;
