const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const adminExamController = require("../controllers/adminExamController");

router.post("/login", adminController.login);
router.post("/add-classrooms", adminController.addClassrooms);
router.delete("/delete-classroom/:id", adminController.deleteClassroom);
router.delete("/delete-all-classrooms", adminController.deleteAllClassrooms);
router.get("/get-classrooms", adminController.getClassrooms);
router.post("/add-exam", adminExamController.addExamSchedule);
router.get("/get-exam-schedules", adminExamController.getExamSchedules);
router.delete(
  "/delete-all-exam-schedules",
  adminExamController.deleteAllExamSchedules
);
router.post("/upload-students-csv", adminExamController.uploadStudentsCSV);
router.get("/get-department", adminExamController.getdepartments);
router.post("/allocate-rooms", adminExamController.allocateRooms);
router.post(
  "/get-total-participants",
  adminExamController.getTotalParticipants
);
module.exports = router;
