import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import "../styles/classroomsPage.css";

const ClassroomsPage = () => {
  const [roomNumber, setRoomNumber] = useState("");
  const [floorNumber, setFloorNumber] = useState("");
  const [block, setBlock] = useState("A");
  const [availableSeats, setAvailableSeats] = useState("");
  const [availableRooms, setAvailableRooms] = useState([]);

  const fetchAvailableRooms = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/admin/get-classrooms"
      );

      if (response.ok) {
        const availableRoomsData = await response.json();
        setAvailableRooms(availableRoomsData);
        localStorage.setItem(
          "availableRooms",
          JSON.stringify(availableRoomsData)
        );
      } else {
        console.error("Failed to fetch exam schedules");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    const storedAvailableRooms = localStorage.getItem("availableRooms");

    if (storedAvailableRooms) {
      setAvailableRooms(JSON.parse(storedAvailableRooms));
    } else {
      fetchAvailableRooms();
    }
  }, []);

  const handleAddRoom = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/admin/add-classrooms",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Room_Number: roomNumber,
            Floor_Number: floorNumber,
            Block: block,
            Available_Seats: availableSeats,
          }),
        }
      );

      if (response.ok) {
        const { _id } = await response.json(); // Extract _id from server response

        const newRoom = {
          _id, // Include _id when adding a new room
          roomNumber,
          floorNumber,
          block,
          availableSeats,
        };

        setAvailableRooms([...availableRooms, newRoom]);

        setRoomNumber("");
        setFloorNumber("");
        setBlock("A");
        setAvailableSeats("");
      } else {
        console.error("Failed to add classroom");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // const handleDeleteRoom = (index) => {
  //   const updatedRooms = [...availableRooms];
  //   updatedRooms.splice(index, 1);
  //   setAvailableRooms(updatedRooms);
  // };

  const handleDeleteRoom = async (index) => {
    try {
      const classroomId = availableRooms[index]._id;

      const response = await fetch(
        `http://localhost:3001/admin/delete-classroom/${classroomId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Classroom deleted successfully, update frontend state
        const updatedRooms = [...availableRooms];
        updatedRooms.splice(index, 1);
        setAvailableRooms(updatedRooms);
      } else {
        // Handle errors if any
        console.error("Failed to delete classroom");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // const handleClearAll = () => {
  //   setAvailableRooms([]);
  // };

  const handleClearAll = async () => {
    // Display a confirmation dialog
    const shouldClearAll = window.confirm(
      "Are you sure you want to clear all rooms?"
    );

    if (shouldClearAll) {
      try {
        // Delete all classrooms in the database
        const response = await fetch(
          "http://localhost:3001/admin/delete-all-classrooms",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          // Clear all rooms in the application state
          setAvailableRooms([]);
          alert("All rooms cleared successfully!");
        } else {
          // Handle errors if any
          console.error("Failed to clear all classrooms");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const navigate = useNavigate();

  const handleNext = () => {
    // Navigate to the exams page
    navigate("/exams");
  };

  const getTotalAvailableSeats = () => {
    const totalSeats = availableRooms.reduce(
      (total, room) => total + parseInt(room.availableSeats),
      0
    );
    return totalSeats;
  };

  return (
    <div className="classrooms">
      <h2>ADD ROOM</h2>
      <div className="fields">
        <div className="f1">
          <InputLabel htmlFor="room-number">Room Number</InputLabel>
          <TextField
            id="room-number"
            type="text"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
          />
        </div>
        <div className="f1">
          <InputLabel htmlFor="floor-number">Floor Number</InputLabel>
          <TextField
            id="floor-number"
            type="text"
            value={floorNumber}
            onChange={(e) => setFloorNumber(e.target.value)}
          />
        </div>
        <div className="f1">
          <InputLabel htmlFor="block">Block</InputLabel>
          <Select
            id="block"
            value={block}
            onChange={(e) => setBlock(e.target.value)}
          >
            <MenuItem value="A">A</MenuItem>
            <MenuItem value="B">B</MenuItem>
            <MenuItem value="C">C</MenuItem>
          </Select>
        </div>
        <div className="f1">
          <InputLabel htmlFor="available-seats">Available Seats</InputLabel>
          <TextField
            id="available-seats"
            type="text"
            value={availableSeats}
            onChange={(e) => setAvailableSeats(e.target.value)}
          />
        </div>
        <div className="f1">
          <Button
            className="add-button"
            style={{ backgroundColor: "#9f9894", color: "white" }}
            onClick={handleAddRoom}
          >
            ADD
          </Button>
        </div>
      </div>

      <div>
        <h2>Available Rooms</h2>
        <TableContainer component={Paper} className="TableContainer">
          <Table className="Table">
            <TableHead className="TableHead">
              <TableRow>
                <TableCell className="TableHeadCell">Room Number</TableCell>
                <TableCell className="TableHeadCell">Floor Number</TableCell>
                <TableCell className="TableHeadCell">Block</TableCell>
                <TableCell className="TableHeadCell">Available Seats</TableCell>
                <TableCell className="TableHeadCell"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {availableRooms.map((room, index) => (
                <TableRow key={index} className="TableRow">
                  <TableCell>{room.roomNumber}</TableCell>
                  <TableCell>{room.floorNumber}</TableCell>
                  <TableCell>{room.block}</TableCell>
                  <TableCell>{room.availableSeats}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDeleteRoom(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <div className="below">
        <div className="total-seats-section">
          <p>Total Available Seats: {getTotalAvailableSeats()}</p>
        </div>

        <div className="action-buttons">
          <Button variant="outlined" color="secondary" onClick={handleClearAll}>
            Clear All
          </Button>
          <Button variant="contained" color="primary" onClick={handleNext}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClassroomsPage;
