-- =====================================================================
-- NovaGestão | Script de criação do Banco de Dados
-- Compatível com PostgreSQL (Supabase)
-- =====================================================================

-- Extensão usada para gerar timestamps automáticos (já vem habilitada
-- por padrão no Supabase, o CREATE EXTENSION abaixo é apenas garantia).
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela principal: colaboradores
CREATE TABLE IF NOT EXISTS funcionarios (
    id              SERIAL PRIMARY KEY,
    nome            VARCHAR(150) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    data_nascimento DATE NOT NULL,
    cep             VARCHAR(9)  NOT NULL,
    logradouro      VARCHAR(150) NOT NULL,
    bairro          VARCHAR(100) NOT NULL,
    numero          VARCHAR(10) NOT NULL,
    cidade          VARCHAR(100) NOT NULL,
    uf              CHAR(2) NOT NULL,
    setor           VARCHAR(20) NOT NULL
                        CHECK (setor IN ('ti', 'rh', 'financeiro', 'operacoes')),
    data_admissao   DATE NOT NULL,
    status          VARCHAR(10) NOT NULL DEFAULT 'ativo'
                        CHECK (status IN ('ativo', 'inativo')),
    criado_em       TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices auxiliares para consultas mais comuns
CREATE INDEX IF NOT EXISTS idx_funcionarios_setor  ON funcionarios (setor);
CREATE INDEX IF NOT EXISTS idx_funcionarios_status ON funcionarios (status);

-- Função + trigger para manter "atualizado_em" sempre em dia
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_funcionarios_atualizado_em ON funcionarios;
CREATE TRIGGER trg_funcionarios_atualizado_em
    BEFORE UPDATE ON funcionarios
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

-- Dados de exemplo (equivalentes aos que já existiam na tela estática)
INSERT INTO funcionarios
    (nome, email, data_nascimento, cep, logradouro, bairro, numero, cidade, uf, setor, data_admissao, status)
VALUES
    ('Marina Costa',    'marina.costa@novagestao.com',    '1994-05-10', '01001-000', 'Praça da Sé',        'Sé',          '100', 'São Paulo',   'SP', 'ti',          '2023-03-14', 'ativo'),
    ('Diego Fernandes', 'diego.fernandes@novagestao.com',  '1990-08-22', '20040-020', 'Av. Rio Branco',     'Centro',      '156', 'Rio de Janeiro', 'RJ', 'financeiro',  '2022-11-02', 'ativo'),
    ('Aline Souza',     'aline.souza@novagestao.com',      '1988-01-30', '30130-000', 'Av. Afonso Pena',    'Centro',      '77',  'Belo Horizonte', 'MG', 'rh',          '2021-07-19', 'inativo'),
    ('Bruno Lima',      'bruno.lima@novagestao.com',       '1997-12-05', '80010-000', 'Rua XV de Novembro', 'Centro',      '900', 'Curitiba',    'PR', 'operacoes',   '2024-01-08', 'ativo')
ON CONFLICT (email) DO NOTHING;
