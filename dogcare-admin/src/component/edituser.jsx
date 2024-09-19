import React, { useState, useEffect } from 'react';
import { Modal, Box, TextField, Button, MenuItem } from '@mui/material';
import axios from 'axios';

function EditUserModal({ open, onClose, userData, onUserUpdated }) {
  const [formData, setFormData] = useState({
    user_id: '',
    username: '',
    firstname: '',
    lastname: '',
    tel: '',
    line_id: '',
    status: ''
  });

  useEffect(() => {
    if (userData) {
      // Pre-fill form with user data when the modal opens
      setFormData({
        user_id: userData.user_id,
        username: userData.username,
        firstname: userData.firstname,
        lastname: userData.lastname,
        tel: userData.tel,
        line_id: userData.line_id,
        status: userData.status || '' // Set status to empty string if it's null
      });
    }
  }, [userData]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = () => {
    console.log(formData);
    axios.post('http://localhost/dogcare/admin/edituser.php', formData)
      .then((response) => {
        if (response.data.success) {
          onUserUpdated(); // Call the parent callback to update the UI
          onClose(); // Close the modal after a successful update
        } else {
          alert(response.data.message || 'Failed to update user.');
        }
      })
      .catch((error) => {
        console.error('Error updating user:', error);
        alert('Network error.');
      });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4
      }}>
        <h2>Edit User</h2>

        <TextField
          fullWidth
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="First Name"
          name="firstname"
          value={formData.firstname}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Last Name"
          name="lastname"
          value={formData.lastname}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Telephone"
          name="tel"
          value={formData.tel}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Line ID"
          name="line_id"
          value={formData.line_id}
          onChange={handleChange}
          margin="normal"
        />

        {/* Dropdown for Status */}
        <TextField
          select
          fullWidth
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          margin="normal"
        >
          <MenuItem value="A">แอดมิน</MenuItem>
          <MenuItem value="U">ผู้ใช้งานทั่วไป</MenuItem>
          <MenuItem value="F">ระงับการใช้งาน</MenuItem>
        </TextField>

        <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 2 }}>
          Save
        </Button>
      </Box>
    </Modal>
  );
}

export default EditUserModal;
