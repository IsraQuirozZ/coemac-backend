const express = require("express");
const router = express.Router();
const reunionController = require("../controllers/reunion.controller");
const {
  createReunionValidator,
  updateReunionValidator,
  changeReunionStatusValidator,
} = require("../validators/reunion.validator");
const validateFields = require("../middlewares/validateFields");
const { protect } = require("../middlewares/auth.middleware");

router.use(protect);

// GET ALL
router.get("/", reunionController.getReuniones);

// GET BY ID
router.get("/:id", reunionController.getReunion);

// CREATE
router.post(
  "/",
  createReunionValidator,
  validateFields,
  reunionController.createReunion,
);

// UPDATE
router.patch(
  "/:id",
  updateReunionValidator,
  validateFields,
  reunionController.updateReunion,
);

// MARK AS VIEWED
router.patch("/:id/viewed", reunionController.markAsViewed);

// CHANGE STATUS
router.patch(
  "/:id/status",
  changeReunionStatusValidator,
  validateFields,
  reunionController.changeReunionStatus,
);

// DELETE
router.delete("/:id", reunionController.deleteReunion);

module.exports = router;
