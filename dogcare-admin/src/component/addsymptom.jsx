import React, { useState } from 'react';
import axios from 'axios';
import { 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Container,
  Snackbar, 
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

function AddSymptom() {
  const [symptomData, setSymptomData] = useState({
    symptom_name: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setSymptomData({
      ...symptomData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost/dogcare/admin/addsymptom.php', symptomData)
      .then(response => {
        if (response.data.success) {
          setSuccessMessage('เพิ่มข้อมูลอาการสำเร็จ!');
          setSnackbarOpen(true); // เปิด Snackbar เมื่อสำเร็จ
          setError('');
          setSymptomData({
            symptom_name: '',
          });
          setTimeout(() => {
            navigate('/Symptom');
          }, 2000); 
        } else {
          setError(response.data.message || 'An error occurred.');
        }
      })
      .catch(error => {
        console.error('There was an error!', error);
        setError('An error occurred while adding the disease.');
      });
  };
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  return (
    <Container maxWidth="sm">
      <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
        <Typography variant="h5" gutterBottom>
          เพิ่มข้อมูลอาการ
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="ชื่ออาการ"
            name="symptom_name"
            value={symptomData.diseases_name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            style={{ marginTop: '20px' }}
            fullWidth
          >
            เพิ่มข้อมูล
          </Button>
        </form>
      </Paper>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default AddSymptom;
