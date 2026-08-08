# Relatório Técnico

Interface Gráfica Semântica, Responsiva e Acessível — Sistema de Gestão de Funcionários

## 1. Objetivo e escopo

Este relatório documenta as decisões de projeto tomadas no desenvolvimento de uma interface front-end (HTML5 + CSS3) para um módulo de gestão de funcionários, com telas de cadastro e de visualização de dados. O trabalho segue a orientação da disciplina de consultar os capítulos introdutórios de HTML e CSS Head First (FREEMAN & FREEMAN), com foco em estrutura semântica, boas práticas de CSS e padrões de navegador para responsividade.

## 2. Escolhas de tags semânticas

A página evita o uso indiscriminado de `<div>` como recipiente genérico, optando por elementos do HTML5 que descrevem o papel de cada bloco de conteúdo. Essa escolha segue diretamente o princípio, reforçado no livro de FREEMAN & FREEMAN, de que a marcação deve refletir o significado do conteúdo e não apenas sua aparência — a apresentação visual fica inteiramente a cargo do CSS externo. A tabela abaixo resume as principais tags estruturais e a justificativa de cada uma.

| **Tag(s)**                          | **Justificativa de uso**                                                                                                                                                         |
|-------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `<header>`                          | Agrupa a identidade da marca e a navegação principal no topo da página, papel introdutório equivalente ao cabeçalho de um documento impresso.                                    |
| `<nav>`                             | Isola a lista de links de navegação, permitindo que leitores de tela e navegadores identifiquem esse bloco como um conjunto de atalhos, e não como conteúdo comum.               |
| `<main>`                            | Marca o conteúdo único e central da página (há apenas um por documento), servindo de destino do link de pular navegação e de referência para tecnologias assistivas.             |
| `<section>`                         | Delimita blocos temáticos com identidade própria — o formulário de cadastro e a tabela da equipe — cada um com seu próprio heading, o que reforça a hierarquia do documento.     |
| `<form>` / `<fieldset>` / `<legend>`| Agrupam campos relacionados (dados pessoais, dados funcionais) sob um rótulo textual lido por leitores de tela antes de cada campo, evitando formulários "soltos".               |
| `<table>`, `<caption>`, `<th scope>`| Estruturam dados tabulares reais (a listagem de colaboradores) com relação explícita entre cabeçalho e célula, essencial para navegação por tabela em leitores de tela.          |
| `<time datetime="">`                | Marca datas em formato máquina-legível, independente da representação visual (dd/mm/aaaa), útil para indexação e agentes automatizados.                                          |
| `<aside>`                           | Isola um conteúdo relacionado, mas não essencial ao fluxo principal — a nota sobre relatórios — sem quebrar a leitura linear da página.                                          |
| `<footer>`                          | Fecha o documento com informações de rodapé (direitos autorais), papel equivalente ao rodapé de um documento impresso.                                                           |

## 3. Responsividade e padrões de navegador

A folha de estilo utiliza uma abordagem mobile-first combinada com CSS Grid para o layout principal (formulário e tabela lado a lado) e media queries em dois pontos de quebra (860px e 560px), fazendo as colunas empilharem verticalmente em telas estreitas. Unidades relativas (`rem`, `%`, `clamp()`) substituem valores fixos em pixels sempre que possível, e a tabela recebe rolagem horizontal própria (`overflow-x`) em vez de forçar zoom da página inteira em telas pequenas — uma prática recomendada para dados tabulares em contextos responsivos.

Também são seguidos padrões amplamente aceitos pelos navegadores modernos: `meta viewport` para escala correta em dispositivos móveis, uso de fontes de sistema como fallback, e propriedade `prefers-reduced-motion` respeitada para usuários sensíveis a movimento.

## 4. Acessibilidade

- Todo campo de formulário possui `<label>` associado via atributo `for`, permitindo leitura correta por leitores de tela.
- Um link "Pular para o conteúdo principal" (skip link) é o primeiro elemento focável da página, evitando que usuários de teclado precisem passar por toda a navegação repetidamente.
- O estado de foco do teclado é sempre visível (`:focus-visible`), sem remoção do contorno padrão.
- A tabela usa `<th scope="col">` e `<th scope="row">` para relacionar cabeçalhos e dados, além de uma `<caption>` oculta visualmente, mas lida por leitores de tela.
- O contraste de cores entre texto e fundo foi calibrado para atender ao mínimo recomendado pelas diretrizes WCAG AA.

## 5. Conclusão

A combinação de tags semânticas do HTML5 com um CSS3 organizado em variáveis (custom properties), grid responsivo e atenção à acessibilidade resultou em uma interface que comunica sua estrutura tanto para usuários visuais quanto para tecnologias assistivas, alinhada às boas práticas discutidas nos capítulos introdutórios de FREEMAN & FREEMAN sobre HTML e CSS.
