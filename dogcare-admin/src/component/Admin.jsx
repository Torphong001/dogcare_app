import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Button, Typography, Avatar, CircularProgress, Alert 
} from '@mui/material'; // Material-UI components

function User() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); 

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
    navigate('/Login');
  };

  useEffect(() => {
    const userId = localStorage.getItem('userId');

    if (userId) {
      axios.get(`http://localhost/dogcare/admin/getuser.php?user_id=${userId}`)
        .then((response) => {
          if (response.data.success !== false) {
            setUser(response.data);
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

  if (error) {
    return <Alert severity="error">{error}</Alert>; 
  }

  if (!user) {
    return <CircularProgress />; 
  }

  return (
    <Paper sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>ข้อมูลผู้ใช้</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ชื่อผู้ใช้</TableCell>
              <TableCell>ชื่อ</TableCell>
              <TableCell>นามสกุล</TableCell>
              <TableCell>เบอร์โทรศัพท์</TableCell>
              <TableCell>ไอดีไลน์</TableCell>
              <TableCell>สถาณะ</TableCell>
              <TableCell>รูปภาพ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.firstname}</TableCell>
              <TableCell>{user.lastname}</TableCell>
              <TableCell>{user.tel}</TableCell>
              <TableCell>{user.line_id}</TableCell>
              <TableCell>{user.status}</TableCell>
              <TableCell>
                {user.picture ? (
                  <Avatar src={user.picture} alt={user.username} />
                ) : (
                  'No Picture'
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Button 
        variant="contained" 
        color="error" 
        sx={{ marginTop: 3 }} 
        onClick={handleLogout}
      >
        Logout
      </Button>
    </Paper>
  );
}

export default User;
