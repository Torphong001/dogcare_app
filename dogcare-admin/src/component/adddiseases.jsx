import React, { useState } from 'react';
import axios from 'axios';
import { 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Container 
} from '@mui/material';

function AddDiseases() {
  const [diseaseData, setDiseaseData] = useState({
    diseases_name: '',
    symptom: '',
    treat: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setDiseaseData({
      ...diseaseData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost/dogcare/admin/adddiseases.php', diseaseData)
      .then(response => {
        if (response.data.success) {
          setSuccessMessage('Disease added successfully!');
          setError('');
          setDiseaseData({
            diseases_name: '',
            symptom: '',
            treat: ''
          });
        } else {
          setError(response.data.message || 'An error occurred.');
        }
      })
      .catch(error => {
        console.error('There was an error!', error);
        setError('An error occurred while adding the disease.');
      });
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
        <Typography variant="h5" gutterBottom>
          เพิ่มข้อมูลโรค
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="ชื่อโรค"
            name="diseases_name"
            value={diseaseData.diseases_name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="อาการ"
            name="symptom"
            value={diseaseData.symptom}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
            required
          />
          <TextField
            label="การรักษา"
            name="treat"
            value={diseaseData.treat}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
            required
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          {successMessage && (
            <Typography color="primary" variant="body2">
              {successMessage}
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
    </Container>
  );
}

export default AddDiseases;
