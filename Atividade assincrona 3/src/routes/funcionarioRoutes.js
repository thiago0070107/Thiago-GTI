/**
 * routes/funcionarioRoutes.js
 * Mapeia os verbos HTTP (CRUD) para os métodos do Controller.
 */

const express = require("express");
const router = express.Router();
const FuncionarioController = require("../controllers/FuncionarioController");

router.get("/", (req, res) => FuncionarioController.listar(req, res));
router.get("/:id", (req, res) => FuncionarioController.buscar(req, res));
router.post("/", (req, res) => FuncionarioController.criar(req, res));
router.put("/:id", (req, res) => FuncionarioController.atualizar(req, res));
router.delete("/:id", (req, res) => FuncionarioController.deletar(req, res));

module.exports = router;
