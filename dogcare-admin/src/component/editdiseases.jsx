import React, { useState, useEffect } from 'react';
import { Modal, Box, TextField, Button } from '@mui/material';
import axios from 'axios';

function EditDiseasesModal({ open, onClose, diseaseData, onDiseaseUpdated }) {
  const [formData, setFormData] = useState({
    diseases_id: '',
    diseases_name: '',
    symptom: '',
    treat: ''
  });

  useEffect(() => {
    if (diseaseData) {
      // Pre-fill form with disease data when the modal opens
      setFormData({
        diseases_id: diseaseData.diseases_id,
        diseases_name: diseaseData.diseases_name,
        symptom: diseaseData.symptom,
        treat: diseaseData.treat
      });
    }
  }, [diseaseData]);

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
    axios.post('http://localhost/dogcare/admin/editdiseases.php', formData)
      .then((response) => {
        if (response.data.success) {
          onDiseaseUpdated(); // Call the parent callback to update the UI
          onClose(); // Close the modal after a successful update
        } else {
          alert(response.data.message || 'Failed to update disease.');
        }
      })
      .catch((error) => {
        console.error('Error updating disease:', error);
        alert('Network error.');
      });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 500, bgcolor: 'background.paper', boxShadow: 24, p: 4
      }}>
        <h2>Edit Disease</h2>

        <TextField
          fullWidth
          label="Disease Name"
          name="diseases_name"
          value={formData.diseases_name}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Symptom"
          name="symptom"
          value={formData.symptom}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Treatment"
          name="treat"
          value={formData.treat}
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

export default EditDiseasesModal;
