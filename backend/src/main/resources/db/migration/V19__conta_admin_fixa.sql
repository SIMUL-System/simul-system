-- ============================================================
-- SIMUL - V19
-- Conta administrativa fixa do sistema, usada no painel e na
-- apresentação acadêmica.
--
-- E-mail: simul.sistema@gmail.com
-- A senha fica só em BCrypt (custo 10, compatível com o
-- BCryptPasswordEncoder). Ela é combinada com a equipe e não
-- deve ser escrita em texto puro neste repositório.
--
-- Recomendação: depois da apresentação, troque a senha pelo
-- fluxo "Esqueci minha senha" (o hash abaixo deixa de valer).
-- ============================================================

INSERT INTO usuarios (
    nome,
    email,
    senha,
    perfil,
    ativo,
    email_verificado,
    data_criacao,
    data_atualizacao
)
VALUES (
    'Administração SIMUL',
    'simul.sistema@gmail.com',
    '$2a$10$NRURh93ChoBMy5.QjAMpfecAbErjdD0V7849TKw8DLBIhL1U5YV/K',
    'ADMIN',
    TRUE,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE SET
    nome = EXCLUDED.nome,
    senha = EXCLUDED.senha,
    perfil = 'ADMIN',
    ativo = TRUE,
    email_verificado = TRUE,
    data_atualizacao = CURRENT_TIMESTAMP;
