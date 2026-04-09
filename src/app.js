const express = require("express");
const cors = require("cors");
const errorMiddleware = require("./middlewares/error.middleware");
const referenciaRoutes = require("./routes/referencia.routes");
const agradecimientosRoutes = require("./routes/agradecimiento.routes");

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

app.use("/api/referencias", referenciaRoutes);
app.use("/api/agradecimientos", agradecimientosRoutes);
app.use(errorMiddleware);

// Ruta prueba
app.get("/", (req, res) => {
  res.send("API COEMAC funcionando");
});

module.exports = app;
