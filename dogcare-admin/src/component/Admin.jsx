import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Button, Typography, Avatar, CircularProgress, Alert, Box, Modal, TextField, Snackbar, Alert as MuiAlert
} from '@mui/material';

const User = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // State for storing image preview
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
    navigate('/Login');
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedFile(null);
    setImagePreview(null); // Reset image preview when closing modal
  };

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      axios.get(`http://localhost/dogcare/admin/getuser.php?user_id=${userId}`)
        .then((response) => {
          if (response.data.success !== false) {
            setUser(response.data);
            setEditData(response.data);
            setImagePreview(response.data.picture ? `http://localhost/dogcare/uploads/${response.data.picture}` : null);
          } else {
            setError(response.data.message || 'Error fetching user data');
          }
        })
        .catch((error) => {
          console.error('Error fetching the user:', error);
          setError('Network error');
        });
    } else {
      setError('No user ID found in localStorage');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file)); // Set image preview to the selected file
    }
  };

  const handleUpdateUser = () => {
    const userId = localStorage.getItem('userId');
    const dataToUpdate = { ...editData, user_id: userId };
    const formData = new FormData();

    Object.keys(dataToUpdate).forEach(key => {
      formData.append(key, dataToUpdate[key]);
    });

    if (selectedFile) {
      formData.append('picture', selectedFile);
    }

    axios.post('http://localhost/dogcare/admin/editadmin.php', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((response) => {
      if (response.data.success) {
        setUser((prevUser) => ({
          ...prevUser,
          ...editData,
          picture: selectedFile ? response.data.picture : prevUser.picture
        }));
        setSnackbarMessage('อัพเดทข้อมูลสำเร็จ!');
        setSnackbarOpen(true);
        handleClose();
      } else {
        setSnackbarMessage(response.data.message || 'อัพเดทข้อมูลไม่สำเร็จ!');
        setSnackbarOpen(true);
        handleClose();
      }
    })
    .catch((error) => {
      console.error('Error updating user:', error);
      alert('Network error');
    });
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!user) {
    return <CircularProgress />;
  }

  return (
    <Paper sx={{ padding: 4, maxWidth: 600, margin: 'auto', mt: 5, boxShadow: 3 }}>
      <Box display="flex" alignItems="center" flexDirection="column">
        <Avatar 
          key={imagePreview || user.picture ? `http://localhost/dogcare/uploads/${imagePreview || user.picture}` : 'default-avatar'}
          src={imagePreview || (user.picture ? `http://localhost/dogcare/uploads/${user.picture}` : 'https://via.placeholder.com/150')}
          alt={user.username} 
          sx={{ width: 100, height: 100, mb: 3 }} 
        />
        <Typography variant="h4" gutterBottom>ข้อมูลผู้ใช้</Typography>
      </Box>
      <TableContainer component={Paper} sx={{ marginBottom: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell><Typography variant="subtitle1">ชื่อ</Typography></TableCell>
              <TableCell>{user.firstname}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><Typography variant="subtitle1">นามสกุล</Typography></TableCell>
              <TableCell>{user.lastname}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><Typography variant="subtitle1">เบอร์โทรศัพท์</Typography></TableCell>
              <TableCell>{user.tel}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><Typography variant="subtitle1">ไอดีไลน์</Typography></TableCell>
              <TableCell>{user.line_id}</TableCell>
            </TableRow>
            
          </TableBody>
        </Table>
      </TableContainer>

      <Button variant="contained" color="primary" onClick={handleOpen} sx={{ mb: 2 }}>
        แก้ไขข้อมูล
      </Button>

      <Button variant="contained" color="error" onClick={handleLogout} sx={{ display: 'block', margin: 'auto', width: '100%' }}>
        Logout
      </Button>

      <Modal open={open} onClose={handleClose}>
        <Paper sx={{ padding: 4, maxWidth: 500, margin: 'auto', mt: 5 }}>
          <Typography variant="h5" gutterBottom>แก้ไขข้อมูลผู้ใช้</Typography>
          <Avatar 
            src={imagePreview || (user.picture ? `http://localhost/dogcare/uploads/${user.picture}` : 'https://via.placeholder.com/150')}
            alt={user.username} 
            sx={{ width: 100, height: 100, mb: 3 }} 
          />
          <TextField 
            label="ชื่อ" 
            fullWidth 
            margin="normal" 
            name="firstname" 
            value={editData.firstname || ''} 
            onChange={handleChange}
          />
          <TextField 
            label="นามสกุล" 
            fullWidth 
            margin="normal" 
            name="lastname" 
            value={editData.lastname || ''} 
            onChange={handleChange}
          />
          <TextField 
            label="เบอร์โทรศัพท์" 
            fullWidth 
            margin="normal" 
            name="tel" 
            value={editData.tel || ''} 
            onChange={handleChange}
          />
          <TextField 
            label="ไอดีไลน์" 
            fullWidth 
            margin="normal" 
            name="line_id" 
            value={editData.line_id || ''} 
            onChange={handleChange}
          />
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            style={{ marginTop: '16px' }} 
          />
          <Button variant="contained" color="primary" onClick={handleUpdateUser} sx={{ mt: 2 }}>
            บันทึก
          </Button>
        </Paper>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Paper>
  );
};

export default User;
