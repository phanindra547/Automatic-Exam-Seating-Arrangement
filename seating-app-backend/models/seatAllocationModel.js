const mongoose = require("mongoose");

const seatAllocationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    classroom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    seatNumber: { type: Number, required: true },
  },
  { collection: "seatallocation" }
);

const SeatAllocation = mongoose.model("SeatAllocation", seatAllocationSchema);

module.exports = SeatAllocation;
