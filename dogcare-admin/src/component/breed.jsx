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
import EditBreedModal from './editbreed';

function Breed() {
  const [breeds, setBreeds] = useState([]);
  const [error, setError] = useState(null);
  const [selectedBreed, setSelectedBreed] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [breedToDelete, setBreedToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8); // Rows per page
  const navigate = useNavigate();

  const truncateText = (text, maxLength = 200) => {
    return text && text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

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
    <>
      <TableContainer component={Paper} style={{ marginTop: '20px' }}>
        <Typography variant="h4" gutterBottom style={{ padding: '16px' }}>
          ข้อมูลสายพันธุ์
        </Typography>
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={handleAddBreedClick}
          style={{ marginBottom: '16px' }}
        >
          เพิ่มสายพันธุ์
        </Button>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Breed ID</TableCell>
              <TableCell>Breed Name</TableCell>
              <TableCell>Picture</TableCell>
              <TableCell>Region</TableCell>
              <TableCell>Weight</TableCell>
              <TableCell>Height</TableCell>
              <TableCell>Lifespan</TableCell>
              <TableCell>Nature</TableCell>
              <TableCell>Character</TableCell>
              <TableCell>Problem</TableCell>
              <TableCell>Nutrition</TableCell>
              <TableCell>Record</TableCell>
              <TableCell>Actions</TableCell>
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
                      <img src={breed.picture} alt={breed.breed_name} width="50" height="50" />
                    ) : (
                      'No Picture'
                    )}
                  </TableCell>
                  <TableCell>{breed.region}</TableCell>
                  <TableCell>{breed.weight}</TableCell>
                  <TableCell>{breed.height}</TableCell>
                  <TableCell>{breed.lifespan}</TableCell>
                  <TableCell>{truncateText(breed.nature)}</TableCell>
                  <TableCell>{truncateText(breed.charac)}</TableCell>
                  <TableCell>{truncateText(breed.problem)}</TableCell>
                  <TableCell>{truncateText(breed.Nutrition)}</TableCell>
                  <TableCell>{truncateText(breed.record)}</TableCell>
                  <TableCell>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={() => handleEditClick(breed)}
                    >
                      แก้ไข
                    </Button>
                    <Button 
                      variant="contained" 
                      color="error" 
                      onClick={() => handleDeleteClick(breed)}
                      style={{ marginLeft: '8px' }}
                    >
                      ลบ
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={13}>No breeds found</TableCell>
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
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this breed?
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
    </>
  );
}

export default Breed;
