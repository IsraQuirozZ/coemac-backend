const reunionService = require("../services/reunion.service");

// GET ALL
const getReuniones = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { direction, estado, page, limit } = req.query;

    const reuniones = await reunionService.getReuniones({
      userId,
      direction,
      estado,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });
    res.json(reuniones);
  } catch (error) {
    next(error);
  }
};

// GET BY ID
const getReunion = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const reunion = await reunionService.getReunion(req.params.id, userId);
    res.json(reunion);
  } catch (error) {
    next(error);
  }
};

// CREATE
const createReunion = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const reunion = await reunionService.createReunion(req.body, userId);
    res.status(201).json({
      success: true,
      message: "Reunion created successfully",
      data: reunion,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE
const updateReunion = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const reunion = await reunionService.updateReunion(id, req.body, userId);
    res.json(reunion);
  } catch (error) {
    next(error);
  }
};

// MARK AS VIEWED
const markAsViewed = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const reunion = await reunionService.markAsViewed(id, userId);
    res.json(reunion);
  } catch (error) {
    next(error);
  }
};

const changeReunionStatus = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { estado } = req.body;
    const reunion = await reunionService.changeReunionStatus(
      id,
      userId,
      estado,
    );
    res.json(reunion);
  } catch (error) {
    next(error);
  }
};

// DELETE
const deleteReunion = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const reunion = await reunionService.deleteReunion(id, userId);
    res.json({
      message: `Reunion "${reunion.id}" deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReuniones,
  getReunion,
  createReunion,
  updateReunion,
  markAsViewed,
  changeReunionStatus,
  deleteReunion,
};
