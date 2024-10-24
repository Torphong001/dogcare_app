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
  TextField,
  InputAdornment,
  IconButton,
  Select,
  MenuItem,
  Snackbar, 
  Alert,
} from '@mui/material';
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from 'react-router-dom';
import EditDiseasesModal from './editdiseases';  // Import your modal

function Diseases() {
  const [diseases, setDiseases] = useState([]);
  const [symptoms, setSymptoms] = useState([]);  // State for symptoms from API
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);  // State for Edit Modal
  const [diseaseToDelete, setDiseaseToDelete] = useState(null);
  const [diseaseToEdit, setDiseaseToEdit] = useState(null);  // State for disease to edit
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8); 
  const navigate = useNavigate();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const truncateText = (text, maxLength = 50) => {
    return text && text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  useEffect(() => {
    fetchDiseases();
    fetchSymptoms();  // Fetch symptoms data on component mount
  }, []);

  const fetchDiseases = () => {
    axios.get('http://localhost/dogcare/admin/diseases.php')
      .then((response) => {
        if (Array.isArray(response.data)) {
          setDiseases(response.data);
        } else {
          setError('Invalid data format from API');
        }
      })
      .catch(() => {
        setError('Network error');
      });
  };
  const fetchSymptoms = () => {
    axios.get('http://localhost/dogcare/admin/symptom.php')
      .then((response) => {
        if (Array.isArray(response.data)) {
          setSymptoms(response.data);  // Set the symptoms data
        } else {
          setError('Invalid data format from symptom API');
        }
      })
      .catch(() => {
        setError('Error fetching symptoms');
      });
  };

  const handleDeleteClick = (disease) => {
    setDiseaseToDelete(disease);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (disease) => {
    setDiseaseToEdit(disease);  // Set the disease to edit
    setEditModalOpen(true);     // Open the edit modal
  };

  const confirmDelete = () => {
    axios.delete('http://localhost/dogcare/admin/deletediseases.php', {
      data: { diseases_id: diseaseToDelete.diseases_id }
    })
    .then((response) => {
      if (response.data.status === 'success') {
        fetchDiseases();
        setSnackbarMessage('ลบข้อมูลโรคสำเร็จ!');
        setSnackbarOpen(true);  // เปิด Snackbar เพื่อแสดงผลการทำงาน
      } else {
        setError(response.data.message);
      }
    })
    .catch(() => {
      setError('Error deleting the disease');
    })
    .finally(() => {
      setDeleteDialogOpen(false);
      setDiseaseToDelete(null);
    });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDiseaseToDelete(null);
  };
  const handleDiseaseUpdated = () => {
    fetchDiseases();
    setSnackbarMessage('อัพเดทข้อมูลสำเร็จ!');
    setSnackbarOpen(true);
  };
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setDiseaseToEdit(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const filteredDiseases = diseases.filter((disease) => {
    const matchesSearch = disease.diseases_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSymptom = selectedSymptom === '' || disease.symptom.includes(selectedSymptom);
    return matchesSearch && matchesSymptom;
  });
  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  return (
    <Box sx={{ padding: 4, backgroundColor: '#FFE1E1', minHeight: '100vh' }}>
        <Typography variant="h4" sx={{ marginBottom: 4, fontWeight: 'bold', textAlign: 'center', color: '#000000' }}>
          ข้อมูลโรค
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <TextField
            label="ค้นหาโรค"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: 700, borderRadius: 1 }}
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

          {/* Filter by symptom */}
          <Select
          value={selectedSymptom}
          onChange={(e) => setSelectedSymptom(e.target.value)}
          displayEmpty
          sx={{ width: "20%", backgroundColor: "#FFF" }}
            >
            <MenuItem value=""><em>กรองข้อมูลอาการ</em></MenuItem>
            {symptoms.map((symptom) => (
              <MenuItem key={symptom.symptom_name} value={symptom.symptom_name}>
                {symptom.symptom_name}
              </MenuItem>
            ))}
          </Select>
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={() => navigate('/adddiseases')}
          sx={{ backgroundColor: '#4caf50' }}
        >
          เพิ่มข้อมูลโรค
        </Button>
      </Box>
      <TableContainer component={Paper} style={{ marginTop: '20px' }}>
        
        <Table>
        <TableHead sx={{ backgroundColor: '#FF8D8D' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>ชื่อโรค</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>อาการ</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>วิธีการป้องกัน</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {filteredDiseases.length > 0 ? (
              filteredDiseases.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((disease) => (
                <TableRow key={disease.diseases_id}>
                  <TableCell>{disease.diseases_name}</TableCell>
                  <TableCell>{truncateText(disease.symptom)}</TableCell>
                  <TableCell>{truncateText(disease.treat)}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      color="primary"  
                      onClick={() => handleEditClick(disease)}  // Open edit modal
                      sx={{ mr: 1 }}
                    >
                      แก้ไข
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="error" 
                      onClick={() => handleDeleteClick(disease)}
                      sx={{ mr: 1 }}
                    >
                      ลบ
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
          count={filteredDiseases.length}
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
            คุณต้องการลบโรค "{diseaseToDelete?.diseases_name}" หรือไม่?
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

      {/* Edit Modal */}
      {diseaseToEdit && (
        <EditDiseasesModal 
          open={editModalOpen}
          onClose={handleCloseEditModal}
          diseaseData={diseaseToEdit}
          onDiseaseUpdated={handleDiseaseUpdated}  // Refresh diseases after update
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
    </Box>
  );
}

export default Diseases;
