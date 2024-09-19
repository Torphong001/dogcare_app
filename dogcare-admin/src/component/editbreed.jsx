import React, { useState, useEffect } from 'react';
import { Modal, Box, TextField, Button } from '@mui/material';
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

  useEffect(() => {
    if (breedData) {
      // Pre-fill form with breed data when the modal opens
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
    axios.post('http://localhost/dogcare/admin/editbreed.php', formData)
      .then((response) => {
        if (response.data.success) {
          onBreedUpdated(); // Call the parent callback to update the UI
          onClose(); // Close the modal after a successful update
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
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 500, bgcolor: 'background.paper', boxShadow: 24, p: 4
      }}>
        <h2>Edit Breed</h2>

        <TextField
          fullWidth
          label="Breed Name"
          name="breed_name"
          value={formData.breed_name}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Region"
          name="region"
          value={formData.region}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Weight"
          name="weight"
          value={formData.weight}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Height"
          name="height"
          value={formData.height}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Lifespan"
          name="lifespan"
          value={formData.lifespan}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Nature"
          name="nature"
          value={formData.nature}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Character"
          name="charac"
          value={formData.charac}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Problem"
          name="problem"
          value={formData.problem}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Nutrition"
          name="Nutrition"
          value={formData.Nutrition}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Record"
          name="record"
          value={formData.record}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Picture URL"
          name="picture"
          value={formData.picture}
          onChange={handleChange}
          margin="normal"
        />

        <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 2 }}>
          Save
        </Button>
      </Box>
    </Modal>
  );
}

export default EditBreedModal;
