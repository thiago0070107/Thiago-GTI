/**
 * server.js
 * Ponto de entrada: configura o Express, middlewares, arquivos estáticos
 * (front-end) e as rotas da API.
 */

require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const funcionarioRoutes = require("./routes/funcionarioRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Front-end estático (index.html, script.js, styles.css)
app.use(express.static(path.join(__dirname, "..", "public")));

// API REST
app.use("/api/funcionarios", funcionarioRoutes);

// Healthcheck simples
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`NovaGestão rodando em http://localhost:${PORT}`);
});
