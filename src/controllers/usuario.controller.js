const usuarioService = require("../services/usuario.service");

const getUsuarios = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const users = await usuarioService.getUsuarios(userId);
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// Create user (REGISTER) is handled by auth.controller.js

const updateUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await usuarioService.updateUser(id, req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await usuarioService.deleteUser(id);
    res.json({
      message: `User "${user.id}" deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsuarios,
};
