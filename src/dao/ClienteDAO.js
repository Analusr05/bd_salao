const BaseDAO = require("./BaseDAO");

class ClienteDAO extends BaseDAO {
  constructor() {
    super("cliente", "id_cliente");
  }
}

module.exports = new ClienteDAO();
