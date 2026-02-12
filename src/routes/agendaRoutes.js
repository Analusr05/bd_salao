const express = require("express");
const router = express.Router();
const AgendaController = require("../controllers/AgendaController");

router.get("/agenda-completa", AgendaController.getAgendaCompleta);
router.get("/agenda-funcionario/:nome", AgendaController.findByFuncionario);
router.post("/agenda", AgendaController.create);
router.get("/agenda", AgendaController.findAll);
router.put("/agenda/:id", AgendaController.update);
router.delete("/agenda/:id", AgendaController.delete);
router.patch("/agenda/:id/status", AgendaController.updateStatus);

module.exports = router;
