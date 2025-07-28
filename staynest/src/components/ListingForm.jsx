import React, { useState } from 'react';

const ListingForm = ({ listingData = {}, onSubmit, isEditing = false }) => {
  const [title, setTitle] = useState(listingData.title || '');
  const [description, setDescription] = useState(listingData.description || '');
  const [location, setLocation] = useState(listingData.location || '');
  const [price, setPrice] = useState(listingData.price || '');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(listingData.image_url || '');

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('location', location);
    formData.append('price', price);

    if (imageFile) {
      formData.append('image', imageFile);
    } else {
      formData.append('image_url', imageUrl);
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <div className="mb-3">
        <label className="form-label">Title</label>
        <input
          type="text"
          className="form-control"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Description</label>
        <textarea
          className="form-control"
          rows="4"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Location</label>
        <input
          type="text"
          className="form-control"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Price (USD)</label>
        <input
          type="number"
          className="form-control"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Upload Image</label>
        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
        />
        {isEditing && imageUrl && (
          <div className="form-text mt-1">
            Current Image: <a href={imageUrl} target="_blank" rel="noopener noreferrer">View</a>
          </div>
        )}
      </div>

      <button type="submit" className="btn btn-success w-100">
        {isEditing ? 'Update Listing' : 'Add Listing'}
      </button>
    </form>
  );
};

export default ListingForm;
