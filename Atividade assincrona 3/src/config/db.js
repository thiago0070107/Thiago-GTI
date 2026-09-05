/**
 * config/db.js
 * Camada de conexão com o banco de dados (Supabase PostgreSQL).
 * Centraliza o Pool de conexões usado por toda a aplicação (padrão DAO/JDBC-like).
 */

require("dotenv").config();
const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  console.error(
    "[ERRO] Variável DATABASE_URL não definida. Configure o arquivo .env (veja .env.example)."
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase exige SSL; rejectUnauthorized:false evita erro de certificado
  // autoassinado em ambiente de desenvolvimento.
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on("error", (erro) => {
  console.error("Erro inesperado no pool de conexões do PostgreSQL:", erro);
});

// Testa a conexão assim que o módulo é carregado (feedback rápido em dev).
pool
  .query("SELECT NOW()")
  .then(() => console.log("[DB] Conectado ao PostgreSQL (Supabase) com sucesso."))
  .catch((erro) => console.error("[DB] Falha ao conectar ao banco:", erro.message));

module.exports = pool;
