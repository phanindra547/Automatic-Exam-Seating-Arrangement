const mongoose = require("mongoose");

const classroomSchema = new mongoose.Schema({
  Room_Number: { type: String, required: true },
  Floor_Number: { type: Number, required: true },
  Block: { type: String, required: true },
  Available_Seats: { type: Number, required: true },
});

const Classroom = mongoose.model("Classroom", classroomSchema);

module.exports = Classroom;
