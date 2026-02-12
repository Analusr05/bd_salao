const FuncionarioDAO = require("../dao/FuncionarioDAO");

const FuncionarioController = {
  create: async (req, res) => {
    try {
      const { nome, data_nascimento, endereco, tipo } = req.body;

      if (!nome || !data_nascimento || !endereco || !tipo) {
        return res
          .status(400)
          .json({ error: "Todos os campos são obrigatórios" });
      }

      const funcionario = await FuncionarioDAO.create({
        nome,
        data_nascimento,
        endereco,
        tipo,
      });
      res
        .status(201)
        .json({ message: "Funcionário criado com sucesso", data: funcionario });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erro ao criar funcionário", details: error.message });
    }
  },

  findAll: async (req, res) => {
    try {
      const funcionarios = await FuncionarioDAO.findAll();
      res.json({ count: funcionarios.length, data: funcionarios });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erro ao buscar funcionários", details: error.message });
    }
  },

  findById: async (req, res) => {
    try {
      const { id } = req.params;
      const funcionario = await FuncionarioDAO.findById(id);

      if (!funcionario) {
        return res.status(404).json({ error: "Funcionário não encontrado" });
      }

      res.json(funcionario);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erro ao buscar funcionário", details: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, data_nascimento, endereco, tipo } = req.body;

      const funcionario = await FuncionarioDAO.update(id, {
        nome,
        data_nascimento,
        endereco,
        tipo,
      });

      if (!funcionario) {
        return res.status(404).json({ error: "Funcionário não encontrado" });
      }

      res.json({
        message: "Funcionário atualizado com sucesso",
        data: funcionario,
      });
    } catch (error) {
      res
        .status(500)
        .json({
          error: "Erro ao atualizar funcionário",
          details: error.message,
        });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const funcionario = await FuncionarioDAO.delete(id);

      if (!funcionario) {
        return res.status(404).json({ error: "Funcionário não encontrado" });
      }

      res.json({
        message: "Funcionário deletado com sucesso",
        data: funcionario,
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erro ao deletar funcionário", details: error.message });
    }
  },

  findByTipo: async (req, res) => {
    try {
      const { tipo } = req.params;
      const funcionarios = await FuncionarioDAO.findByTipo(tipo);
      res.json({ count: funcionarios.length, data: funcionarios });
    } catch (error) {
      res
        .status(500)
        .json({
          error: "Erro ao buscar funcionários por tipo",
          details: error.message,
        });
    }
  },

  addCertificacao: async (req, res) => {
    try {
      const { funcionario_nome, certificacao, tipo_certificacao } = req.body;

      if (!funcionario_nome || !certificacao || !tipo_certificacao) {
        return res
          .status(400)
          .json({ error: "Todos os campos são obrigatórios" });
      }

      const result = await FuncionarioDAO.addCertificacao(
        funcionario_nome,
        certificacao,
        tipo_certificacao,
      );
      res
        .status(201)
        .json({ message: "Certificação adicionada com sucesso", data: result });
    } catch (error) {
      res
        .status(500)
        .json({
          error: "Erro ao adicionar certificação",
          details: error.message,
        });
    }
  },

  getCertificacoes: async (req, res) => {
    try {
      const { nome } = req.params;
      const certificacoes = await FuncionarioDAO.getCertificacoes(nome);
      res.json({ count: certificacoes.length, data: certificacoes });
    } catch (error) {
      res
        .status(500)
        .json({
          error: "Erro ao buscar certificações",
          details: error.message,
        });
    }
  },
};

module.exports = FuncionarioController;
