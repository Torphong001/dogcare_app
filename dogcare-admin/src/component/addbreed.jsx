import React, { useState } from 'react';
import axios from 'axios';
import { 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Container 
} from '@mui/material';

function AddBreed() {
  const [breedData, setBreedData] = useState({
    breed_name: '',
    region: '',
    weight: '',
    height: '',
    lifespan: '',
    nature: '',
    character: '',
    problem: '',
    nutrition: '',
    record: '',
    picture_url: '' // เพิ่ม field สำหรับ URL ของรูปภาพ
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setBreedData({
      ...breedData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost/dogcare/admin/addbreed.php', breedData)
      .then(response => {
        if (response.data.success) {
          setSuccessMessage('Breed added successfully!');
          setError('');
          setBreedData({
            breed_name: '',
            region: '',
            weight: '',
            height: '',
            lifespan: '',
            nature: '',
            character: '',
            problem: '',
            nutrition: '',
            record: '',
            picture_url: '' // ล้างค่า input
          });
        } else {
          setError(response.data.message || 'An error occurred.');
        }
      })
      .catch(error => {
        console.error('There was an error!', error);
        setError('An error occurred while adding the breed.');
      });
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
        <Typography variant="h5" gutterBottom>
          เพิ่มข้อมูลสายพันธุ์
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="ชื่อสายพันธุ์"
            name="breed_name"
            value={breedData.breed_name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="ภูมิภาค"
            name="region"
            value={breedData.region}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="น้ำหนัก"
            name="weight"
            value={breedData.weight}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="ความสูง"
            name="height"
            value={breedData.height}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="อายุขัย"
            name="lifespan"
            value={breedData.lifespan}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="ลักษณะนิสัย"
            name="nature"
            value={breedData.nature}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
          />
          <TextField
            label="ลักษณะตัวละคร"
            name="character"
            value={breedData.character}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
          />
          <TextField
            label="ปัญหาสุขภาพ"
            name="problem"
            value={breedData.problem}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
          />
          <TextField
            label="ข้อมูลโภชนาการ"
            name="nutrition"
            value={breedData.nutrition}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
          />
          <TextField
            label="บันทึกข้อมูลอื่น ๆ"
            name="record"
            value={breedData.record}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
          />
          <TextField
            label="URL รูปภาพ"
            name="picture_url"
            value={breedData.picture_url}
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

export default AddBreed;
