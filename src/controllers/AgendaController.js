const AgendaDAO = require('../dao/AgendaDAO');

const AgendaController = {
  create: async (req, res) => {
    try {
      const { horario, data, status, cliente_nome, procedimento_nome, funcionario_nome } = req.body;
      
      const requiredFields = ['horario', 'data', 'status', 'cliente_nome', 'procedimento_nome', 'funcionario_nome'];
      for (const field of requiredFields) {
        if (!req.body[field]) {
          return res.status(400).json({ error: `Campo obrigatório: ${field}` });
        }
      }

      const agenda = await AgendaDAO.createAgendamento(horario, data, status, cliente_nome, procedimento_nome, funcionario_nome);
      res.status(201).json({ message: 'Agendamento criado com sucesso', data: agenda });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar agendamento', details: error.message });
    }
  },

  findAll: async (req, res) => {
    try {
      const agendamentos = await AgendaDAO.findAllWithDetails();
      res.json({ count: agendamentos.length, data: agendamentos });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar agendamentos', details: error.message });
    }
  },

  findById: async (req, res) => {
    try {
      const { id } = req.params;
      const agenda = await AgendaDAO.findById(id);
      
      if (!agenda) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }
      
      res.json(agenda);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar agendamento', details: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { horario, data, status, cliente_nome, procedimento_nome, funcionario_nome } = req.body;
      
      const agenda = await AgendaDAO.update(id, { horario, data, status, cliente_nome, procedimento_nome, funcionario_nome });
      
      if (!agenda) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }
      
      res.json({ message: 'Agendamento atualizado com sucesso', data: agenda });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar agendamento', details: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const agenda = await AgendaDAO.delete(id);
      
      if (!agenda) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }
      
      res.json({ message: 'Agendamento deletado com sucesso', data: agenda });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar agendamento', details: error.message });
    }
  },

  findByFuncionario: async (req, res) => {
    try {
      const { nome } = req.params;
      const agendamentos = await AgendaDAO.findByFuncionario(nome);
      res.json({ count: agendamentos.length, data: agendamentos });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar agendamentos por funcionário', details: error.message });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: 'Status é obrigatório' });
      }

      const agenda = await AgendaDAO.updateStatus(id, status);
      
      if (!agenda) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }
      
      res.json({ message: 'Status atualizado com sucesso', data: agenda });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar status', details: error.message });
    }
  },

  getAgendaCompleta: async (req, res) => {
    try {
      const agenda = await AgendaDAO.getAgendaCompleta();
      res.json({ count: agenda.length, data: agenda });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar agenda completa', details: error.message });
    }
  }
};

module.exports = AgendaController;