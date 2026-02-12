const pool = require("../config/database");

class BaseDAO {
  constructor(tableName, idColumn = "id") {
    this.tableName = tableName;
    this.idColumn = idColumn;
    this.pool = pool;
  }

  async findAll() {
    const query = `SELECT * FROM ${this.tableName} ORDER BY ${this.idColumn}`;
    const result = await this.pool.query(query);
    return result.rows;
  }

  async findById(id) {
    const query = `SELECT * FROM ${this.tableName} WHERE ${this.idColumn} = $1`;
    const result = await this.pool.query(query, [id]);
    return result.rows[0];
  }

  async create(data) {
    const columns = Object.keys(data).join(", ");
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");

    const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async update(id, data) {
    const setClause = Object.keys(data)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ");
    const values = Object.values(data);
    values.unshift(id);

    const query = `UPDATE ${this.tableName} SET ${setClause} WHERE ${this.idColumn} = $1 RETURNING *`;
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async delete(id) {
    const query = `DELETE FROM ${this.tableName} WHERE ${this.idColumn} = $1 RETURNING *`;
    const result = await this.pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = BaseDAO;
