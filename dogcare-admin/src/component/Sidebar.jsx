import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Function to check login status
    const checkLoginStatus = () => {
      setIsLoggedIn(!!localStorage.getItem('userId'));
    };
  
    // Check login status every second
    const interval = setInterval(checkLoginStatus, 1000);
  
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="bg-[#FF7676] text-black flex items-center py-4 px-6">
      <div className="flex items-center gap-4 flex-grow">
      <img src="http://localhost/dogcare/uploads/logo.jpg" alt="Logo" className="rounded-full w-16 h-16 object-cover" />


        <Link to="/" className="text-2xl font-bold hover:underline">
          Dog Care
        </Link>
      </div>
      
      {isLoggedIn && (
        <div className="flex gap-6 items-center">
          <Link to="/Admin" className="hover:underline">ข้อมูล admin</Link>
          <Link to="/User" className="hover:underline">จัดการข้อมูลผู้ใช้</Link>
          <Link to="/Breed" className="hover:underline">จัดการข้อมูลสายพันธุ์</Link>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
