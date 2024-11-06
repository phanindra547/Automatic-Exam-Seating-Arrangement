import React, { useState, useEffect } from "react";
import { TextField, Button, Select, MenuItem, InputLabel } from "@mui/material";
import "../styles/classroomsPage.css";
import "../styles/Allocation.css";

const Allocation = () => {
  const [selectedBranches, setSelectedBranches] = useState("");
  const [examHalls, setExamHalls] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [statistics, setStatistics] = useState({
    totalRooms: 0,
    availableRooms: 0,
    roomsSelected: 0,
    seatsSelected: 0,
    totalParticipants: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examHallsResponse, departmentsResponse] = await Promise.all([
          fetch("http://localhost:3001/admin/get-classrooms"),
          fetch("http://localhost:3001/admin/get-department"),
        ]);

        if (examHallsResponse.ok) {
          const classrooms = await examHallsResponse.json();
          const hallsData = classrooms.map((classroom) => ({
            name: classroom.Room_Number,
            capacity: classroom.Available_Seats,
          }));
          setExamHalls(hallsData);
        } else {
          throw new Error("Failed to fetch exam halls from the server");
        }

        if (departmentsResponse.ok) {
          const departmentsData = await departmentsResponse.json();
          setDepartments(departmentsData);
        } else {
          throw new Error("Failed to fetch departments from the server");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, []);

  const handleBranchChange = (event) => {
    const { value } = event.target;
    setSelectedBranches(value);
  };
  const [selectedHalls, setSelectedHalls] = useState([]);

  const handleHallSelection = (hallName) => {
    if (selectedHalls.includes(hallName)) {
      setSelectedHalls(selectedHalls.filter((hall) => hall !== hallName));
    } else {
      setSelectedHalls([...selectedHalls, hallName]);
    }
  };

  useEffect(() => {
    const totalRooms = examHalls.length;
    const availableRooms = examHalls.filter((hall) => hall.capacity > 0).length;
    const roomsSelected = selectedHalls.length;

    if (selectedBranches) {
      fetch(`http://localhost:3001/admin/get-total-participants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ selectedBranch: selectedBranches }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          setStatistics({
            totalRooms,
            availableRooms,
            roomsSelected,
            seatsSelected: selectedHalls.reduce(
              (totalSeats, hallName) =>
                totalSeats +
                examHalls.find((hall) => hall.name === hallName)?.capacity,
              0
            ),
            totalParticipants: data.totalStudents || 0,
          });
        })
        .catch((error) =>
          console.error("Error fetching total participants:", error)
        );
    } else {
      setStatistics({
        totalRooms,
        availableRooms,
        roomsSelected,
        seatsSelected: selectedHalls.reduce(
          (totalSeats, hallName) =>
            totalSeats +
            examHalls.find((hall) => hall.name === hallName)?.capacity,
          0
        ),
        totalParticipants: 0,
      });
    }
  }, [examHalls, selectedHalls, selectedBranches]);

  const handleArrangeSeats = () => {
    if (!selectedBranches || selectedHalls.length === 0) {
      console.error("Invalid input parameters");
      return;
    }

    const requestData = {
      selectedBranch: selectedBranches,
      selectedHalls,
      hallCapacities: selectedHalls.map(
        (hall) => examHalls.find((examHall) => examHall.name === hall)?.capacity
      ),
    };


    fetch("http://localhost:3001/admin/allocate-rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Rooms allocated successfully:", data);
        // Handle any additional logic based on the backend response
      })
      .catch((error) => console.error("Error allocating rooms:", error));
  };

  return (
    <div className="classrooms">
      <h2>Seat Allocation Page</h2>
      <div className="fields">
        <div className="f1">
          <InputLabel htmlFor="select-date">Select Date</InputLabel>
          <TextField id="select-date" type="date" />
        </div>
        <div className="f1">
          <InputLabel htmlFor="select-time">Time</InputLabel>
          <TextField id="select-time" type="time" />
        </div>
        <div className="f1">
          <InputLabel htmlFor="select-branch">Select Branches</InputLabel>
          <Select
            id="select-branch"
            //multiple
            value={selectedBranches}
            onChange={handleBranchChange}
            // renderValue={(selected) => selected.join(", ")}
          >
            {departments.map((department) => (
              <MenuItem key={department} value={department}>
                {department}
              </MenuItem>
            ))}
          </Select>
        </div>
      </div>
      <div>
        <h2>Select Exam Halls:</h2>
        <div className="hall-list">
          {examHalls.map((hall, index) => (
            <div key={index} className="hall-box">
              <label>
                <input
                  type="checkbox"
                  value={hall.name}
                  checked={selectedHalls.includes(hall.name)}
                  onChange={() => handleHallSelection(hall.name)}
                />
                <div className="hall-info">
                  <div className="hall-name">Room Number: {hall.name}</div>
                  <div className="hall-capacity">
                    Number Of Benches: {hall.capacity}
                  </div>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>
      <div className="statistics-block">
        <h2>Statistics</h2>
        <div>Total Rooms: {statistics.totalRooms}</div>
        <div>Available Rooms: {statistics.availableRooms}</div>
        <div>Rooms Selected: {statistics.roomsSelected}</div>
        <div>Seats Selected: {statistics.seatsSelected}</div>
        <div>Total Participants: {statistics.totalParticipants}</div>
      </div>
      <div className="below">
        <div className="total-seats-section"></div>
        <div className="action-buttons">
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleArrangeSeats}
          >
            Arrange
          </Button>
          <Button variant="contained" color="primary">
            Receive Mail
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Allocation;
