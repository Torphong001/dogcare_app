import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Container, 
  Box, 
  CircularProgress 
} from '@mui/material';

function AddDiseases() {
  const [diseaseData, setDiseaseData] = useState({
    diseases_name: '',
    symptom: '', // จะเก็บ symptom เป็น string โดย | คั่นแต่ละตัวเลือก
    treat: ''
  });
  const [symptomOptions, setSymptomOptions] = useState([]); // ตัวเลือกอาการที่ดึงจาก API
  const [selectedSymptoms, setSelectedSymptoms] = useState([]); // เก็บอาการที่ผู้ใช้เลือก
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true); // สำหรับสถานะการโหลดข้อมูลอาการ

  // ดึงข้อมูลอาการจาก API
  useEffect(() => {
    axios.get('http://localhost/dogcare/admin/symptom.php') // เปลี่ยน URL ให้ตรงกับ API ของคุณ
      .then(response => {
        setSymptomOptions(response.data); // ตั้งค่าตัวเลือกอาการ
        setLoading(false); // หยุดโหลดหลังจากดึงข้อมูลเรียบร้อย
      })
      .catch(error => {
        console.error('Error fetching symptoms:', error);
        setLoading(false); // หยุดโหลดถ้ามี error
      });
  }, []);

  const handleChange = (e) => {
    setDiseaseData({
      ...diseaseData,
      [e.target.name]: e.target.value
    });
  };

  // ฟังก์ชันจัดการเมื่อกดปุ่มเลือก/ยกเลิกอาการ
  const handleSymptomToggle = (symptomName) => {
    let updatedSymptoms = [...selectedSymptoms];
    if (updatedSymptoms.includes(symptomName)) {
      updatedSymptoms = updatedSymptoms.filter(symptom => symptom !== symptomName);
    } else {
      updatedSymptoms.push(symptomName);
    }
    setSelectedSymptoms(updatedSymptoms);
    setDiseaseData({
      ...diseaseData,
      symptom: updatedSymptoms.join('|') // แปลงเป็น string ที่คั่นด้วย |
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
          setSelectedSymptoms([]); // เคลียร์อาการที่เลือก
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

          <Typography variant="h6" gutterBottom>
            อาการ
          </Typography>
          {loading ? (
            <CircularProgress />
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {symptomOptions.map(option => (
                <Button
                  key={option.symptom_name}
                  variant={selectedSymptoms.includes(option.symptom_name) ? 'contained' : 'outlined'}
                  onClick={() => handleSymptomToggle(option.symptom_name)}
                >
                  {option.symptom_name}
                </Button>
              ))}
            </Box>
          )}

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
