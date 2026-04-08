const referenciaService = require("../services/referencia.service");

const getReferencias = async (req, res, next) => {
  try {
    const referencias = await referenciaService.getReferencias();
    res.json(referencias);
  } catch (error) {
    next(error);
  }
};

const getReferencia = async (req, res, next) => {
  try {
    const id = req.params.id;
    const referencia = await referenciaService.getReferencia(id);
    res.json(referencia);
  } catch (error) {
    next(error);
  }
};

const createReferencia = async (req, res, next) => {
  try {
    const referencia = await referenciaService.createReferencia(req.body);
    res
      .status(201)
      .json({ message: "Referencia created successfully", referencia });
  } catch (error) {
    next(error);
  }
};

// Deberíamos poder actualizar referencias Por ejemplo si nos equivocamos en datos del contacto
const updateReferencia = async (req, res, next) => {
  try {
    const id = req.params.id;
    const referencia = await referenciaService.updateReferencia(id, req.body);
    res.json(referencia);
  } catch (error) {
    next(error);
  }
};

// No deberíamos eliminar referencias, pero por si acaso, lo dejamos
const deleteReferencia = async (req, res, next) => {
  try {
    const id = req.params.id;
    const referencia = await referenciaService.deleteReferencia(id);
    res.json({
      message: `Referencia "${referencia.id}" eliminada correctamente`,
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
  deleteReferencia,
};
