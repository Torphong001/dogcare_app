import React, { useState, useEffect } from 'react';
import { Modal, Box, TextField, Button, Typography, Grid, IconButton } from '@mui/material';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

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
    picture: '',
    picturedetail: '' // เพิ่มเพื่อจัดการรูปหลายไฟล์
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [additionalPictures, setAdditionalPictures] = useState([]);
  const [newPictures, setNewPictures] = useState([]); // เก็บรูปใหม่ที่เพิ่มเข้ามา

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
        picture: breedData.picture,
        picturedetail: breedData.picturedetail || '' // เพิ่มข้อมูลรูปหลายไฟล์
      });

      setAdditionalPictures(breedData.picturedetail ? breedData.picturedetail.split('|') : []);
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
      setSelectedFile(URL.createObjectURL(file));
      setFormData({
        ...formData,
        picture: file
      });
    }
  };

  const handleSubmit = () => {
    const formDataToSend = new FormData();
  
    // Append standard form data
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }
  
    // Append the main picture if it exists
    if (formData.picture) {
      formDataToSend.append('main_picture', formData.picture);
    }
  
    // Prepare to collect existing and new pictures
    const finalAdditionalPictures = [...additionalPictures];
    
    // Check if there are new pictures to append
    if (newPictures.length > 0) {
      newPictures.forEach((file) => {
        formDataToSend.append('additional_pictures[]', file); // ส่งไฟล์จริงๆ
        finalAdditionalPictures.push(file.name); // หรือใช้ชื่อไฟล์ใหม่
      });
    }
  
    // Log the additional pictures for debugging
    console.log('Final Additional Pictures:', finalAdditionalPictures);
  
    // Append existing additional pictures (that are not deleted) to formData
    finalAdditionalPictures.forEach((picture) => {
      formDataToSend.append('additional_pictures[]', picture); // ชื่อรูปเพิ่มเติม
    });
    
    // Make the POST request to the API
    axios.post('http://localhost/dogcare/admin/editbreed.php', formDataToSend, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
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
  

  
  
  
  const handleAdditionalFileChange = (e) => {
    const file = e.target.files[0];
    if (file && additionalPictures.length + newPictures.length < 4) {
      setNewPictures([...newPictures, file]); // เก็บรูปใหม่
    }
  };
  const handleRemovePicture = (index, isNew) => {
    if (isNew) {
      const updatedNewPictures = newPictures.filter((_, i) => i !== index);
      setNewPictures(updatedNewPictures);
    } else {
      const updatedPictures = additionalPictures.filter((_, i) => i !== index);
      setAdditionalPictures(updatedPictures);
    }
  };
  
  // แยกไฟล์รูปจาก picturedetail โดยใช้ | เป็นตัวคั่น

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          maxHeight: '90vh',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: '10px',
          overflowY: 'auto',
        }}
      >
        <Typography variant="h6" textAlign="center" gutterBottom>
          แก้ไขข้อมูลสายพันธุ์สุนัข
        </Typography>

        {/* Preview รูปหลัก */}
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
              onMouseEnter={(e) => (e.target.style.filter = 'brightness(0.5)')}
              onMouseLeave={(e) => (e.target.style.filter = 'brightness(1)')}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>
        </Box>

        

        {/* ฟิลด์กรอกข้อมูล */}
        <Box mt={3}>
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
          multiline
          rows={4} // กำหนดให้สูง 3 บรรทัด
        />
        <TextField
          fullWidth
          label="นิสัยส่วนตัว"
          name="charac"
          value={formData.charac}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
          multiline
          rows={4} // กำหนดให้สูง 3 บรรทัด
        />
        <TextField
          fullWidth
          label="ปัญหาสุขภาพ"
          name="problem"
          value={formData.problem}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
          multiline
          rows={4} // กำหนดให้สูง 3 บรรทัด
        />
        <TextField
          fullWidth
          label="โภชนาการ"
          name="Nutrition"
          value={formData.Nutrition}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
          multiline
          rows={4} // กำหนดให้สูง 3 บรรทัด
        />
        <TextField
          fullWidth
          label="ประวัติสายพันธุ์"
          name="record"
          value={formData.record}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
          multiline
          rows={4} // กำหนดให้สูง 3 บรรทัด
        />
          {/* ฟิลด์อื่นๆ */}
        </Box>
        {/* Preview รูปหลายไฟล์ */}
        <Typography variant="h7" gutterBottom >รูปภาพเพิ่มเติม :</Typography>

        <Grid container spacing={2}>
          {/* แสดงรูปเดิมที่มีอยู่แล้ว */}
          {additionalPictures.map((file, index) => (
            <Grid item xs={4} key={index} position="relative">
              <img
                src={`http://localhost/dogcare/uploads/${file}`}
                alt={`รูปเพิ่มเติม ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100px',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
              />
              <IconButton
                size="small"
                sx={{ position: 'absolute', top: 0, right: 0 }}
                onClick={() => handleRemovePicture(index, false)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Grid>
          ))}

          {/* แสดงรูปใหม่ที่ผู้ใช้เลือก */}
          {newPictures.map((file, index) => (
            <Grid item xs={4} key={index} position="relative">
              <img
                src={URL.createObjectURL(file)} // พรีวิวรูปใหม่
                alt={`รูปใหม่ ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100px',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
              />
              <IconButton
                size="small"
                sx={{ position: 'absolute', top: 0, right: 0 }}
                onClick={() => handleRemovePicture(index, true)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Grid>
          ))}

          {/* กรอบรูป "+" สำหรับเพิ่มรูปใหม่ */}
          {(additionalPictures.length + newPictures.length) < 4 && (
            <Grid item xs={4}>
              <label style={{ cursor: 'pointer' }}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  height="100px"
                  border="2px dashed #ccc"
                  borderRadius="8px"
                >
                  <AddIcon fontSize="large" />
                </Box>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAdditionalFileChange}
                  style={{ display: 'none' }}
                />
              </label>
            </Grid>
          )}
        </Grid>
        {/* ปุ่มบันทึก */}
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
