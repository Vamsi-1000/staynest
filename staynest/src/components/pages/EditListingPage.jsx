import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
  });
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  useEffect(() => {
    fetchListing();
  }, []);

  const fetchListing = async () => {
    try {
      const res = await axios.get(`https://staynest-backend-thd5.onrender.com/api/listings/${id}`);
      const listing = res.data;
      setFormData({
        title: listing.title,
        description: listing.description,
        location: listing.location,
        price: listing.price,
      });

      const parsedImages = Array.isArray(listing.image_url) ? 
      listing.image_url: JSON.parse(listing.image_url || '[]');


      setExistingImages(parsedImages);
    } catch (err) {
      console.error('Error fetching listing:', err);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageChange = (e) => {
    setNewImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append('title', formData.title);
      form.append('description', formData.description);
      form.append('location', formData.location);
      form.append('price', formData.price);
      form.append('image_url', JSON.stringify(existingImages));

      newImages.forEach(image => form.append('images', image));

      await axios.put(`https://staynest-backend-thd5.onrender.com/api/listings/${id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      alert('Listing updated!');
      navigate('/my-listings');
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update listing');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Edit Listing</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input name="title" className="form-control" value={formData.title} onChange={handleInputChange} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea name="description" className="form-control" rows="4" value={formData.description} onChange={handleInputChange} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Location</label>
          <input name="location" className="form-control" value={formData.location} onChange={handleInputChange} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Price</label>
          <input name="price" type="number" className="form-control" value={formData.price} onChange={handleInputChange} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Current Images</label>
          <div className="d-flex gap-3 flex-wrap">
            {existingImages.map((img, idx) => (
              <img
  key={idx}
  src={img.startsWith('http') ? img : `https://staynest-backend-thd5.onrender.com/${img}`}
  alt={`preview-${idx}`}
  width="150"
  height="100"
  style={{ objectFit: 'cover', borderRadius: '8px' }}
/>

  ))}
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Upload New Images (optional)</label>
          <input type="file" className="form-control" multiple onChange={handleImageChange} />
        </div>

        <button type="submit" className="btn btn-primary">Update Listing</button>
      </form>
    </div>
  );
}

export default EditListingPage;
