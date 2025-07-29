import React, { useState } from 'react';
import axios from 'axios';

const AddListingPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('location', location);
    formData.append('price', price);

    images.forEach((img) => {
      formData.append('images', img);
    });

    try {
      const response = await axios.post('https://staynest-backend-thd5.onrender.com/api/listings/add', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Listing added:', response.data);
      window.location.href = '/listings';
    } catch (err) {
      console.error('Failed to add listing', err);
      alert(err.response?.data?.message || 'Failed to add listing');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Add New Listing</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Location</label>
          <input className="form-control" value={location} onChange={(e) => setLocation(e.target.value)} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Price</label>
          <input type="number" className="form-control" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Images</label>
          <input type="file" className="form-control" onChange={handleImageChange} multiple accept="image/*" />
        </div>

        <button type="submit" className="btn btn-primary">Add Listing</button>
      </form>
    </div>
  );
};

export default AddListingPage;
