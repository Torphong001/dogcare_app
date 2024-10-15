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
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  DialogContentText, 
  TablePagination, 
  Snackbar, 
  Alert,
  Box 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditBreedModal from './editbreed';

function Breed() {
  const [breeds, setBreeds] = useState([]);
  const [error, setError] = useState(null);
  const [selectedBreed, setSelectedBreed] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [breedToDelete, setBreedToDelete] = useState(null);
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

  const handleDeleteClick = (breed) => {
    setBreedToDelete(breed);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    axios.delete('http://localhost/dogcare/admin/deletebreed.php', {
      data: { breed_id: breedToDelete.breed_id }
    })
    .then((response) => {
      if (response.data.status === 'success') {
        fetchBreeds();
        setSnackbarMessage('ลบสายพันธุ์สำเร็จ!');
        setSnackbarOpen(true);
      } else {
        setError(response.data.message);
      }
    })
    .catch((error) => {
      setError('Error deleting the breed');
    })
    .finally(() => {
      setDeleteDialogOpen(false);
      setBreedToDelete(null);
    });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setBreedToDelete(null);
  };

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
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleAddBreedClick}
        sx={{ mb: 2, backgroundColor: '#4caf50' }}
      >
        เพิ่มสายพันธุ์
      </Button>
      <TableContainer component={Paper} sx={{ mt: 2, backgroundColor: '#f9f9f9' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#FF8D8D' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>รหัสสายพันธุ์</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>ชื่อสายพันธุ์</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>รูปภาพ</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>ต้นกำเนิด</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>น้ำหนัก</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>ส่วนสูง</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>อายุขัย</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>จัดการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {breeds.length > 0 ? (
              breeds.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((breed) => (
                <TableRow key={breed.breed_id}>
                  <TableCell>{breed.breed_id}</TableCell>
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
                      color="error" 
                      onClick={() => handleDeleteClick(breed)}
                    >
                      ลบ
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">No breeds found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[8]}
          component="div"
          count={breeds.length}
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

      {/* Dialog สำหรับการลบ */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>ยืนยันการลบข้อมูล</DialogTitle>
        <DialogContent>
          <DialogContentText>
            คุณต้องการลบสายพันธุ์ {breedToDelete?.breed_name} หรือไม่?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            ยกเลิก
          </Button>
          <Button onClick={confirmDelete} color="secondary">
            ลบ
          </Button>
        </DialogActions>
      </Dialog>

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
