const express = require("express");
const cors = require("cors");
const errorMiddleware = require("./middlewares/error.middleware");
const authRoutes = require("./routes/auth.routes");
const usuarioRoutes = require("./routes/usuario.routes");
const referenciaRoutes = require("./routes/referencia.routes");
const reunionRoutes = require("./routes/reunion.routes");
const agradecimientosRoutes = require("./routes/agradecimiento.routes");
const incidenciasRoutes = require("./routes/incidencias.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/referencias", referenciaRoutes);
app.use("/api/reuniones", reunionRoutes);
app.use("/api/agradecimientos", agradecimientosRoutes);
app.use("/api/incidencias", incidenciasRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use(errorMiddleware);

// Ruta prueba
app.get("/", (req, res) => {
  res.send("API COEMAC funcionando");
});

module.exports = app;
