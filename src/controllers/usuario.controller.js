const service = require("../services/usuario.service");

const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

// GET /api/usuarios
exports.getUsuarios = wrap(async (req, res) => {
  const data = await service.getAll();
  res.json(data);
});

// GET /api/usuarios/me
exports.getMe = wrap(async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const data = await service.getById(userId);
  res.json(data);
});

// PUT /api/usuarios/me
exports.updateMe = wrap(async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const data = await service.update(userId, req.body);
  res.json(data);
});

// GET /api/usuarios/:id
exports.getUsuario = wrap(async (req, res) => {
  const data = await service.getById(req.params.id);
  res.json(data);
});

// Change password
exports.changePassword = wrap(async (req, res) => {
  const userId = req.user.userId;

  const { currentPassword, newPassword } = req.body;

  await service.changePassword(userId, currentPassword, newPassword);

  res.json({
    success: true,
    message: "Password updated successfully",
  });
});
