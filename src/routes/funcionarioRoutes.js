const express = require('express');
const router = express.Router();
const FuncionarioController = require('../controllers/FuncionarioController');

router.post('/funcionarios', FuncionarioController.create);
router.get('/funcionarios', FuncionarioController.findAll);
router.get('/funcionarios/:id', FuncionarioController.findById);
router.put('/funcionarios/:id', FuncionarioController.update);
router.delete('/funcionarios/:id', FuncionarioController.delete);
router.get('/funcionarios/tipo/:tipo', FuncionarioController.findByTipo);
router.post('/funcionarios/certificacao', FuncionarioController.addCertificacao);
router.get('/funcionarios/certificacoes/:nome', FuncionarioController.getCertificacoes);

module.exports = router;