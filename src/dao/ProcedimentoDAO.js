const BaseDAO = require("./BaseDAO");

class ProcedimentoDAO extends BaseDAO {
  constructor() {
    super("procedimento", "id_procedimento");
  }
}

module.exports = new ProcedimentoDAO();
