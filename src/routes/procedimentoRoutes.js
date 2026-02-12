const express = require("express");
const router = express.Router();
const ProcedimentoController = require("../controllers/ProcedimentoController");

router.post("/procedimentos", ProcedimentoController.create);
router.get("/procedimentos", ProcedimentoController.findAll);
router.get("/procedimentos/:id", ProcedimentoController.findById);
router.put("/procedimentos/:id", ProcedimentoController.update);
router.delete("/procedimentos/:id", ProcedimentoController.delete);

module.exports = router;
