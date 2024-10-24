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
  Box,
  InputAdornment,
  IconButton,
  TextField,
  Snackbar, 
  Alert,
} from '@mui/material';
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from 'react-router-dom';
import EditSymptomModal from './editsymptom'; 

function Symptom() {
  const [symptom, setSymptom] = useState([]);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);  
  const [symptomToDelete, setSymptomToDelete] = useState(null);
  const [symptomToEdit, setSymptomToEdit] = useState(null);  
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10); 
  const navigate = useNavigate();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false); // Snackbar state for error
  const [errorSnackbarMessage, setErrorSnackbarMessage] = useState(''); // Error message

  useEffect(() => {
    fetchSymptom();
  }, []);

  const fetchSymptom = () => {
    axios.get('http://localhost/dogcare/admin/symptom.php')
      .then((response) => {
        if (Array.isArray(response.data)) {
            setSymptom(response.data);
        } else {
          setError('Invalid data format from API');
        }
      })
      .catch(() => {
        setError('Network error');
      });
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value); // Update search query
  };

  const filteredSymptoms = symptom.filter((s) =>
    s.symptom_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteClick = (symptom) => {
    setSymptomToDelete(symptom);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (symptom) => {
    setSymptomToEdit(symptom);  
    setEditModalOpen(true);     
  };

  const confirmDelete = () => {
    axios.delete('http://localhost/dogcare/admin/deletesymptom.php.', {
      data: { symptom_id: symptomToDelete.symptom_id }
    })
    .then((response) => {
      if (response.data.status === 'success') {
        fetchSymptom();
        setSnackbarMessage('ลบข้อมูลอาการสำเร็จ!');
        setSnackbarOpen(true);  // เปิด Snackbar เพื่อแสดงผลการทำงาน
      } else {
        setErrorSnackbarMessage('ไม่สามารถลบข้อมูลอาการได้ เนื่องจากมีการใช้งานอยู่');
        setErrorSnackbarOpen(true);  // เปิด Snackbar เพื่อแสดงผลการทำงาน
      }
    })
    .catch(() => {
      setError('Error deleting the disease');
    })
    .finally(() => {
      setDeleteDialogOpen(false);
      setSymptomToDelete(null);
    });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSymptomToDelete(null);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSymptomToEdit(null);
  };
  const handleSymptomUpdated = () => {
    fetchSymptom();
    setSnackbarMessage('อัพเดทข้อมูลสำเร็จ!');
    setSnackbarOpen(true);
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
    <Box sx={{ padding: 4, backgroundColor: '#FFE1E1', minHeight: '100vh', width: '70%', margin: '0 auto' }}>
        <Typography variant="h4" sx={{ marginBottom: 4, fontWeight: 'bold', textAlign: 'center', color: '#000000' }}>
          ข้อมูลอาการ
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <TextField
          label="ค้นหาอาการ"
          variant="outlined"
          value={searchQuery} // Value from search query
          onChange={handleSearchChange} // Update search on change
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
          color="secondary" 
          onClick={() => navigate('/addsymptom')}
          sx={{ backgroundColor: '#4caf50' }}
        >
          เพิ่มอาการ
        </Button>
      </Box>
      <TableContainer component={Paper} style={{ marginTop: '20px' }}>
        <Table>
        <TableHead sx={{ backgroundColor: '#FF8D8D' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' , textAlign: 'center' }}>ชื่ออาการ</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSymptoms.length > 0 ? (
              filteredSymptoms.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((symptom) => (
                <TableRow key={symptom.symptom_id}>
                  <TableCell align='center'>{symptom.symptom_name}</TableCell>
                  <TableCell align="center" >
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      onClick={() => handleEditClick(symptom)}  
                      style={{ marginRight: '8px' }}
                    >
                      แก้ไข
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="error"  
                      onClick={() => handleDeleteClick(symptom)}
                    >
                      ลบ
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5}>ไม่พบข้อมูลอาการ</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10]}
          component="div"
          count={filteredSymptoms.length} // Use filtered symptoms length
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Dialog for deletion */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>ยืนยันการลบ</DialogTitle>
        <DialogContent>
          <DialogContentText>
            คุณต้องการลบอาการ {symptomToDelete && symptomToDelete.symptom_name} หรือไม่
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            ยกเลิก
          </Button>
          <Button onClick={confirmDelete} color="secondary">
            ยืนยันการลบ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modal */}
      {symptomToEdit && (
        <EditSymptomModal 
          open={editModalOpen}
          onClose={handleCloseEditModal}
          symptomData={symptomToEdit}
          onSymptomUpdated={handleSymptomUpdated}  
        />
      )}
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
      <Snackbar
        open={errorSnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setErrorSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setErrorSnackbarOpen(false)} severity="error" sx={{ width: '100%' }}>
          {errorSnackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Symptom;
