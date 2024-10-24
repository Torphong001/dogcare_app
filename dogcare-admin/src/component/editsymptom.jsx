import React, { useState, useEffect } from 'react';
import { Modal, Box, TextField, Button, Typography } from '@mui/material';
import axios from 'axios';

function EditSymptomModal({ open, onClose, symptomData, onSymptomUpdated }) {
  const [formData, setFormData] = useState({
    symptom_id: '',
    symptom_name: '',
  });

  useEffect(() => {
    if (symptomData) {
      // Pre-fill form with disease data when the modal opens
      setFormData({
        symptom_id: symptomData.symptom_id,
        symptom_name: symptomData.symptom_name,
      });
    }
  }, [symptomData]);

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
    axios.post('http://localhost/dogcare/admin/editsymptom.php', formData)
      .then((response) => {
        if (response.data.success) {
          onSymptomUpdated(); // Call the parent callback to update the UI
          onClose(); // Close the modal after a successful update
        } else {
          alert(response.data.message || 'Failed to update symptom.');
        }
      })
      .catch((error) => {
        console.error('Error updating symptom:', error);
        alert('Network error.');
      });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 500, bgcolor: 'background.paper', boxShadow: 24, p: 4
      }}>
        <Typography variant="h6" sx={{  fontWeight: 'bold', textAlign: 'center', color: '#000000' }}>
          แก้ไขข้อมูลอาการ
        </Typography>

        <TextField
          fullWidth
          label="ชื่ออาการ"
          name="symptom_name"
          value={formData.symptom_name}
          onChange={handleChange}
          margin="normal"
          
        />

        <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 2 }}>
          บันทึก
        </Button>
      </Box>
    </Modal>
  );
}

export default EditSymptomModal;
