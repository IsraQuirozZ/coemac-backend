const express = require("express");
const cors = require("cors");
const errorMiddleware = require("./middlewares/error.middleware");
const authRoutes = require("./routes/auth.routes");
const usuarioRoutes = require("./routes/usuario.routes");
const referenciaRoutes = require("./routes/referencia.routes");

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/referencias", referenciaRoutes);

app.use(errorMiddleware);

// Ruta prueba
app.get("/", (req, res) => {
  res.send("API COEMAC funcionando");
});

module.exports = app;
