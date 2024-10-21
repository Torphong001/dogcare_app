import React, { useState, useEffect } from 'react';
import { Modal, Box, TextField, Button, CircularProgress } from '@mui/material';
import axios from 'axios';

function EditDiseasesModal({ open, onClose, diseaseData, onDiseaseUpdated }) {
  const [formData, setFormData] = useState({
    diseases_id: '',
    diseases_name: '',
    symptom: '',
    treat: ''
  });
  const [symptomOptions, setSymptomOptions] = useState([]); // เก็บตัวเลือกอาการ
  const [selectedSymptoms, setSelectedSymptoms] = useState([]); // เก็บอาการที่ถูกเลือก
  const [loading, setLoading] = useState(true); // สถานะการโหลด

  // เรียกข้อมูลอาการจาก API ตอนเปิด modal
  useEffect(() => {
    axios.get('http://localhost/dogcare/admin/symptom.php') // เปลี่ยน URL ให้ตรงกับ API ที่เรียกข้อมูล
      .then(response => {
        setSymptomOptions(response.data); // ตั้งค่าตัวเลือกอาการ
        setLoading(false); // ตั้งค่าโหลดเสร็จแล้ว
      })
      .catch(error => {
        console.error('Error fetching symptoms:', error);
        setLoading(false); // ตั้งค่าโหลดเสร็จแล้วแม้เกิดข้อผิดพลาด
      });
  }, []);

  // ตั้งค่าเริ่มต้นของฟอร์มเมื่อเปิด modal
  useEffect(() => {
    if (diseaseData) {
      setFormData({
        diseases_id: diseaseData.diseases_id,
        diseases_name: diseaseData.diseases_name,
        symptom: diseaseData.symptom, // เก็บรูปแบบ | คั่นไว้ก่อน
        treat: diseaseData.treat
      });
      setSelectedSymptoms(diseaseData.symptom.split('|')); // แปลง symptom ที่เก็บด้วย | มาเป็น array
    }
  }, [diseaseData]);

  // Handle symptom button click
  const handleSymptomClick = (symptomName) => {
    let updatedSymptoms = [...selectedSymptoms];
    if (updatedSymptoms.includes(symptomName)) {
      updatedSymptoms = updatedSymptoms.filter(symptom => symptom !== symptomName);
    } else {
      updatedSymptoms.push(symptomName);
    }
    setSelectedSymptoms(updatedSymptoms);
    setFormData({
      ...formData,
      symptom: updatedSymptoms.join('|') // แปลงกลับเป็นรูปแบบ | คั่นข้อมูล
    });
  };

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
          label="ชื่อโรค"
          name="diseases_name"
          value={formData.diseases_name}
          onChange={handleChange}
          margin="normal"
        />

        <h3>อาการ</h3>
        {loading ? ( // ตรวจสอบสถานะการโหลด
          <CircularProgress /> // แสดงวงกลมหมุนเมื่อกำลังโหลด
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {symptomOptions.map((symptom) => (
              <Button
                key={symptom.symptom_name}
                variant={selectedSymptoms.includes(symptom.symptom_name) ? 'contained' : 'outlined'}
                onClick={() => handleSymptomClick(symptom.symptom_name)}
              >
                {symptom.symptom_name}
              </Button>
            ))}
          </Box>
        )}

        <TextField
          fullWidth
          label="วิธีการป้องกัน"
          name="treat"
          value={formData.treat}
          onChange={handleChange}
          margin="normal"
          multiline
          rows={4} // กำหนดให้สูง 3 บรรทัด
        />

        <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 2 }}>
          Save
        </Button>
      </Box>
    </Modal>
  );
}

export default EditDiseasesModal;
