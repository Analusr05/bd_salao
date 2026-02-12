const express = require('express');
const router = express.Router();
const ClienteController = require('../controllers/ClienteController');

router.post('/clientes', ClienteController.create);
router.get('/clientes', ClienteController.findAll);
router.get('/clientes/:id', ClienteController.findById);
router.put('/clientes/:id', ClienteController.update);
router.delete('/clientes/:id', ClienteController.delete);

module.exports = router;