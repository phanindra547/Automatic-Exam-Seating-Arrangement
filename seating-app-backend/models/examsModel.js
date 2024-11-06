const mongoose = require("mongoose");

const examScheduleSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  time: { type: String, required: true },
  semester: { type: String, required: true },
  branch: { type: String, required: true },
  subject: { type: String, required: true },
  fileName: { type: String, required: true },
});

const ExamSchedule = mongoose.model("ExamSchedule", examScheduleSchema);

module.exports = ExamSchedule;
