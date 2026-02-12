const ProcedimentoDAO = require('../dao/ProcedimentoDAO');

const ProcedimentoController = {
  create: async (req, res) => {
    try {
      const { nome, preco, duracao } = req.body;
      
      if (!nome || !preco || !duracao) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      const procedimento = await ProcedimentoDAO.create({ nome, preco, duracao });
      res.status(201).json({ message: 'Procedimento criado com sucesso', data: procedimento });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar procedimento', details: error.message });
    }
  },

  findAll: async (req, res) => {
    try {
      const procedimentos = await ProcedimentoDAO.findAll();
      res.json({ count: procedimentos.length, data: procedimentos });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar procedimentos', details: error.message });
    }
  },

  findById: async (req, res) => {
    try {
      const { id } = req.params;
      const procedimento = await ProcedimentoDAO.findById(id);
      
      if (!procedimento) {
        return res.status(404).json({ error: 'Procedimento não encontrado' });
      }
      
      res.json(procedimento);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar procedimento', details: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, preco, duracao } = req.body;
      
      const procedimento = await ProcedimentoDAO.update(id, { nome, preco, duracao });
      
      if (!procedimento) {
        return res.status(404).json({ error: 'Procedimento não encontrado' });
      }
      
      res.json({ message: 'Procedimento atualizado com sucesso', data: procedimento });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar procedimento', details: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const procedimento = await ProcedimentoDAO.delete(id);
      
      if (!procedimento) {
        return res.status(404).json({ error: 'Procedimento não encontrado' });
      }
      
      res.json({ message: 'Procedimento deletado com sucesso', data: procedimento });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar procedimento', details: error.message });
    }
  }
};

module.exports = ProcedimentoController;