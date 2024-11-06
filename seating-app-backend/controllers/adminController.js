const jwt = require("jsonwebtoken");
const secretKey = "hsdbkjsbdkvbsdb";
const csvParser = require("csv-parser");
const fs = require("fs");
const Admin = require("../models/adminModel");
const Classroom = require("../models/classroomModel");
const Student = require("../models/studentModel");
const SeatAllocation = require("../models/seatAllocationModel");
const { Readable } = require("readable-stream");

const adminController = {
  login: async (req, res) => {
    const { username, password } = req.body;

    try {
      const admin = await Admin.findOne({ username, password });

      if (!admin) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        { username: admin.username, role: "admin" },
        secretKey,
        { expiresIn: "1h" }
      );

      res.status(200).json({ message: "Login successful", token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  addClassrooms: async (req, res) => {
    try {
      const { Room_Number, Floor_Number, Block, Available_Seats } = req.body;
      console.log(Room_Number, Floor_Number, Block, Available_Seats);
      const newClassroom = new Classroom({
        Room_Number,
        Floor_Number,
        Block,
        Available_Seats,
      });
      console.log("new data: ", newClassroom);

      const savedClassroom = await newClassroom.save();

      res.status(201).json(savedClassroom);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  deleteClassroom: async (req, res) => {
    try {
      const classroomId = req.params.id;

      // Find the classroom by ID and delete it from the database
      const deletedClassroom = await Classroom.findByIdAndDelete(classroomId);

      if (deletedClassroom) {
        // Send a success response if the classroom was deleted
        res.status(200).json({ message: "Classroom deleted successfully" });
      } else {
        // Send a not found response if the classroom with the given ID was not found
        res.status(404).json({ message: "Classroom not found" });
      }
    } catch (error) {
      // Handle errors
      console.error("Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  deleteAllClassrooms: async (req, res) => {
    try {
      // Delete all classrooms from the database
      const deletedClassrooms = await Classroom.deleteMany({});

      if (deletedClassrooms) {
        // Send a success response if all classrooms were deleted
        res
          .status(200)
          .json({ message: "All classrooms deleted successfully" });
      } else {
        // Send a not found response if no classrooms were found
        res.status(404).json({ message: "No classrooms found to delete" });
      }
    } catch (error) {
      // Handle errors
      console.error("Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getClassrooms: async (req, res) => {
    try {
      const classrooms = await Classroom.find();

      res.json(classrooms);
    } catch (error) {
      console.error("Error fetching classrooms:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

module.exports = adminController;
