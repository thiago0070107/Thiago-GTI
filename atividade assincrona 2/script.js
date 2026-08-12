/**
 * script.js
 * Validação client-side (manipulação de DOM e eventos) + busca assíncrona
 * de endereço via CEP (fetch / Ajax), sem recarregar a página.
 *
 * Referências da atividade:
 * - Manipulação do DOM e eventos: querySelector, addEventListener, classList
 * - Requisições assíncronas (Ajax): fetch(), Promises, async/await, JSON
 */

document.addEventListener("DOMContentLoaded", () => {

  const form = document.querySelector("#form-cadastro");
  if (!form) return; // evita erro caso o script rode em outra página

  const statusEnvio = document.querySelector("#status-envio");

  /* ------------------------------------------------------------------ */
  /* 1. Configuração dos campos e regras de validação                    */
  /* ------------------------------------------------------------------ */

  // Cada regra recebe o valor do campo e devolve uma mensagem de erro
  // (string) ou uma string vazia quando o valor é válido.
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

  /* ------------------------------------------------------------------ */
  /* 2. Validação de um campo individual (DOM + eventos)                  */
  /* ------------------------------------------------------------------ */

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

  // Valida em tempo real: ao sair do campo (blur) e, se já tiver erro,
  // reavalia a cada digitação (input) para dar feedback imediato.
  Object.keys(regras).forEach((nomeCampo) => {
    const input = document.querySelector(`[name="${nomeCampo}"]`);
    if (!input) return;

    input.addEventListener("blur", () => validarCampo(input));

    input.addEventListener("input", () => {
      if (input.classList.contains("input-invalid")) {
        validarCampo(input);
      }
    });
  });

  /* ------------------------------------------------------------------ */
  /* 3. Envio do formulário                                              */
  /* ------------------------------------------------------------------ */

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();

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

    if (!formularioValido) {
      statusEnvio.textContent = "Corrija os campos destacados antes de enviar.";
      statusEnvio.classList.remove("status-msg--sucesso");
      statusEnvio.classList.add("status-msg--erro");
      if (primeiroCampoInvalido) primeiroCampoInvalido.focus();
      return;
    }

    // Sem back-end nesta atividade: apenas simula o envio com sucesso.
    statusEnvio.textContent = "Colaborador cadastrado com sucesso!";
    statusEnvio.classList.remove("status-msg--erro");
    statusEnvio.classList.add("status-msg--sucesso");
    form.reset();
    document.querySelectorAll(".input-invalid").forEach((el) => el.classList.remove("input-invalid"));
  });

  document.querySelector("#btn-limpar").addEventListener("click", () => {
    statusEnvio.textContent = "";
    statusEnvio.classList.remove("status-msg--sucesso", "status-msg--erro");
    document.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));
    document.querySelectorAll(".input-invalid").forEach((el) => el.classList.remove("input-invalid"));
  });

  /* ------------------------------------------------------------------ */
  /* 4. Busca assíncrona de endereço por CEP (fetch / Ajax)              */
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

  // Máscara simples: 00000-000, mantendo apenas dígitos internamente.
  campoCep.addEventListener("input", () => {
    const digitos = campoCep.value.replace(/\D/g, "").slice(0, 8);
    campoCep.value = digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos;

    // Busca automática assim que os 8 dígitos forem preenchidos.
    if (digitos.length === 8) {
      buscarEndereco(digitos);
    }
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
      // Requisição assíncrona (Ajax) via fetch para a API pública ViaCEP.
      const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

      if (!resposta.ok) {
        throw new Error("Falha na comunicação com o serviço de CEP.");
      }

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

      // Revalida os campos preenchidos automaticamente.
      Object.values(camposEndereco).forEach((input) => validarCampo(input));

      statusCep.textContent = "Endereço preenchido automaticamente.";

      // Move o foco para o campo Número, próximo passo do preenchimento.
      document.querySelector("#numero").focus();

    } catch (erro) {
      statusCep.textContent = "Não foi possível buscar o CEP agora. Tente novamente ou preencha manualmente.";
      statusCep.classList.add("field-status--erro");
      console.error(erro);
    } finally {
      botaoBuscarCep.disabled = false;
    }
  }

});
