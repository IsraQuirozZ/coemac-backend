const service = require("../services/incidencias.service");

// Helper: envuelve handlers async y centraliza errores
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

// GET /incidencias
exports.getIncidencias = wrap(async (req, res) => {
  const usuarioId = req.user.id || req.user.userId; // Usuario autenticado

  const data = await service.getAll({ usuarioId });
  res.json(data);
});

// GET /incidencias/:id
exports.getIncidencia = wrap(async (req, res) => {
  const data = await service.getById(req.params.id);
  res.json(data);
});

// POST /incidencias
exports.createIncidencia = wrap(async (req, res) => {
  const dataConUsuario = {
    ...req.body,
    usuarioId: req.user.id || req.user.userId,
  };
  
  const data = await service.create(dataConUsuario);
  res.status(201).json(data);
});

// PUT /incidencias/:id
exports.updateIncidencia = wrap(async (req, res) => {
  const data = await service.update(req.params.id, req.body);
  res.json(data);
});

// DELETE /incidencias/:id
exports.deleteIncidencia = wrap(async (req, res) => {
  const usuarioId = req.user.id || req.user.userId;
  await service.remove(req.params.id, usuarioId);
  res.status(204).send();
});