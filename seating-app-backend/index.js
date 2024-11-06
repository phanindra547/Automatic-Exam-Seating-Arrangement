const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const multer = require("multer");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 3001;
app.post("/allocateRooms", async (req, res) => {
  try {
    const { numberOfRooms, roomStrengths, roomNames, departments } = req.body;

    if (
      !numberOfRooms ||
      !roomStrengths ||
      !roomNames ||
      !departments ||
      roomStrengths.length !== numberOfRooms ||
      roomNames.length !== numberOfRooms ||
      departments.length !== numberOfRooms
    ) {
      return res.status(400).json({ message: "Invalid input parameters" });
    }

    const cseStudents = await Student.find({ department: "CSE" });
    const eceStudents = await Student.find({ department: "ECE" });

    const allocatedStudents = [];

    for (let i = 0; i < numberOfRooms; i++) {
      const roomStrength = roomStrengths[i];
      const roomName = roomNames[i];

      const room = {
        name: roomName,
        strength: roomStrength,
        students: [],
      };

      for (let j = 0; j < roomStrength; j++) {
        const cseStudent = cseStudents[j % cseStudents.length];
        const eceStudent = eceStudents[j % eceStudents.length];

        if (cseStudent) {
          room.students.push({
            name: cseStudent.name,
            department: cseStudent.department,
            bench: j + 1,
            roomNumber: roomName,
          });
        }

        if (eceStudent) {
          room.students.push({
            name: eceStudent.name,
            department: eceStudent.department,
            bench: j + 1,
            roomNumber: roomName,
          });
        }
      }

      allocatedStudents.push(room);
    }

    res.status(200).json(allocatedStudents);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());

mongoose.connect("mongodb://localhost:27017/seating-app", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});

db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes
app.use("/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
