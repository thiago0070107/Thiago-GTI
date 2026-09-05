# NovaGestão — Sistema de Gestão de Funcionários (CRUD)

Aplicação web completa de CRUD (Create, Read, Update, Delete) para cadastro de
colaboradores, seguindo o padrão **MVC** com camada **DAO** de acesso a dados,
persistindo em um banco **PostgreSQL hospedado no Supabase**.

## Arquitetura (MVC + DAO)

```
Front-end (View)  ──fetch/JSON──▶  Express Routes  ──▶  Controller  ──▶  DAO  ──▶  PostgreSQL (Supabase)
public/                            src/routes/          src/controllers/  src/dao/
```

| Camada      | Responsabilidade                                                                 | Arquivo(s)                                  |
|-------------|-----------------------------------------------------------------------------------|----------------------------------------------|
| View        | HTML/CSS/JS. Validação client-side e consumo da API via `fetch`.                 | `public/index.html`, `public/script.js`, `public/styles.css` |
| Routes      | Mapeia verbos HTTP para os métodos do Controller.                                | `src/routes/funcionarioRoutes.js`             |
| Controller  | Recebe a requisição, valida regras de negócio, monta a resposta HTTP.           | `src/controllers/FuncionarioController.js`    |
| DAO         | Único ponto que executa SQL (equivalente a uma classe DAO/JDBC).                 | `src/dao/FuncionarioDAO.js`                   |
| Config/DB   | Pool de conexões com o PostgreSQL (Supabase).                                    | `src/config/db.js`                            |
| Model (dados)| Estrutura da tabela `funcionarios` no banco relacional.                        | `sql/schema.sql`                              |

## Tecnologias

- **Node.js** + **Express** (servidor HTTP)
- **PostgreSQL** via **Supabase** (banco de dados relacional)
- **pg** (driver PostgreSQL, papel equivalente ao JDBC)
- **HTML5 / CSS3 / JavaScript** (front-end estático, sem framework)
- API pública **ViaCEP** para preenchimento automático de endereço

## Funcionalidades

- **Create**: cadastro de colaborador (dados pessoais, endereço e dados funcionais);
- **Read**: listagem de todos os colaboradores em tabela, atualizada dinamicamente;
- **Update**: edição de um colaborador existente (reaproveita o mesmo formulário);
- **Delete**: exclusão de colaborador com confirmação;
- Validação de regras de negócio tanto no front-end quanto no back-end (idade mínima,
  formato de e-mail, CEP, UF, datas não futuras, e-mail único etc.);
- Busca automática de endereço por CEP (ViaCEP).

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- Uma conta gratuita no [Supabase](https://supabase.com/)

## 1. Criando o banco de dados no Supabase

1. Crie um projeto em [supabase.com](https://supabase.com/).
2. No painel do projeto, vá em **SQL Editor**.
3. Abra o arquivo [`sql/schema.sql`](./sql/schema.sql) deste repositório, copie todo o
   conteúdo e cole no SQL Editor do Supabase.
4. Clique em **Run** para criar a tabela `funcionarios` (já com alguns registros de
   exemplo).
5. Vá em **Project Settings > Database > Connection string** e copie a *Connection
   string* no formato URI (use a conexão direta, porta `5432`, ou a *Connection
   Pooling*, porta `6543`, se for hospedar em ambiente serverless).

## 2. Configurando o projeto localmente

```bash
# Clone o repositório
git clone <URL_DO_REPOSITORIO>
cd novagestao-crud

# Instale as dependências
npm install

# Copie o arquivo de variáveis de ambiente
cp .env.example .env
```

Edite o arquivo `.env` e cole a string de conexão do Supabase:

```env
DATABASE_URL=postgresql://postgres:SUA_SENHA@db.SEU_PROJETO.supabase.co:5432/postgres
PORT=3000
```

> ⚠️ Nunca faça commit do arquivo `.env` — ele já está no `.gitignore`.

## 3. Executando a aplicação

```bash
npm start
```

O servidor sobe em `http://localhost:3000`. Abra esse endereço no navegador: o
front-end é servido automaticamente pelo próprio Express (arquivos em `public/`) e já
consome a API real.

Para desenvolvimento com reload automático (requer `nodemon`, incluso em
`devDependencies`):

```bash
npm run dev
```

## 4. Endpoints da API

Base: `/api/funcionarios`

| Método | Rota                    | Descrição                              |
|--------|-------------------------|-----------------------------------------|
| GET    | `/api/funcionarios`     | Lista todos os colaboradores            |
| GET    | `/api/funcionarios/:id` | Busca um colaborador pelo id            |
| POST   | `/api/funcionarios`     | Cria um novo colaborador                |
| PUT    | `/api/funcionarios/:id` | Atualiza um colaborador existente       |
| DELETE | `/api/funcionarios/:id` | Remove um colaborador                   |

Exemplo de corpo (POST/PUT), em JSON:

```json
{
  "nome": "Maria Silva",
  "email": "maria.silva@novagestao.com",
  "data_nascimento": "1995-04-12",
  "cep": "01001-000",
  "logradouro": "Praça da Sé",
  "bairro": "Sé",
  "numero": "100",
  "cidade": "São Paulo",
  "uf": "SP",
  "setor": "ti",
  "data_admissao": "2024-02-01",
  "status": "ativo"
}
```

## Estrutura de pastas

```
novagestao-crud/
├── README.md
├── package.json
├── .env.example
├── .gitignore
├── sql/
│   └── schema.sql              # script de criação do banco (DDL + dados de exemplo)
├── src/
│   ├── config/
│   │   └── db.js               # pool de conexão com o PostgreSQL (Supabase)
│   ├── dao/
│   │   └── FuncionarioDAO.js   # acesso a dados (CRUD via SQL)
│   ├── controllers/
│   │   └── FuncionarioController.js  # regras de negócio + HTTP
│   ├── routes/
│   │   └── funcionarioRoutes.js      # mapeamento de rotas REST
│   └── server.js               # ponto de entrada da aplicação
└── public/
    ├── index.html
    ├── script.js                # consumo da API via fetch (View)
    └── styles.css
```

## Deploy (opcional)

Este projeto é compatível com serviços como **Render**, **Railway** ou **Vercel
(Node runtime)**. Basta configurar a variável de ambiente `DATABASE_URL` (usando a
*Connection Pooling* do Supabase, porta `6543`, recomendada para ambientes
serverless) e rodar `npm start`.

---

Atividade acadêmica — não representa um sistema real de produção.
