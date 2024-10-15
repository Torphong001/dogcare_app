import React, { useState, useEffect } from 'react';
import { Modal, Box, TextField, Button, Typography } from '@mui/material';
import axios from 'axios';

function EditBreedModal({ open, onClose, breedData, onBreedUpdated }) {
  const [formData, setFormData] = useState({
    breed_id: '',
    breed_name: '',
    region: '',
    weight: '',
    height: '',
    lifespan: '',
    nature: '',
    charac: '',
    problem: '',
    Nutrition: '',
    record: '',
    picture: ''
  });

  const [selectedFile, setSelectedFile] = useState(null); // State for selected file

  useEffect(() => {
    if (breedData) {
      setFormData({
        breed_id: breedData.breed_id,
        breed_name: breedData.breed_name,
        region: breedData.region,
        weight: breedData.weight,
        height: breedData.height,
        lifespan: breedData.lifespan,
        nature: breedData.nature,
        charac: breedData.charac,
        problem: breedData.problem,
        Nutrition: breedData.Nutrition,
        record: breedData.record,
        picture: breedData.picture
      });
    }
  }, [breedData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(URL.createObjectURL(file)); // Preview the selected image
      setFormData({
        ...formData,
        picture: file // Store the file for uploading
      });
    }
  };

  const handleSubmit = () => {
    const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }
    if (formData.picture) {
      formDataToSend.append('picture', formData.picture); // Append the picture file
    }

    axios.post('http://localhost/dogcare/admin/editbreed.php', formDataToSend, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then((response) => {
        if (response.data.success) {
          onBreedUpdated();
          onClose();
        } else {
          alert(response.data.message || 'Failed to update breed.');
        }
      })
      .catch((error) => {
        console.error('Error updating breed:', error);
        alert('Network error.');
      });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          maxHeight: '80vh',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: '10px',
          overflowY: 'auto',
        }}
      >
        {/* Title */}
        <Typography variant="h6" textAlign="center" gutterBottom>
          แก้ไขข้อมูลสายพันธุ์สุนัข
        </Typography>

        {/* Image Preview */}
        <Box display="flex" justifyContent="center" mb={2}>
          <label style={{ cursor: 'pointer' }}>
            <img
              src={selectedFile || `http://localhost/dogcare/uploads/${formData.picture}`}
              alt={formData.breed_name}
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                objectFit: 'cover',
                marginBottom: '16px',
                transition: 'filter 0.3s',
                filter: 'brightness(1)',
              }}
              onMouseEnter={(e) => (e.target.style.filter = 'brightness(0.5)')} // Darken on hover
              onMouseLeave={(e) => (e.target.style.filter = 'brightness(1)')} // Restore on leave
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }} // Hide the file input
            />
          </label>
        </Box>

        {/* Form Fields */}
        <TextField
          fullWidth
          label="ชื่อสายพันธุ์"
          name="breed_name"
          value={formData.breed_name}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
        />
        <TextField
          fullWidth
          label="ต้นกำเนิด"
          name="region"
          value={formData.region}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
        />
        <TextField
          fullWidth
          label="น้ำหนัก"
          name="weight"
          value={formData.weight}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
        />
        <TextField
          fullWidth
          label="ส่วนสูง"
          name="height"
          value={formData.height}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
        />
        <TextField
          fullWidth
          label="อายุขัย"
          name="lifespan"
          value={formData.lifespan}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
        />
        <TextField
          fullWidth
          label="ลักษณะสายพันธุ์"
          name="nature"
          value={formData.nature}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
        />
        <TextField
          fullWidth
          label="นิสัยส่วนตัว"
          name="charac"
          value={formData.charac}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
        />
        <TextField
          fullWidth
          label="ปัญหาสุขภาพ"
          name="problem"
          value={formData.problem}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
        />
        <TextField
          fullWidth
          label="โภชนาการ"
          name="Nutrition"
          value={formData.Nutrition}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
        />
        <TextField
          fullWidth
          label="ประวัติสายพันธุ์"
          name="record"
          value={formData.record}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
        />

        {/* Submit Button */}
        <Box display="flex" justifyContent="center" mt={3}>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            บันทึก
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default EditBreedModal;
