const userService = require("../services/user.service");

const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await userService.getUser(id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Create user (REGISTER) is handled by auth.controller.js

const updateUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await userService.updateUser(id, req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await userService.deleteUser(id);
    res.json({
      message: `User "${user.id}" deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
