const ClienteDAO = require('../dao/ClienteDAO');

const ClienteController = {
  create: async (req, res) => {
    try {
      const { nome, cpf, telefone, email } = req.body;
      
      if (!nome || !cpf || !telefone || !email) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      const cliente = await ClienteDAO.create({ nome, cpf, telefone, email });
      res.status(201).json({ message: 'Cliente criado com sucesso', data: cliente });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar cliente', details: error.message });
    }
  },

  findAll: async (req, res) => {
    try {
      const clientes = await ClienteDAO.findAll();
      res.json({ count: clientes.length, data: clientes });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar clientes', details: error.message });
    }
  },

  findById: async (req, res) => {
    try {
      const { id } = req.params;
      const cliente = await ClienteDAO.findById(id);
      
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }
      
      res.json(cliente);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar cliente', details: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, cpf, telefone, email } = req.body;
      
      const cliente = await ClienteDAO.update(id, { nome, cpf, telefone, email });
      
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }
      
      res.json({ message: 'Cliente atualizado com sucesso', data: cliente });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar cliente', details: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const cliente = await ClienteDAO.delete(id);
      
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }
      
      res.json({ message: 'Cliente deletado com sucesso', data: cliente });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar cliente', details: error.message });
    }
  }
};

module.exports = ClienteController;