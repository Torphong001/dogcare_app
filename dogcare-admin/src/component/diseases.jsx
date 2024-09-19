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
  TablePagination
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditDiseasesModal from './editdiseases';  // Import your modal

function Diseases() {
  const [diseases, setDiseases] = useState([]);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);  // State for Edit Modal
  const [diseaseToDelete, setDiseaseToDelete] = useState(null);
  const [diseaseToEdit, setDiseaseToEdit] = useState(null);  // State for disease to edit
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8); 
  const navigate = useNavigate();

  const truncateText = (text, maxLength = 200) => {
    return text && text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  useEffect(() => {
    fetchDiseases();
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

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  return (
    <>
      <TableContainer component={Paper} style={{ marginTop: '20px' }}>
        <Typography variant="h4" gutterBottom style={{ padding: '16px' }}>
          ข้อมูลโรค
        </Typography>
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={() => navigate('/adddiseases')}
          style={{ marginBottom: '16px' }}
        >
          เพิ่มโรค
        </Button>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Diseases ID</TableCell>
              <TableCell>Diseases Name</TableCell>
              <TableCell>Symptoms</TableCell>
              <TableCell>Treatment</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {diseases.length > 0 ? (
              diseases.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((disease) => (
                <TableRow key={disease.diseases_id}>
                  <TableCell>{disease.diseases_id}</TableCell>
                  <TableCell>{disease.diseases_name}</TableCell>
                  <TableCell>{truncateText(disease.symptom)}</TableCell>
                  <TableCell>{truncateText(disease.treat)}</TableCell>
                  <TableCell>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={() => handleEditClick(disease)}  // Open edit modal
                      style={{ marginRight: '8px' }}
                    >
                      แก้ไข
                    </Button>
                    <Button 
                      variant="contained" 
                      color="error" 
                      onClick={() => handleDeleteClick(disease)}
                    >
                      ลบ
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5}>No diseases found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[8]}
          component="div"
          count={diseases.length}
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
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this disease?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modal */}
      {diseaseToEdit && (
        <EditDiseasesModal 
          open={editModalOpen}
          onClose={handleCloseEditModal}
          diseaseData={diseaseToEdit}
          onDiseaseUpdated={fetchDiseases}  // Refresh diseases after update
        />
      )}
    </>
  );
}

export default Diseases;
