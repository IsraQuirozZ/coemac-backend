const express = require("express");
const cors = require("cors");

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Ruta prueba
app.get("/", (req, res) => {
  res.send("¡Hola, mundo!");
});

module.exports = app;
