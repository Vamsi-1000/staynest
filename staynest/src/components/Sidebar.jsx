import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('staynest_user');
    if (isLoggedIn) setCollapsed(true); // default to collapsed
  }, []);

  const handleLogout = async () => {
  try {
    await fetch('https://staynest-backend-thd5.onrender.com/api/auth/logout', {
      method: 'POST',
      credentials: 'include', // important to send session cookie
    });

    localStorage.removeItem('staynest_user');
    sessionStorage.clear();

    navigate('/login', { replace: true });
    window.location.reload(); // force React to re-check session
  } catch (err) {
    console.error('Logout failed:', err);
  }
};



  const handleNavClick = () => {
    if (window.innerWidth > 768) {
      setCollapsed(true); // auto-collapse on desktop
    }
  };

  return (
    <>
      <button
        className="toggle-btn btn btn-light"
        onClick={() => setCollapsed(!collapsed)}
      >
        <i className="bi bi-list"></i>
      </button>

      <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="logo-container py-3">
          {collapsed ? (
            <div className="sn-logo">SN</div>
          ) : (
            <div className="staynest-logo px-3 py-2">Stay Nest</div>
          )}
        </div>

        <NavLink to="/listings" className="nav-link" onClick={handleNavClick}>
          <i className="bi bi-house-door-fill sidebar-icon"></i> &nbsp;&nbsp;&nbsp;
          {!collapsed && <span className="link-label">Listings</span>} 
        </NavLink>

        <NavLink to="/add" className="nav-link" onClick={handleNavClick}>
          <i className="bi bi-plus-square-fill sidebar-icon"></i> &nbsp;&nbsp;&nbsp;
          {!collapsed && <span className="link-label">Add Listing</span>}
        </NavLink>

        <NavLink to="/my-listings" className="nav-link" onClick={handleNavClick}>
          <i className="bi bi-person-lines-fill sidebar-icon"></i> &nbsp;&nbsp;&nbsp;
         {!collapsed && <span className="link-label">My Profile</span>}
        </NavLink>

        <button className="logout-btn" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i>
          {!collapsed && <span className="link-label">Logout</span>}
        </button>
      </div>
    </>
  );
};

export default Sidebar;
