CREATE TABLE push_subscriptions (
    id BIGSERIAL PRIMARY KEY,

    usuario_id BIGINT NOT NULL,

    endpoint TEXT NOT NULL,

    p256dh TEXT NOT NULL,

    auth TEXT NOT NULL,

    data_criacao TIMESTAMP NOT NULL,
    data_atualizacao TIMESTAMP NOT NULL,

    CONSTRAINT fk_push_subscription_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT uk_push_subscription_endpoint
        UNIQUE (endpoint)
);

CREATE INDEX idx_push_subscriptions_usuario_id
    ON push_subscriptions(usuario_id);