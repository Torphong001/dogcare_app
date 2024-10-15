import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, Snackbar, Alert, Typography, Box, CircularProgress, Avatar } from '@mui/material';
import axios from 'axios';

function User() {
  const [users, setUsers] = useState([]); // Initialize users state
  const [error, setError] = useState(null); // Error state
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar state
  const [snackbarMessage, setSnackbarMessage] = useState(''); // Snackbar message
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch users on component mount
  useEffect(() => {
    axios.get('http://localhost/dogcare/admin/user.php')
      .then((response) => {
        if (Array.isArray(response.data)) {
          setUsers(response.data); // Set users if response is an array
        } else {
          setError('Invalid data format from API');
        }
        setLoading(false); // Stop loading once data is fetched
      })
      .catch((error) => {
        setError('Network error');
        setLoading(false);
      });
  }, []);

  // Handle status change
  const handleStatusChange = (userId, newStatus) => {
    axios.post('http://localhost/dogcare/admin/edituser.php', { user_id: userId, status: newStatus })
      .then((response) => {
        // Update local state with new status after successful API call
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.user_id === userId ? { ...user, status: newStatus } : user
          )
        );
        // Set success message and open Snackbar
        setSnackbarMessage('เปลี่ยนสถานะสําเร็จ');
        setSnackbarOpen(true);
      })
      .catch((error) => {
        console.error('Error updating status:', error);
      });
  };

  // Handle Snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (error) {
    return <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Error: {error}</div>;
  }

  return (
    <Box sx={{ padding: 4, backgroundColor: '#FFE1E1', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ marginBottom: 4, fontWeight: 'bold', textAlign: 'center', color: '#000000' }}>
        ข้อมูลผู้ใช้
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#FF8D8D' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>รหัสผู้ใช้งาน</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>ชื่อผู้ใช้งาน</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>ชื่อ</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>นามสกุล</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>เบอร์โทรศัพท์</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>ไอดีไลน์</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>สถานะ</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>รูปภาพ</TableCell>
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
                    <TableCell>
                      <Select
                        value={user.status || 'U'}
                        onChange={(e) => handleStatusChange(user.user_id, e.target.value)}
                        sx={{ minWidth: 120 }}
                      >
                        <MenuItem value="A">แอดมิน</MenuItem>
                        <MenuItem value="F">ระงับการใช้งาน</MenuItem>
                        <MenuItem value="U">ผู้ใช้งานทั่วไป</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {user.picture ? (
                        <Avatar src={`http://localhost/dogcare/uploads/${user.picture}`} alt={user.username} sx={{ width: 56, height: 56 }} />
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          ไม่มีรูปภาพ
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', padding: '20px', color: '#999' }}>ไม่พบข้อมูลผู้ใช้งาน</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Snackbar to show success message */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000} // Auto hide after 3 seconds
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Position Snackbar at the top center
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default User;

