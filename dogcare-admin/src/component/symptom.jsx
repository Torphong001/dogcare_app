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
} from '@mui/material';
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from 'react-router-dom';
import EditSymptomModal from './editsymptom'; 

function Symptom() {
  const [symptom, setSymptom] = useState([]);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);  // State for Edit Modal
  const [symptomToDelete, setSymptomToDelete] = useState(null);
  const [symptomToEdit, setSymptomToEdit] = useState(null);  // State for disease to edit
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10); 
  const navigate = useNavigate();


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

  const handleDeleteClick = (symptom) => {
    setSymptomToDelete(symptom);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (symptom) => {
    setSymptomToEdit(symptom);  // Set the disease to edit
    setEditModalOpen(true);     // Open the edit modal
  };

  const confirmDelete = () => {
    axios.delete('http://localhost/dogcare/admin/deletesymptom.php.', {
      data: { symptom_id: symptomToDelete.symptom_id }
    })
    .then((response) => {
      if (response.data.status === 'success') {
        fetchSymptom();
      } else {
        setError(response.data.message);
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
          // value={searchQuery}
          // onChange={handleSearchChange}
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
            {symptom.length > 0 ? (
              symptom.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((symptom) => (
                <TableRow key={symptom.symptom_id}>
                  <TableCell align='center'>{symptom.symptom_name}</TableCell>
                  <TableCell align="center" >
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      onClick={() => handleEditClick(symptom)}  // Open edit modal
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
          count={symptom.length}
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
          onSymptomUpdated={fetchSymptom}  // Refresh diseases after update
        />
      )}
    </Box>
  );
}

export default Symptom;
