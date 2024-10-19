import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Typography,
  Box,
  CircularProgress,
  Avatar,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";

function User() {
  const [users, setUsers] = useState([]); // Initialize users state
  const [filteredUsers, setFilteredUsers] = useState([]); // Filtered users
  const [error, setError] = useState(null); // Error state
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar state
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message
  const [loading, setLoading] = useState(true); // Loading state
  const [searchUsername, setSearchUsername] = useState(""); // Search username state
  const [filterStatus, setFilterStatus] = useState(""); // Filter status state

  // Fetch users on component mount
  useEffect(() => {
    axios
      .get("http://localhost/dogcare/admin/user.php")
      .then((response) => {
        if (Array.isArray(response.data)) {
          setUsers(response.data); // Set users if response is an array
          setFilteredUsers(response.data); // Initialize filtered users
        } else {
          setError("Invalid data format from API");
        }
        setLoading(false); // Stop loading once data is fetched
      })
      .catch((error) => {
        setError("Network error");
        setLoading(false);
      });
  }, []);

  // Handle status change
  const handleStatusChange = (userId, newStatus) => {
    axios
      .post("http://localhost/dogcare/admin/edituser.php", {
        user_id: userId,
        status: newStatus,
      })
      .then((response) => {
        // Update local state with new status after successful API call
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.user_id === userId ? { ...user, status: newStatus } : user
          )
        );
        // Set success message and open Snackbar
        setSnackbarMessage("เปลี่ยนสถานะสําเร็จ");
        setSnackbarOpen(true);
      })
      .catch((error) => {
        console.error("Error updating status:", error);
      });
  };

  // Handle search username
  const handleSearchUsername = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchUsername(value);
    filterUsers(value, filterStatus);
  };

  // Handle filter status
  const handleFilterStatus = (e) => {
    const value = e.target.value;
    setFilterStatus(value);
    filterUsers(searchUsername, value);
  };

  // Filter users based on search and status
  const filterUsers = (username, status) => {
    const filtered = users.filter((user) => {
      const matchUsername = user.username.toLowerCase().includes(username);
      const matchStatus = status ? user.status === status : true;
      return matchUsername && matchStatus;
    });
    setFilteredUsers(filtered);
  };

  // Handle Snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
        Error: {error}
      </div>
    );
  }

  return (
    <Box sx={{ padding: 4, backgroundColor: "#FFE1E1", minHeight: "100vh" }}>
      <Typography
        variant="h4"
        sx={{
          marginBottom: 4,
          fontWeight: "bold",
          textAlign: "center",
          color: "#000000",
        }}
      >
        ข้อมูลผู้ใช้
      </Typography>

      {/* Search and Filter */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 3,
        }}
      >
        <TextField
          label="ค้นหาผู้ใช้งาน"
          variant="outlined"
          value={searchUsername}
          onChange={handleSearchUsername}
          sx={{ width: "40%" }}
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

        <Select
          value={filterStatus}
          onChange={handleFilterStatus}
          displayEmpty
          sx={{ width: "20%", backgroundColor: "#FFF" }}
        >
          <MenuItem value="">
            <em>กรองตามสถานะ</em>
          </MenuItem>
          <MenuItem value="A">แอดมิน</MenuItem>
          <MenuItem value="F">ระงับการใช้งาน</MenuItem>
          <MenuItem value="U">ใช้งาน</MenuItem>
        </Select>
      </Box>

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="50vh"
        >
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "#FF8D8D" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>ชื่อผู้ใช้งาน</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>ชื่อ</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>นามสกุล</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>เบอร์โทรศัพท์</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>ไอดีไลน์</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>สถานะ</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>รูปภาพ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.firstname}</TableCell>
                    <TableCell>{user.lastname}</TableCell>
                    <TableCell>{user.tel}</TableCell>
                    <TableCell>{user.line_id}</TableCell>
                    <TableCell>
                      <Select
                        value={user.status || "U"}
                        onChange={(e) =>
                          handleStatusChange(user.user_id, e.target.value)
                        }
                        sx={{
                          minWidth: 120,
                          backgroundColor:
                            user.status === "F"
                              ? "#FFCDD2"
                              : user.status === "U"
                              ? "#C8E6C9"
                              : "#FFFFFF", // สีพื้นหลังตามสถานะ
                          color:
                            user.status === "F"
                              ? "#B71C1C"
                              : user.status === "U"
                              ? "#388E3C"
                              : "#000000", // สีตัวหนังสือตามสถานะ
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#000000", // สีกรอบเมื่อ focused
                          },
                        }}
                        disabled={user.status === "A"} // ปิดการเลือกถ้าสถานะเป็นแอดมิน
                      >
                        {user.status === "A" && (
                          <MenuItem value="A">แอดมิน</MenuItem>
                        )}
                        <MenuItem
                          value="F"
                          sx={{
                            backgroundColor: "#FFCDD2",
                            color: "#B71C1C",
                            "&.Mui-selected": {
                              backgroundColor: "#FFCDD2",
                              color: "#B71C1C",
                            },
                            "&:hover": {
                              backgroundColor: "#E57373",
                            },
                          }}
                        >
                          ระงับการใช้งาน
                        </MenuItem>
                        <MenuItem
                          value="U"
                          sx={{
                            backgroundColor: "#C8E6C9",
                            color: "#388E3C",
                            "&.Mui-selected": {
                              backgroundColor: "#C8E6C9",
                              color: "#388E3C",
                            },
                            "&:hover": {
                              backgroundColor: "#66BB6A",
                            },
                          }}
                        >
                          ใช้งาน
                        </MenuItem>
                      </Select>
                    </TableCell>

                    <TableCell>
                      {user.picture ? (
                        <Avatar
                          src={`http://localhost/dogcare/userimages/${user.picture}`}
                          alt="User Picture"
                        />
                      ) : (
                        <Avatar alt="Default Icon" />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    ไม่พบข้อมูล
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default User;
