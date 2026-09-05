/**
 * script.js
 * Camada de apresentação (View): validação client-side + consumo da API
 * REST (fetch) para as operações de CRUD (Create, Read, Update, Delete).
 */

document.addEventListener("DOMContentLoaded", () => {

  const API_URL = "/api/funcionarios";

  const form = document.querySelector("#form-cadastro");
  if (!form) return;

  const statusEnvio = document.querySelector("#status-envio");
  const campoIdOculto = document.querySelector("#funcionario-id");
  const tituloForm = document.querySelector("#form-titulo-texto");
  const botaoSalvar = document.querySelector("#btn-salvar");
  const botaoCancelarEdicao = document.querySelector("#btn-cancelar-edicao");
  const corpoTabela = document.querySelector("#tabela-equipe-corpo");
  const contadorEquipe = document.querySelector("#contador-equipe");

  const SETOR_LABEL = {
    ti: "Tecnologia da Informação",
    rh: "Recursos Humanos",
    financeiro: "Financeiro",
    operacoes: "Operações",
  };

  /* ------------------------------------------------------------------ */
  /* 1. Regras de validação (mesmas regras de negócio do back-end)       */
  /* ------------------------------------------------------------------ */

  const regras = {
    nome(valor) {
      if (!valor.trim()) return "Informe o nome completo.";
      if (valor.trim().length < 3) return "O nome deve ter ao menos 3 caracteres.";
      if (!/^[A-Za-zÀ-ÿ\s']+$/.test(valor)) return "Use apenas letras e espaços.";
      if (!valor.trim().includes(" ")) return "Informe nome e sobrenome.";
      return "";
    },
    email(valor) {
      if (!valor.trim()) return "Informe o e-mail corporativo.";
      const padrao = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!padrao.test(valor)) return "Informe um e-mail válido (ex: nome@empresa.com).";
      return "";
    },
    nascimento(valor) {
      if (!valor) return "Informe a data de nascimento.";
      const data = new Date(valor + "T00:00:00");
      const hoje = new Date();
      if (data > hoje) return "A data de nascimento não pode ser no futuro.";
      const idade = calcularIdade(data, hoje);
      if (idade < 16) return "O colaborador deve ter ao menos 16 anos.";
      if (idade > 100) return "Verifique a data informada.";
      return "";
    },
    cep(valor) {
      const digitos = valor.replace(/\D/g, "");
      if (!digitos) return "Informe o CEP.";
      if (digitos.length !== 8) return "O CEP deve ter 8 dígitos.";
      return "";
    },
    logradouro(valor) {
      return valor.trim() ? "" : "Informe o logradouro.";
    },
    bairro(valor) {
      return valor.trim() ? "" : "Informe o bairro.";
    },
    numero(valor) {
      if (!valor.trim()) return "Informe o número.";
      if (!/^\d+[A-Za-z]?$/.test(valor.trim())) return "Informe um número válido.";
      return "";
    },
    cidade(valor) {
      return valor.trim() ? "" : "Informe a cidade.";
    },
    uf(valor) {
      if (!valor.trim()) return "Informe a UF.";
      if (!/^[A-Za-z]{2}$/.test(valor.trim())) return "A UF deve ter 2 letras (ex: SP).";
      return "";
    },
    setor(valor) {
      return valor ? "" : "Selecione um setor.";
    },
    admissao(valor) {
      if (!valor) return "Informe a data de admissão.";
      const data = new Date(valor + "T00:00:00");
      const hoje = new Date();
      if (data > hoje) return "A data de admissão não pode ser no futuro.";

      const nascimentoInput = document.querySelector("#nascimento");
      if (nascimentoInput && nascimentoInput.value) {
        const nascimento = new Date(nascimentoInput.value + "T00:00:00");
        if (calcularIdade(nascimento, data) < 16) {
          return "A admissão não pode ocorrer antes dos 16 anos de idade.";
        }
      }
      return "";
    },
  };

  function calcularIdade(nascimento, referencia) {
    let idade = referencia.getFullYear() - nascimento.getFullYear();
    const mes = referencia.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && referencia.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  }

  function validarCampo(input) {
    const regra = regras[input.name];
    if (!regra) return true;

    const erroSpan = document.querySelector(`#${input.id}-erro`);
    const mensagem = regra(input.value);

    if (mensagem) {
      input.classList.add("input-invalid");
      input.setAttribute("aria-invalid", "true");
      if (erroSpan) erroSpan.textContent = mensagem;
      return false;
    }

    input.classList.remove("input-invalid");
    input.removeAttribute("aria-invalid");
    if (erroSpan) erroSpan.textContent = "";
    return true;
  }

  Object.keys(regras).forEach((nomeCampo) => {
    const input = document.querySelector(`[name="${nomeCampo}"]`);
    if (!input) return;

    input.addEventListener("blur", () => validarCampo(input));
    input.addEventListener("input", () => {
      if (input.classList.contains("input-invalid")) validarCampo(input);
    });
  });

  function validarFormulario() {
    let formularioValido = true;
    let primeiroCampoInvalido = null;

    Object.keys(regras).forEach((nomeCampo) => {
      const input = document.querySelector(`[name="${nomeCampo}"]`);
      if (!input) return;
      const valido = validarCampo(input);
      if (!valido) {
        formularioValido = false;
        if (!primeiroCampoInvalido) primeiroCampoInvalido = input;
      }
    });

    return { formularioValido, primeiroCampoInvalido };
  }

  function mostrarStatus(mensagem, tipo) {
    statusEnvio.textContent = mensagem;
    statusEnvio.classList.remove("status-msg--sucesso", "status-msg--erro");
    statusEnvio.classList.add(tipo === "sucesso" ? "status-msg--sucesso" : "status-msg--erro");
  }

  function coletarDadosFormulario() {
    return {
      nome: document.querySelector("#nome").value.trim(),
      email: document.querySelector("#email").value.trim(),
      data_nascimento: document.querySelector("#nascimento").value,
      cep: document.querySelector("#cep").value,
      logradouro: document.querySelector("#logradouro").value.trim(),
      bairro: document.querySelector("#bairro").value.trim(),
      numero: document.querySelector("#numero").value.trim(),
      cidade: document.querySelector("#cidade").value.trim(),
      uf: document.querySelector("#uf").value.trim(),
      setor: document.querySelector("#setor").value,
      data_admissao: document.querySelector("#admissao").value,
      status: document.querySelector('input[name="status"]:checked').value,
    };
  }

  /* ------------------------------------------------------------------ */
  /* 2. Modo de edição (reaproveita o mesmo formulário)                   */
  /* ------------------------------------------------------------------ */

  function entrarModoEdicao(funcionario) {
    campoIdOculto.value = funcionario.id;
    document.querySelector("#nome").value = funcionario.nome;
    document.querySelector("#email").value = funcionario.email;
    document.querySelector("#nascimento").value = funcionario.data_nascimento?.slice(0, 10) || "";
    document.querySelector("#cep").value = funcionario.cep;
    document.querySelector("#logradouro").value = funcionario.logradouro;
    document.querySelector("#bairro").value = funcionario.bairro;
    document.querySelector("#numero").value = funcionario.numero;
    document.querySelector("#cidade").value = funcionario.cidade;
    document.querySelector("#uf").value = funcionario.uf;
    document.querySelector("#setor").value = funcionario.setor;
    document.querySelector("#admissao").value = funcionario.data_admissao?.slice(0, 10) || "";
    document.querySelector(`#status-${funcionario.status}`).checked = true;

    tituloForm.textContent = `Editando colaborador #${String(funcionario.id).padStart(4, "0")}`;
    botaoSalvar.textContent = "Salvar alterações";
    botaoCancelarEdicao.hidden = false;

    document.querySelector("#cadastro").scrollIntoView({ behavior: "smooth", block: "start" });
    document.querySelector("#nome").focus();
  }

  function sairModoEdicao() {
    campoIdOculto.value = "";
    form.reset();
    document.querySelectorAll(".input-invalid").forEach((el) => el.classList.remove("input-invalid"));
    document.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));
    tituloForm.textContent = "Cadastrar colaborador";
    botaoSalvar.textContent = "Cadastrar colaborador";
    botaoCancelarEdicao.hidden = true;
  }

  botaoCancelarEdicao.addEventListener("click", () => {
    sairModoEdicao();
    statusEnvio.textContent = "";
    statusEnvio.classList.remove("status-msg--sucesso", "status-msg--erro");
  });

  document.querySelector("#btn-limpar").addEventListener("click", () => {
    sairModoEdicao();
    statusEnvio.textContent = "";
    statusEnvio.classList.remove("status-msg--sucesso", "status-msg--erro");
  });

  /* ------------------------------------------------------------------ */
  /* 3. Envio do formulário -> POST (criar) ou PUT (atualizar)           */
  /* ------------------------------------------------------------------ */

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const { formularioValido, primeiroCampoInvalido } = validarFormulario();
    if (!formularioValido) {
      mostrarStatus("Corrija os campos destacados antes de enviar.", "erro");
      if (primeiroCampoInvalido) primeiroCampoInvalido.focus();
      return;
    }

    const dados = coletarDadosFormulario();
    const idEmEdicao = campoIdOculto.value;
    const emEdicao = Boolean(idEmEdicao);

    botaoSalvar.disabled = true;

    try {
      const resposta = await fetch(emEdicao ? `${API_URL}/${idEmEdicao}` : API_URL, {
        method: emEdicao ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });

      const corpo = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        const mensagens = corpo.erros?.join(" ") || corpo.erro || "Não foi possível salvar o colaborador.";
        mostrarStatus(mensagens, "erro");
        return;
      }

      mostrarStatus(
        emEdicao ? "Colaborador atualizado com sucesso!" : "Colaborador cadastrado com sucesso!",
        "sucesso"
      );
      sairModoEdicao();
      await carregarEquipe();
    } catch (erro) {
      console.error(erro);
      mostrarStatus("Erro de comunicação com o servidor. Tente novamente.", "erro");
    } finally {
      botaoSalvar.disabled = false;
    }
  });

  /* ------------------------------------------------------------------ */
  /* 4. Listagem (GET), edição (preenche form) e exclusão (DELETE)       */
  /* ------------------------------------------------------------------ */

  function formatarDataBR(isoDate) {
    if (!isoDate) return "-";
    const [ano, mes, dia] = isoDate.slice(0, 10).split("-");
    return `${dia}/${mes}/${ano}`;
  }

  function criarLinhaTabela(funcionario) {
    const tr = document.createElement("tr");
    tr.dataset.id = funcionario.id;

    tr.innerHTML = `
      <th scope="row"><span class="mono">#${String(funcionario.id).padStart(4, "0")}</span></th>
      <td>${escaparHtml(funcionario.nome)}</td>
      <td>${escaparHtml(SETOR_LABEL[funcionario.setor] || funcionario.setor)}</td>
      <td><time datetime="${funcionario.data_admissao?.slice(0, 10)}">${formatarDataBR(funcionario.data_admissao)}</time></td>
      <td><span class="badge badge--${funcionario.status}">${funcionario.status === "ativo" ? "Ativo" : "Inativo"}</span></td>
      <td class="acoes-col">
        <button type="button" class="btn btn--ghost btn--small btn-editar">Editar</button>
        <button type="button" class="btn btn--ghost btn--small btn-excluir">Excluir</button>
      </td>
    `;

    tr.querySelector(".btn-editar").addEventListener("click", () => entrarModoEdicao(funcionario));
    tr.querySelector(".btn-excluir").addEventListener("click", () => excluirFuncionario(funcionario));

    return tr;
  }

  function escaparHtml(texto) {
    const div = document.createElement("div");
    div.textContent = texto ?? "";
    return div.innerHTML;
  }

  async function carregarEquipe() {
    contadorEquipe.textContent = "Carregando colaboradores…";
    try {
      const resposta = await fetch(API_URL);
      if (!resposta.ok) throw new Error("Falha ao carregar a lista de colaboradores.");
      const funcionarios = await resposta.json();

      corpoTabela.innerHTML = "";
      funcionarios.forEach((f) => corpoTabela.appendChild(criarLinhaTabela(f)));

      contadorEquipe.textContent =
        funcionarios.length === 1
          ? "1 colaborador encontrado"
          : `${funcionarios.length} colaboradores encontrados`;
    } catch (erro) {
      console.error(erro);
      contadorEquipe.textContent = "Não foi possível carregar a equipe. Tente recarregar a página.";
    }
  }

  async function excluirFuncionario(funcionario) {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir "${funcionario.nome}"? Esta ação não pode ser desfeita.`
    );
    if (!confirmar) return;

    try {
      const resposta = await fetch(`${API_URL}/${funcionario.id}`, { method: "DELETE" });
      if (!resposta.ok && resposta.status !== 204) {
        throw new Error("Falha ao excluir colaborador.");
      }
      if (campoIdOculto.value === String(funcionario.id)) sairModoEdicao();
      await carregarEquipe();
    } catch (erro) {
      console.error(erro);
      alert("Não foi possível excluir o colaborador agora. Tente novamente.");
    }
  }

  /* ------------------------------------------------------------------ */
  /* 5. Busca assíncrona de endereço por CEP (fetch / Ajax - ViaCEP)     */
  /* ------------------------------------------------------------------ */

  const campoCep = document.querySelector("#cep");
  const botaoBuscarCep = document.querySelector("#btn-buscar-cep");
  const statusCep = document.querySelector("#cep-status");

  const camposEndereco = {
    logradouro: document.querySelector("#logradouro"),
    bairro: document.querySelector("#bairro"),
    cidade: document.querySelector("#cidade"),
    uf: document.querySelector("#uf"),
  };

  campoCep.addEventListener("input", () => {
    const digitos = campoCep.value.replace(/\D/g, "").slice(0, 8);
    campoCep.value = digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos;

    if (digitos.length === 8) buscarEndereco(digitos);
  });

  botaoBuscarCep.addEventListener("click", () => {
    const digitos = campoCep.value.replace(/\D/g, "");
    if (digitos.length !== 8) {
      validarCampo(campoCep);
      return;
    }
    buscarEndereco(digitos);
  });

  async function buscarEndereco(cep) {
    statusCep.textContent = "Buscando endereço...";
    statusCep.classList.remove("field-status--erro");
    botaoBuscarCep.disabled = true;

    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!resposta.ok) throw new Error("Falha na comunicação com o serviço de CEP.");

      const dados = await resposta.json();

      if (dados.erro) {
        statusCep.textContent = "CEP não encontrado. Preencha o endereço manualmente.";
        statusCep.classList.add("field-status--erro");
        return;
      }

      camposEndereco.logradouro.value = dados.logradouro || "";
      camposEndereco.bairro.value = dados.bairro || "";
      camposEndereco.cidade.value = dados.localidade || "";
      camposEndereco.uf.value = dados.uf || "";

      Object.values(camposEndereco).forEach((input) => validarCampo(input));
      statusCep.textContent = "Endereço preenchido automaticamente.";
      document.querySelector("#numero").focus();
    } catch (erro) {
      statusCep.textContent = "Não foi possível buscar o CEP agora. Tente novamente ou preencha manualmente.";
      statusCep.classList.add("field-status--erro");
      console.error(erro);
    } finally {
      botaoBuscarCep.disabled = false;
    }
  }

  /* ------------------------------------------------------------------ */
  /* 6. Carga inicial                                                    */
  /* ------------------------------------------------------------------ */

  carregarEquipe();

});
