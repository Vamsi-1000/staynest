import React from 'react';
import LogoBar from '../components/LogoBar';
import Sidebar from '../components/Sidebar';

const DashboardLayout = ({ children }) => {
  return (
    <div>
      <LogoBar />
      <Sidebar />
      <div
        style={{
          paddingTop: '60px', // LogoBar height
          paddingLeft: '80px', // Collapsed sidebar width
          backgroundColor: '#f8f9fa',
          minHeight: '100vh',
        }}
      >
        <div className="container-fluid px-4">{children}</div>
      </div>
    </div>
  );
};


export default DashboardLayout;
