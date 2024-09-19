import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Sidebar from './component/Sidebar';
import MainContent from './component/Maincontent';
import Admin from './component/Admin'; 
import User from './component/user'; 
import Breed from './component/breed'; 
import Login from './component/Login';
import AddBreed from './component/addbreed';
import Diseases from './component/diseases';
import AddDiseases from './component/adddiseases';

// PrivateRoute component to handle protected routes
const PrivateRoute = ({ element, ...rest }) => {
  const isLoggedIn = !!localStorage.getItem('userId');
  return isLoggedIn ? element : <Navigate to="/Login" />;
};

function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content with Routes */}
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<PrivateRoute element={<MainContent />} />} />
            <Route path="/Admin" element={<PrivateRoute element={<Admin />} />} />
            <Route path="/User" element={<PrivateRoute element={<User />} />} />
            <Route path="/Breed" element={<PrivateRoute element={<Breed />} />} />
            <Route path="/Diseases" element={<PrivateRoute element={<Diseases />} />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/addbreed" element={<AddBreed />} />
            <Route path="/adddiseases" element={<AddDiseases />} />

          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
