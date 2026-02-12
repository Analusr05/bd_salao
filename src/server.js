const express = require("express");
const cors = require("cors");
require("dotenv").config();

const funcionarioRoutes = require("./routes/funcionarioRoutes");
const clienteRoutes = require("./routes/clienteRoutes");
const agendaRoutes = require("./routes/agendaRoutes");
const procedimentoRoutes = require("./routes/procedimentoRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use("/api", funcionarioRoutes);
app.use("/api", clienteRoutes);
app.use("/api", agendaRoutes);
app.use("/api", procedimentoRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "API Salão de Beleza funcionando!",
    version: "1.0.0",
    endpoints: {
      funcionarios: "/api/funcionarios",
      clientes: "/api/clientes",
      agenda: "/api/agenda",
      procedimentos: "/api/procedimentos",
      "agenda-completa": "/api/agenda/completa",
      "agenda-por-funcionario": "/api/agenda/funcionario/:nome",
    },
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: "Rota não encontrada",
    path: req.url,
    method: req.method,
  });
});

app.use((err, req, res, next) => {
  console.error("Erro:", err);
  res.status(500).json({
    error: "Erro interno do servidor",
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em: http://localhost:${PORT}`);
});
