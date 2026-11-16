-- Cria a conta administrativa de teste do SIMUL.
-- A senha está armazenada em BCrypt, compatível com BCryptPasswordEncoder.
-- Esta migration é executada uma única vez pelo Flyway em cada banco.
-- Não coloque a senha em texto puro neste arquivo.

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
    'Administrador de Teste',
    'daviconcyline@gmail.com',
    '$2a$10$aR9QsrFgZkKP11p.1KDnY.AbUeyL3xeLAqy77KiUoANsKvyI8bkOa',
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
