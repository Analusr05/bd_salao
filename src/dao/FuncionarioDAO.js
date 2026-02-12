const BaseDAO = require("./BaseDAO");

class FuncionarioDAO extends BaseDAO {
  constructor() {
    super("funcionario", "id_fun");
  }

  async findByTipo(tipo) {
    const query = "SELECT * FROM funcionario WHERE tipo = $1";
    const result = await this.pool.query(query, [tipo]);
    return result.rows;
  }

  async addCertificacao(funcionario_nome, certificacao, tipo_certificacao) {
    let tabela;
    if (tipo_certificacao === "maq") tabela = "certificacao_maq";
    else if (tipo_certificacao === "cab") tabela = "certificacao_cab";
    else if (tipo_certificacao === "man") tabela = "certificacao_man";
    else throw new Error("Tipo de certificação inválido");

    const query = `INSERT INTO ${tabela} (id_fun, certificacao) SELECT id_fun, $1 FROM funcionario WHERE nome = $2 RETURNING *`;
    const result = await this.pool.query(query, [
      certificacao,
      funcionario_nome,
    ]);
    return result.rows[0];
  }

  async getCertificacoes(funcionario_nome) {
    const query = `
      SELECT 'maq' as tipo, certificacao FROM certificacao_maq 
      WHERE id_fun = (SELECT id_fun FROM funcionario WHERE nome = $1)
      UNION ALL
      SELECT 'cab' as tipo, certificacao FROM certificacao_cab 
      WHERE id_fun = (SELECT id_fun FROM funcionario WHERE nome = $1)
      UNION ALL
      SELECT 'man' as tipo, certificacao FROM certificacao_man 
      WHERE id_fun = (SELECT id_fun FROM funcionario WHERE nome = $1)`;

    const result = await this.pool.query(query, [funcionario_nome]);
    return result.rows;
  }
}

module.exports = new FuncionarioDAO();
