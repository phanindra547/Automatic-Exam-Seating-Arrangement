const ExamSchedule = require("../models/examsModel");
const Student = require("../models/studentModel");
const csv = require("csv-parser");
const stream = require("stream");
const Readable = stream.Readable;
const csvParser = require("csv-parser");

const examsController = {
  addExamSchedule: async (req, res) => {
    try {
      const { date, time, semester, branch, subject, fileName } = req.body;

      // Create a new exam schedule instance
      const newExamSchedule = new ExamSchedule({
        date,
        time,
        semester,
        branch,
        subject,
        fileName,
      });

      // Save the new exam schedule to the database
      await newExamSchedule.save();

      // Instead of sending just a success message, send the added exam data
      res.status(201).json({
        message: "Exam schedule added successfully",
        addedExam: newExamSchedule, // Include the added exam data
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getExamSchedules: async (req, res) => {
    try {
      // Retrieve all exam schedules from the database
      const examSchedules = await ExamSchedule.find();

      res.status(200).json(examSchedules);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  deleteAllExamSchedules: async (req, res) => {
    try {
      await ExamSchedule.deleteMany();

      res
        .status(200)
        .json({ message: "All exam schedules deleted successfully" });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  uploadStudentsCSV: async (req, res) => {
    try {
      if (!req.files || !req.files.csvFile) {
        return res.status(400).send({ error: "No CSV file found" });
      }

      const students = [];

      const csvFile = req.files.csvFile;

      const stream = Readable.from(csvFile.data);

      stream
        .pipe(csvParser())
        .on("data", (row) => {
          students.push(row);
        })
        .on("end", async () => {
          try {
            // Save all students to the students collection
            await Student.insertMany(students);

            // Count the number of students
            const studentsCount = students.length;

            console.log("Total students count:", studentsCount);

            res.status(200).json({
              message: "Students added from CSV.",
              studentsCount,
            });
          } catch (error) {
            console.error("Error saving students to the database:", error);
            res
              .status(500)
              .send("An error occurred while saving students to the database.");
          }
        })
        .on("error", (error) => {
          console.error("Error during CSV parsing:", error);
          res
            .status(500)
            .send("An error occurred while processing the CSV file.");
        });
    } catch (error) {
      console.error("Error processing CSV file:", error);
      res.status(500).send("An error occurred while processing the CSV file.");
    }
  },
  getdepartments: async (req, res) => {
    try {
      // Retrieve all unique departments from the database
      const students = await Student.find();
      const uniqueDepartments = [
        ...new Set(students.map((student) => student.department)),
      ];

      res.status(200).json(uniqueDepartments);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getTotalParticipants: async (req, res) => {
    try {
      const { selectedBranch } = req.body;

      if (!selectedBranch) {
        return res
          .status(400)
          .json({ error: "Invalid input: selectedBranch is required" });
      }

      const totalStudents = await Student.countDocuments({
        department: selectedBranch,
      });

      res.status(200).json({
        branch: selectedBranch,
        totalStudents,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  allocateRooms: async (req, res) => {
    try {
      const { selectedBranch, selectedHalls, hallCapacities } = req.body;

      if (
        !selectedBranch ||
        !selectedHalls ||
        selectedHalls.length === 0 ||
        !hallCapacities
      ) {
        return res.status(400).json({ message: "Invalid input parameters" });
      }

      const students = await Student.find({ department: selectedBranch });

      const allocatedRooms = {};

      let currentIndex = 0;
      for (let i = 0; i < selectedHalls.length; i++) {
        const hall = selectedHalls[i];
        const capacity = hallCapacities[i];

        console.log(`Allocating students for ${hall} (Capacity: ${capacity})`);

        const hallStudents = students.slice(
          currentIndex,
          currentIndex + capacity
        );

        console.log(`Available students for ${hall}:`, hallStudents);

        const room = {
          hallName: hall,
          students: hallStudents.map((student, index) => ({
            ...student.toObject(),
            seatNumber: index + 1,
          })),
        };

        console.log(`Allocated students for ${hall}:`, room.students);

        currentIndex += capacity;

        allocatedRooms[selectedBranch] = allocatedRooms[selectedBranch] || {};
        allocatedRooms[selectedBranch][hall] = {
          startRegisterNumber:
            hallStudents.length > 0 ? hallStudents[0].registerNumber : null,
          endRegisterNumber:
            hallStudents.length > 0
              ? hallStudents[hallStudents.length - 1].registerNumber
              : null,
        };
      }

      console.log("Final Allocated Rooms:", allocatedRooms);

      res.status(200).json(allocatedRooms);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = examsController;
