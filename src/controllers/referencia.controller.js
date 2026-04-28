const referenciaService = require("../services/referencia.service");

const getReferencias = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const isAdmin = req.user.rol === "ADMIN";
    const { direction, tipo, page, limit } = req.query;

    const referencias = await referenciaService.getReferencias({
      userId,
      isAdmin,
      direction,
      tipo,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });
    res.json(referencias);
  } catch (error) {
    next(error);
  }
};

const getReferencia = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const isAdmin = req.user.rol === "ADMIN";
    const { id } = req.params;
    const referencia = await referenciaService.getReferencia(
      id,
      userId,
      isAdmin,
    );
    res.json(referencia);
  } catch (error) {
    next(error);
  }
};

// CREATE
const createReferencia = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const referencia = await referenciaService.createReferencia(
      req.body,
      userId,
    );
    res.status(201).json({
      success: true,
      message: "Referencia created successfully",
      data: referencia,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE
const updateReferencia = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const referencia = await referenciaService.updateReferencia(
      id,
      req.body,
      userId,
    );
    res.json(referencia);
  } catch (error) {
    next(error);
  }
};

// MARK AS VIEWED
const markAsViewed = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const referencia = await referenciaService.markAsViewed(id, userId);
    res.json(referencia);
  } catch (error) {
    next(error);
  }
};

// DELETE
const deleteReferencia = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const referencia = await referenciaService.deleteReferencia(id, userId);
    res.json({
      message: `Referencia "${referencia.id}" deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReferencias,
  getReferencia,
  createReferencia,
  updateReferencia,
  markAsViewed,
  deleteReferencia,
};
