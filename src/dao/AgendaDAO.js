const BaseDAO = require("./BaseDAO");

class AgendaDAO extends BaseDAO {
  constructor() {
    super("agenda", "id_agenda");
  }

  async createAgendamento(
    horario,
    data,
    status,
    cliente_nome,
    procedimento_nome,
    funcionario_nome,
  ) {
    const query = `
      INSERT INTO agenda (horario, data, status, id_cliente, id_procedimento, id_fun)
      SELECT 
        $1, $2, $3,
        (SELECT id_cliente FROM cliente WHERE nome = $4),
        (SELECT id_procedimento FROM procedimento WHERE nome = $5),
        (SELECT id_fun FROM funcionario WHERE nome = $6)
      RETURNING *`;

    const values = [
      horario,
      data,
      status,
      cliente_nome,
      procedimento_nome,
      funcionario_nome,
    ];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async findAllWithDetails() {
    const query = `
      SELECT 
        a.id_agenda,
        a.horario,
        a.data,
        a.status,
        c.nome as cliente_nome,
        p.nome as procedimento_nome,
        f.nome as funcionario_nome
      FROM agenda a
      JOIN cliente c ON a.id_cliente = c.id_cliente
      JOIN procedimento p ON a.id_procedimento = p.id_procedimento
      JOIN funcionario f ON a.id_fun = f.id_fun
      ORDER BY a.data DESC, a.horario`;

    const result = await this.pool.query(query);
    return result.rows;
  }

  async findById(id) {
    const query = `
      SELECT 
        a.id_agenda,
        a.horario,
        a.data,
        a.status,
        c.nome as cliente_nome,
        p.nome as procedimento_nome,
        f.nome as funcionario_nome
      FROM agenda a
      JOIN cliente c ON a.id_cliente = c.id_cliente
      JOIN procedimento p ON a.id_procedimento = p.id_procedimento
      JOIN funcionario f ON a.id_fun = f.id_fun
      WHERE a.id_agenda = $1`;

    const result = await this.pool.query(query, [id]);
    return result.rows[0];
  }

  async update(id, data) {
    const { horario, data: dataAgenda, status, cliente_nome, procedimento_nome, funcionario_nome } = data;
    
    let query = `UPDATE agenda SET `;
    const values = [];
    const setClauses = [];
    let paramIndex = 1;

    if (horario) {
      setClauses.push(`horario = $${paramIndex}`);
      values.push(horario);
      paramIndex++;
    }
    if (dataAgenda) {
      setClauses.push(`data = $${paramIndex}`);
      values.push(dataAgenda);
      paramIndex++;
    }
    if (status) {
      setClauses.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }
    if (cliente_nome) {
      setClauses.push(`id_cliente = (SELECT id_cliente FROM cliente WHERE nome = $${paramIndex})`);
      values.push(cliente_nome);
      paramIndex++;
    }
    if (procedimento_nome) {
      setClauses.push(`id_procedimento = (SELECT id_procedimento FROM procedimento WHERE nome = $${paramIndex})`);
      values.push(procedimento_nome);
      paramIndex++;
    }
    if (funcionario_nome) {
      setClauses.push(`id_fun = (SELECT id_fun FROM funcionario WHERE nome = $${paramIndex})`);
      values.push(funcionario_nome);
      paramIndex++;
    }

    query += setClauses.join(', ');
    query += ` WHERE id_agenda = $${paramIndex} RETURNING *`;
    values.push(id);

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async delete(id) {
    const result = await this.pool.query(
      "DELETE FROM agenda WHERE id_agenda = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }

  async findByFuncionario(funcionario_nome) {
    const query = `
      SELECT 
        a.id_agenda,
        a.horario,
        a.data,
        a.status,
        c.nome as cliente_nome,
        p.nome as procedimento_nome
      FROM agenda a
      JOIN cliente c ON a.id_cliente = c.id_cliente
      JOIN procedimento p ON a.id_procedimento = p.id_procedimento
      WHERE a.id_fun = (SELECT id_fun FROM funcionario WHERE nome = $1)
      ORDER BY a.data DESC, a.horario`;

    const result = await this.pool.query(query, [funcionario_nome]);
    return result.rows;
  }

  async updateStatus(id, status) {
    const result = await this.pool.query(
      "UPDATE agenda SET status = $1 WHERE id_agenda = $2 RETURNING *",
      [status, id],
    );
    return result.rows[0];
  }

  async getAgendaCompleta() {
    const query = `
      SELECT 
        a.id_agenda,
        a.data,
        a.horario,
        c.nome as cliente_nome,
        p.nome as procedimento_nome,
        f.nome as funcionario_nome,
        a.status
      FROM agenda a
      JOIN cliente c ON a.id_cliente = c.id_cliente
      JOIN procedimento p ON a.id_procedimento = p.id_procedimento
      JOIN funcionario f ON a.id_fun = f.id_fun
      ORDER BY a.data, a.horario`;

    const result = await this.pool.query(query);
    return result.rows;
  }
}

module.exports = new AgendaDAO();