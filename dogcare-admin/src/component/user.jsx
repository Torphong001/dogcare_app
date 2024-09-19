import React, { useState, useEffect } from 'react';
import { IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import EditUserModal from './edituser'; // Import the EditUserModal component

function User() {
  const [users, setUsers] = useState([]); // Initialize users state
  const [error, setError] = useState(null); // Error state
  const [selectedUser, setSelectedUser] = useState(null); // Selected user for editing
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal open state
  const getStatusText = (status) => {
    switch (status) {
      case 'A':
        return 'แอดมิน'; // Admin
      case 'F':
        return 'ถูกระงับการใช้งาน'; // Suspended
      case 'U':
        return 'ผู้ใช้งานทั่วไป'; // Regular user
      case null:
        return 'ผู้ใช้งานทั่วไป'; // Regular user
      default:
        return 'Unknown'; // Fallback text
    }
  };
  // Fetch users on component mount
  useEffect(() => {
    axios.get('http://localhost/dogcare/admin/user.php')
      .then((response) => {
        if (Array.isArray(response.data)) {
          setUsers(response.data); // Set users if response is an array
        } else {
          setError('Invalid data format from API');
        }
      })
      .catch((error) => {
        setError('Network error');
      });
  }, []);

  // Handle edit button click - open modal
  const handleEditClick = (user) => {
    setSelectedUser(user); // Set selected user data for editing
    setIsModalOpen(true);  // Open modal
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  // Handle user data update
  const handleUserUpdated = () => {
    // Refresh users data after update
    axios.get('http://localhost/dogcare/admin/user.php')
      .then((response) => {
        if (Array.isArray(response.data)) {
          setUsers(response.data); // Set users if response is an array
        }
      })
      .catch((error) => {
        setError('Network error');
      });
    setIsModalOpen(false); // Close modal after updating
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>ข้อมูลผู้ใช้</h1>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Telephone</TableCell>
              <TableCell>Line ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Picture</TableCell>
              <TableCell>Edit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell>{user.user_id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.firstname}</TableCell>
                  <TableCell>{user.lastname}</TableCell>
                  <TableCell>{user.tel}</TableCell>
                  <TableCell>{user.line_id}</TableCell>
                  <TableCell>{getStatusText(user.status)}</TableCell>
                  <TableCell>
                    {user.picture ? (
                      <img src={user.picture} alt={user.username} width="50" height="50" />
                    ) : (
                      'No Picture'
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditClick(user)}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9}>No users found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit User Modal */}
      {selectedUser && (
        <EditUserModal
          open={isModalOpen}
          onClose={handleModalClose}
          userData={selectedUser}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </div>
  );
}

export default User;
