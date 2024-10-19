import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography, 
  Button, 
  TablePagination, 
  Snackbar, 
  Alert,
  TextField,
  Box,
  InputAdornment,
  IconButton,
} from '@mui/material';
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from 'react-router-dom';
import EditBreedModal from './editbreed';

function Breed() {
  const [breeds, setBreeds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [selectedBreed, setSelectedBreed] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBreeds();
  }, []);

  const fetchBreeds = () => {
    axios.get('http://localhost/dogcare/admin/breed.php')
      .then((response) => {
        if (Array.isArray(response.data)) {
          setBreeds(response.data);
        } else {
          setError('Invalid data format from API');
        }
      })
      .catch((error) => {
        setError('Network error');
      });
  };

  const handleEditClick = (breed) => {
    setSelectedBreed(breed);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedBreed(null);
  };

  const handleBreedUpdated = () => {
    fetchBreeds();
    setSnackbarMessage('อัพเดทข้อมูลสำเร็จ!');
    setSnackbarOpen(true);
  };

  const handleAddBreedClick = () => {
    navigate('/addbreed');
  };

  const handleStatusToggle = (breed) => {
    const newStatus = breed.status === 'F' ? null : 'F';  // เปลี่ยนสถานะ
  
    axios.post('http://localhost/dogcare/admin/deletebreed.php', {
      breed_id: breed.breed_id,
      status: newStatus  // ส่งสถานะใหม่ไปที่ backend
    })
    .then((response) => {
      if (response.data.success) {  // ตรวจสอบความสำเร็จจาก backend
        fetchBreeds();  // เรียกข้อมูลใหม่ โดยไม่ต้องเปลี่ยนหน้า
        setSnackbarMessage(newStatus === null ? 'แสดงข้อมูลสำเร็จ!' : 'ระงับการแสดงสำเร็จ!');
        setSnackbarOpen(true);  // เปิด Snackbar เพื่อแสดงผลการทำงาน
      } else {
        setError(response.data.message);  // แสดงข้อผิดพลาดจาก backend
      }
    })
    .catch((error) => {
      setError('เกิดข้อผิดพลาดขณะอัปเดตสถานะพันธุ์สุนัข');  // ข้อความแสดงเมื่อเกิดข้อผิดพลาดในการเชื่อมต่อ
    });
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredBreeds = breeds.filter((breed) =>
    breed.breed_name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  return (
    <Box sx={{ padding: 4, backgroundColor: '#FFE1E1', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ marginBottom: 4, fontWeight: 'bold', textAlign: 'center', color: '#000000' }}>
        ข้อมูลสายพันธุ์
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <TextField
          label="ค้นหาสายพันธุ์"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ width: 710, borderRadius: 1 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleAddBreedClick}
          sx={{ backgroundColor: '#4caf50' }}
        >
          เพิ่มสายพันธุ์
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ mt: 2, backgroundColor: '#f9f9f9' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#FF8D8D' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>ชื่อสายพันธุ์</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>รูปภาพ</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>ต้นกำเนิด</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>น้ำหนัก</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>ส่วนสูง</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>อายุขัย</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>สถานะ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBreeds.length > 0 ? (
              filteredBreeds.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((breed) => (
                <TableRow key={breed.breed_id}>
                  <TableCell>{breed.breed_name}</TableCell>
                  <TableCell>
                    {breed.picture ? (
                      <img 
                        src={`http://localhost/dogcare/uploads/${breed.picture}`} 
                        alt={breed.breed_name} 
                        style={{ 
                          width: '50px', 
                          height: '50px', 
                          borderRadius: '50%', 
                          objectFit: 'cover' 
                        }} 
                      />
                    ) : (
                      'No Picture'
                    )}
                  </TableCell>
                  <TableCell>{breed.region}</TableCell>
                  <TableCell>{breed.weight}</TableCell>
                  <TableCell>{breed.height}</TableCell>
                  <TableCell>{breed.lifespan}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      onClick={() => handleEditClick(breed)}
                      sx={{ mr: 1 }}
                    >
                      แก้ไข
                    </Button>
                    <Button 
                      variant="outlined" 
                      color={breed.status === 'F' ? 'success' : 'error'} 
                      onClick={() => handleStatusToggle(breed)}
                      sx={{ mr: 1 }}
                    >
                      {breed.status === 'F' ? 'แสดงข้อมูล' : 'ระงับการแสดง'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ color: 'red', fontStyle: 'italic' }}>
                  ไม่พบข้อมูลที่ค้นหา
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[8]}
          component="div"
          count={filteredBreeds.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Modal สำหรับการแก้ไข */}
      {selectedBreed && (
        <EditBreedModal
          open={isModalOpen}
          onClose={handleModalClose}
          breedData={selectedBreed}
          onBreedUpdated={handleBreedUpdated}
        />
      )}

      {/* Snackbar สำหรับการแจ้งเตือน */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Breed;
