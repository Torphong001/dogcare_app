import React, { useState, useEffect } from 'react';
import { FaUser, FaUsers, FaDog } from 'react-icons/fa';
import axios from 'axios';

function MainContent() {
  const [userCount, setUserCount] = useState(0);
  const [breedCount, setBreedCount] = useState(0);
  const [dogCount, setDogCount] = useState(0);

  useEffect(() => {
    // Fetch user count
    axios.get('http://localhost/dogcare/admin/usercount.php')
      .then(response => {
        setUserCount(response.data.count);
      })
      .catch(error => {
        console.error('Error fetching user count:', error);
      });

    // Fetch breed count
    axios.get('http://localhost/dogcare/admin/breedcount.php')
      .then(response => {
        setBreedCount(response.data.count);
      })
      .catch(error => {
        console.error('Error fetching breed count:', error);
      });

    // Fetch dog count
    axios.get('http://localhost/dogcare/admin/petcount.php')
      .then(response => {
        setDogCount(response.data.count);
      })
      .catch(error => {
        console.error('Error fetching dog count:', error);
      });
  }, []);

  return (
    <div className="w-4/5 bg-gray-100 p-10 flex flex-wrap gap-6">
      <div className="bg-white border-2 border-red-400 rounded-lg shadow-lg p-6 text-center w-1/4">
        <FaUser className="text-4xl mb-4 mx-auto" />
        <p className="text-3xl font-bold">{userCount}</p>
        <p>จำนวนผู้ใช้ทั้งหมด</p>
      </div>
      <div className="bg-white border-2 border-red-400 rounded-lg shadow-lg p-6 text-center w-1/4">
        <FaUsers className="text-4xl mb-4 mx-auto" />
        <p className="text-3xl font-bold">{breedCount}</p>
        <p>จำนวนสายพันธุ์ทั้งหมด</p>
      </div>
      <div className="bg-white border-2 border-red-400 rounded-lg shadow-lg p-6 text-center w-1/4">
        <FaDog className="text-4xl mb-4 mx-auto" />
        <p className="text-3xl font-bold">{dogCount}</p>
        <p>จำนวนสุนัขของผู้ใช้ทั้งหมด</p>
      </div>
    </div>
  );
}

export default MainContent;