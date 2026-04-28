const service = require("../services/agradecimiento.service");

// Helper: envuelve handlers async y centraliza errores
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

// GET /agradecimientos?emisorId=&receptorId=
exports.getAgradecimientos = wrap(async (req, res) => {
  const userId = req.user.userId;
  const isAdmin = req.user.rol === "ADMIN";

  const filters = {
    userId, // Filtra por el usuario autenticado
    isAdmin,
    direction: req.query.direction, // Dirección (emisor o receptor)
  };
  const data = await service.getAll(filters);
  res.json(data);
});

// GET /agradecimientos/:id
exports.getAgradecimiento = wrap(async (req, res) => {
  const userId = req.user.userId;
  const isAdmin = req.user.rol === "ADMIN";
  const { id } = req.params;

  const data = await service.getById(id, userId, isAdmin);
  res.json(data);
});

// POST /agradecimientos
exports.createAgradecimiento = wrap(async (req, res) => {
  const dataConEmisor = {
    ...req.body,
    emisorId: req.user.userId,
  };
  const data = await service.create(dataConEmisor);
  res.status(201).json(data);
});

// PUT /agradecimientos/:id
exports.updateAgradecimiento = wrap(async (req, res) => {
  const data = await service.update(req.params.id, req.body);
  res.json(data);
});

// DELETE /agradecimientos/:id
exports.deleteAgradecimiento = wrap(async (req, res) => {
  const userId = req.user.userId;
  await service.remove(req.params.id, userId);
  res.status(204).send();
});
