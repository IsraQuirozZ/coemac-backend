const service = require("../services/agradecimiento.service");

// Helper: envuelve handlers async y centraliza errores
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

// GET /agradecimientos?emisorId=&receptorId=
exports.getAgradecimientos = wrap(async (req, res) => {
  const data = await service.getAll(req.query);
  res.json(data);
});

// GET /agradecimientos/:id
exports.getAgradecimiento = wrap(async (req, res) => {
  const data = await service.getById(req.params.id);
  res.json(data);
});

// POST /agradecimientos
exports.createAgradecimiento = wrap(async (req, res) => {
  const data = await service.create(req.body);
  res.status(201).json(data);
});

// PUT /agradecimientos/:id
exports.updateAgradecimiento = wrap(async (req, res) => {
  const data = await service.update(req.params.id, req.body);
  res.json(data);
});

// DELETE /agradecimientos/:id
exports.deleteAgradecimiento = wrap(async (req, res) => {
  await service.remove(req.params.id);
  res.status(204).send();
});