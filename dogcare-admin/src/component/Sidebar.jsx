import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if userId exists in localStorage on component mount
    const checkLoginStatus = () => {
      setIsLoggedIn(!!localStorage.getItem('userId'));
    };

    // Initial check
    checkLoginStatus();

    // Optionally, add event listeners or other logic to check login status updates
    // For example, if login status changes based on other events, you can update it here

    // Cleanup (if needed)
    return () => {
      // Clean up any side effects or event listeners
    };
  }, []);

  return (
    <div className="bg-red-400 text-white flex items-center py-4 px-6">
      <div className="flex items-center gap-4 flex-grow">
        <img src="https://via.placeholder.com/50" alt="Logo" className="rounded-full" />
        <Link to="/" className="text-2xl font-bold hover:underline">
          Dog Care
        </Link>
      </div>
      
      {isLoggedIn && (
        <div className="flex gap-6 items-center">
          <Link to="/Admin" className="hover:underline">ข้อมูล admin</Link>
          <Link to="/User" className="hover:underline">จัดการข้อมูลผู้ใช้</Link>
          <Link to="/Breed" className="hover:underline">จัดการข้อมูลสายพันธุ์</Link>
          <Link to="/Diseases" className="hover:underline">จัดการข้อมูลโรคของสุนัข</Link>
        </div>
      )}
      
    </div>
  );
}

export default Sidebar;
