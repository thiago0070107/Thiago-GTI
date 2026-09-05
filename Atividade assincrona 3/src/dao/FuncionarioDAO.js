/**
 * dao/FuncionarioDAO.js
 * Data Access Object - única camada que conhece SQL.
 * Equivalente ao papel de uma classe DAO/JDBC no mundo Java: isola o
 * Controller de detalhes de persistência.
 */

const pool = require("../config/db");

const COLUNAS = [
  "nome",
  "email",
  "data_nascimento",
  "cep",
  "logradouro",
  "bairro",
  "numero",
  "cidade",
  "uf",
  "setor",
  "data_admissao",
  "status",
];

class FuncionarioDAO {
  /** Cria um novo colaborador e retorna o registro criado. */
  async criar(dados) {
    const valores = COLUNAS.map((coluna) => dados[coluna]);
    const placeholders = COLUNAS.map((_, i) => `$${i + 1}`).join(", ");

    const query = `
      INSERT INTO funcionarios (${COLUNAS.join(", ")})
      VALUES (${placeholders})
      RETURNING *;
    `;

    const { rows } = await pool.query(query, valores);
    return rows[0];
  }

  /** Retorna todos os colaboradores, mais recentes primeiro. */
  async listarTodos() {
    const { rows } = await pool.query(
      "SELECT * FROM funcionarios ORDER BY id DESC;"
    );
    return rows;
  }

  /** Busca um colaborador pelo id. */
  async buscarPorId(id) {
    const { rows } = await pool.query(
      "SELECT * FROM funcionarios WHERE id = $1;",
      [id]
    );
    return rows[0] || null;
  }

  /** Busca um colaborador pelo e-mail (usado para checar duplicidade). */
  async buscarPorEmail(email, idParaIgnorar = null) {
    const query = idParaIgnorar
      ? "SELECT * FROM funcionarios WHERE email = $1 AND id <> $2;"
      : "SELECT * FROM funcionarios WHERE email = $1;";
    const valores = idParaIgnorar ? [email, idParaIgnorar] : [email];
    const { rows } = await pool.query(query, valores);
    return rows[0] || null;
  }

  /** Atualiza um colaborador existente e retorna o registro atualizado. */
  async atualizar(id, dados) {
    const valores = COLUNAS.map((coluna) => dados[coluna]);
    const sets = COLUNAS.map((coluna, i) => `${coluna} = $${i + 1}`).join(", ");

    const query = `
      UPDATE funcionarios
      SET ${sets}
      WHERE id = $${COLUNAS.length + 1}
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [...valores, id]);
    return rows[0] || null;
  }

  /** Remove um colaborador. Retorna true se algo foi de fato removido. */
  async deletar(id) {
    const { rowCount } = await pool.query(
      "DELETE FROM funcionarios WHERE id = $1;",
      [id]
    );
    return rowCount > 0;
  }
}

module.exports = new FuncionarioDAO();
