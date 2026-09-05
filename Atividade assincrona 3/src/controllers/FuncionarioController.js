/**
 * controllers/FuncionarioController.js
 * Camada de controle (C do MVC): recebe a requisição HTTP, aplica as
 * regras de negócio/validação e delega a persistência ao DAO.
 */

const FuncionarioDAO = require("../dao/FuncionarioDAO");

const SETORES_VALIDOS = ["ti", "rh", "financeiro", "operacoes"];
const STATUS_VALIDOS = ["ativo", "inativo"];

function calcularIdade(dataInicio, dataFim) {
  let idade = dataFim.getFullYear() - dataInicio.getFullYear();
  const mes = dataFim.getMonth() - dataInicio.getMonth();
  if (mes < 0 || (mes === 0 && dataFim.getDate() < dataInicio.getDate())) {
    idade--;
  }
  return idade;
}

/**
 * Valida o corpo da requisição segundo as regras de negócio do sistema.
 * Retorna um array de mensagens de erro (vazio quando tudo está ok).
 */
function validarFuncionario(dados) {
  const erros = [];
  const hoje = new Date();

  if (!dados.nome || dados.nome.trim().length < 3 || !dados.nome.trim().includes(" ")) {
    erros.push("Informe nome e sobrenome (mínimo 3 caracteres).");
  }

  if (!dados.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
    erros.push("Informe um e-mail válido.");
  }

  const nascimento = dados.data_nascimento ? new Date(`${dados.data_nascimento}T00:00:00`) : null;
  if (!nascimento || Number.isNaN(nascimento.getTime())) {
    erros.push("Informe a data de nascimento.");
  } else {
    if (nascimento > hoje) erros.push("A data de nascimento não pode ser no futuro.");
    const idade = calcularIdade(nascimento, hoje);
    if (idade < 16) erros.push("O colaborador deve ter ao menos 16 anos.");
    if (idade > 100) erros.push("Verifique a data de nascimento informada.");
  }

  const cepDigitos = (dados.cep || "").replace(/\D/g, "");
  if (cepDigitos.length !== 8) erros.push("O CEP deve ter 8 dígitos.");

  if (!dados.logradouro || !dados.logradouro.trim()) erros.push("Informe o logradouro.");
  if (!dados.bairro || !dados.bairro.trim()) erros.push("Informe o bairro.");
  if (!dados.numero || !/^\d+[A-Za-z]?$/.test(dados.numero.trim())) erros.push("Informe um número válido.");
  if (!dados.cidade || !dados.cidade.trim()) erros.push("Informe a cidade.");
  if (!dados.uf || !/^[A-Za-z]{2}$/.test(dados.uf.trim())) erros.push("A UF deve ter 2 letras (ex: SP).");

  if (!SETORES_VALIDOS.includes(dados.setor)) erros.push("Selecione um setor válido.");

  const admissao = dados.data_admissao ? new Date(`${dados.data_admissao}T00:00:00`) : null;
  if (!admissao || Number.isNaN(admissao.getTime())) {
    erros.push("Informe a data de admissão.");
  } else {
    if (admissao > hoje) erros.push("A data de admissão não pode ser no futuro.");
    if (nascimento && !Number.isNaN(nascimento.getTime()) && calcularIdade(nascimento, admissao) < 16) {
      erros.push("A admissão não pode ocorrer antes dos 16 anos de idade.");
    }
  }

  if (dados.status && !STATUS_VALIDOS.includes(dados.status)) {
    erros.push("Status inválido.");
  }

  return erros;
}

/** Normaliza o payload recebido (trim, uppercase de UF, valores default). */
function normalizar(dados) {
  return {
    nome: (dados.nome || "").trim(),
    email: (dados.email || "").trim().toLowerCase(),
    data_nascimento: dados.data_nascimento,
    cep: (dados.cep || "").replace(/\D/g, "").replace(/(\d{5})(\d{3})/, "$1-$2"),
    logradouro: (dados.logradouro || "").trim(),
    bairro: (dados.bairro || "").trim(),
    numero: (dados.numero || "").trim(),
    cidade: (dados.cidade || "").trim(),
    uf: (dados.uf || "").trim().toUpperCase(),
    setor: dados.setor,
    data_admissao: dados.data_admissao,
    status: dados.status || "ativo",
  };
}

class FuncionarioController {
  /** GET /api/funcionarios */
  async listar(req, res) {
    try {
      const funcionarios = await FuncionarioDAO.listarTodos();
      return res.status(200).json(funcionarios);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao listar colaboradores." });
    }
  }

  /** GET /api/funcionarios/:id */
  async buscar(req, res) {
    try {
      const funcionario = await FuncionarioDAO.buscarPorId(req.params.id);
      if (!funcionario) {
        return res.status(404).json({ erro: "Colaborador não encontrado." });
      }
      return res.status(200).json(funcionario);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao buscar colaborador." });
    }
  }

  /** POST /api/funcionarios */
  async criar(req, res) {
    try {
      const dados = normalizar(req.body);
      const erros = validarFuncionario(dados);
      if (erros.length) {
        return res.status(400).json({ erros });
      }

      const existente = await FuncionarioDAO.buscarPorEmail(dados.email);
      if (existente) {
        return res.status(409).json({ erros: ["Já existe um colaborador com este e-mail."] });
      }

      const novo = await FuncionarioDAO.criar(dados);
      return res.status(201).json(novo);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao cadastrar colaborador." });
    }
  }

  /** PUT /api/funcionarios/:id */
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const atual = await FuncionarioDAO.buscarPorId(id);
      if (!atual) {
        return res.status(404).json({ erro: "Colaborador não encontrado." });
      }

      const dados = normalizar(req.body);
      const erros = validarFuncionario(dados);
      if (erros.length) {
        return res.status(400).json({ erros });
      }

      const emailEmUso = await FuncionarioDAO.buscarPorEmail(dados.email, id);
      if (emailEmUso) {
        return res.status(409).json({ erros: ["Já existe outro colaborador com este e-mail."] });
      }

      const atualizado = await FuncionarioDAO.atualizar(id, dados);
      return res.status(200).json(atualizado);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao atualizar colaborador." });
    }
  }

  /** DELETE /api/funcionarios/:id */
  async deletar(req, res) {
    try {
      const removido = await FuncionarioDAO.deletar(req.params.id);
      if (!removido) {
        return res.status(404).json({ erro: "Colaborador não encontrado." });
      }
      return res.status(204).send();
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: "Erro ao excluir colaborador." });
    }
  }
}

module.exports = new FuncionarioController();
