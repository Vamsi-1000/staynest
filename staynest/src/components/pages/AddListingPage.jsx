import React from 'react';
import axios from 'axios';
import ListingForm from '../ListingForm'; // adjust path if needed

const AddListingPage = () => {
  const handleAddListing = async (formData) => {
    try {
      // Optional: log to debug mobile form data
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await axios.post(
        'https://staynest-backend-thd5.onrender.com/api/listings/add',
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
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
      <ListingForm onSubmit={handleAddListing} />
    </div>
  );
};

export default AddListingPage;
