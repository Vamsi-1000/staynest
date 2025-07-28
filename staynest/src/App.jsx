import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

import SignupForm from './components/SignupForm';
import LoginForm from './components/LoginForm';
import ListingsPage from './components/pages/ListingsPage';
import DashboardLayout from './layouts/DashboardLayout';
import ReviewPage from './components/pages/ReviewPage';
import AddListingPage from './components/pages/AddListingPage';
import MyListingsPage from './components/pages/MyListingsPage';
import EditListingPage from './components/pages/EditListingPage';

axios.defaults.withCredentials = true;

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await axios.get('https://staynest-backend-thd5.onrender.com/api/auth/check');
        localStorage.setItem('staynest_user', JSON.stringify(res.data.user));
        setCurrentUser(res.data.user);
      } catch {
        localStorage.removeItem('staynest_user');
        setCurrentUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    verifySession();
  }, []);

  const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('staynest_user');
  if (checkingAuth) {
    return <div className="text-center mt-5">Checking session...</div>;
  }
  if (!user || !currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};


  return (
    <Router>
      <Routes>
        {/* Login */}
        <Route
          path="/login"
          element={
            currentUser ? (
              <Navigate to="/listings" />
            ) : (
              <div className="container d-flex justify-content-center align-items-center vh-100">
                <LoginForm setCurrentUser={setCurrentUser} />
              </div>
            )
          }
        />

        {/* Signup */}
        <Route
          path="/register"
          element={
            <div className="container d-flex justify-content-center align-items-center vh-100">
              <SignupForm />
            </div>
          }
        />

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Listings Page */}
        <Route
          path="/listings"
          element={
            <ProtectedRoute>
              <DashboardLayout setCurrentUser={setCurrentUser}>
                <ListingsPage currentUser={currentUser} />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Add Listing */}
        <Route
          path="/add"
          element={
            <ProtectedRoute>
              <DashboardLayout setCurrentUser={setCurrentUser}>
                <AddListingPage currentUser={currentUser} />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* My Listings */}
        <Route
          path="/my-listings"
          element={
            <ProtectedRoute>
              <DashboardLayout setCurrentUser={setCurrentUser}>
                <MyListingsPage currentUser={currentUser} />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Edit Listing */}
        <Route
          path="/edit-listing/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout setCurrentUser={setCurrentUser}>
                <EditListingPage currentUser={currentUser} />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Reviews Page */}
        <Route
          path="/reviews/:listingId"
          element={
            <ProtectedRoute>
              <DashboardLayout setCurrentUser={setCurrentUser}>
                <ReviewPage currentUser={currentUser} />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<div className="text-center mt-5">404 - Page Not Found</div>} />

      </Routes>
    </Router>
  );
};

export default App;
