CREATE TABLE tokens_verificacao_email (
    id BIGSERIAL PRIMARY KEY,

    usuario_id BIGINT NOT NULL,

    token_hash VARCHAR(64) NOT NULL UNIQUE,

    data_expiracao TIMESTAMP NOT NULL,

    utilizado BOOLEAN NOT NULL DEFAULT FALSE,

    data_utilizacao TIMESTAMP NULL,

    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_token_verificacao_email_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_token_verificacao_email_usuario_id
    ON tokens_verificacao_email(usuario_id);

CREATE INDEX idx_token_verificacao_email_expiracao
    ON tokens_verificacao_email(data_expiracao);