import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ListingForm from '../ListingForm'; // adjust path if necessary

const EditListingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listingData, setListingData] = useState(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await axios.get(`https://staynest-backend-thd5.onrender.com/api/listings/${id}`);
        const listing = res.data;

        // Parse image_url safely
        let image_url = listing.image_url;
        if (typeof image_url === 'string') {
          try {
            image_url = JSON.parse(image_url);
          } catch {
            image_url = [image_url];
          }
        }

        setListingData({ ...listing, image_url });
      } catch (err) {
        console.error('Error fetching listing:', err);
      }
    };

    fetchListing();
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      await axios.put(`https://staynest-backend-thd5.onrender.com/api/listings/${id}`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
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
      {listingData ? (
        <ListingForm
          listingData={listingData}
          onSubmit={handleUpdate}
          isEditing={true}
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default EditListingPage;
