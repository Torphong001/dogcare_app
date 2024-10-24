import React, { useState, useRef } from 'react';
import axios from 'axios';
import { 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Container, 
  Snackbar, 
  Alert 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

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
    picture: null
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'picture') {
      setBreedData({
        ...breedData,
        picture: files[0]
      });
    } else {
      setBreedData({
        ...breedData,
        [name]: value
      });
    }
  };

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const key in breedData) {
      formData.append(key, breedData[key]);
    }

    axios.post('http://localhost/dogcare/admin/addbreed.php', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(response => {
      if (response.data.success) {
        setSuccessMessage('เพิ่มข้อมูลสายพันธุ์สำเร็จ!');
        setError('');
        setSnackbarOpen(true);
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
          picture: null
        });

        setTimeout(() => {
          navigate('/Breed');
        }, 2000);
      } else {
        setError(response.data.message || 'เกิดข้อผิดพลาด.');
      }
    })
    .catch(error => {
      console.error('มีข้อผิดพลาด!', error);
      setError('เกิดข้อผิดพลาดขณะเพิ่มสายพันธุ์.');
    });
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="sm" style={{ backgroundColor: '#FFE1E1', padding: '10px', borderRadius: '8px' }}>
      <Paper elevation={3} style={{ padding: '20px', marginTop: '20px', backgroundColor: '#ffffff', borderRadius: '8px' }}>
        <Typography variant="h5" gutterBottom>
          เพิ่มข้อมูลสายพันธุ์
        </Typography>
        
        <input 
          type="file" 
          name="picture" 
          accept="image/*" 
          onChange={handleChange} 
          style={{ display: 'none' }} 
          ref={fileInputRef} 
          required
        />
        <div 
          onClick={handleFileClick} 
          style={{
            width: '150px',
            height: '150px',
            border: 'none',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            margin: '20px auto',
            position: 'relative',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            transition: 'background-color 0.3s ease',
            backgroundColor: breedData.picture ? 'transparent' : '#f0f0f0'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = breedData.picture ? 'transparent' : '#f0f0f0'}
        >
          {breedData.picture ? (
            <img 
              src={URL.createObjectURL(breedData.picture)} 
              alt="Preview" 
              style={{ 
                width: '100%', 
                height: '100%', 
                borderRadius: '50%', 
                objectFit: 'cover' 
              }} 
            />
          ) : (
            <Typography variant="body1" color="textSecondary">
              เลือกรูปภาพ
            </Typography>
          )}
        </div>

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

export default AddBreed;
