ALTER TABLE historico_notificacoes
    ADD COLUMN numero_tentativas INTEGER NOT NULL DEFAULT 0;

ALTER TABLE historico_notificacoes
    ADD COLUMN proxima_tentativa TIMESTAMP;

UPDATE historico_notificacoes
SET numero_tentativas =
    CASE
        WHEN status IN ('ENVIADO', 'FALHA') THEN 1
        ELSE 0
    END;

ALTER TABLE historico_notificacoes
    ALTER COLUMN numero_tentativas DROP DEFAULT;

ALTER TABLE historico_notificacoes
    ADD CONSTRAINT ck_historico_notificacoes_numero_tentativas
        CHECK (
            numero_tentativas >= 0
            AND numero_tentativas <= 3
        );

CREATE INDEX idx_historico_notificacoes_retry
    ON historico_notificacoes (
        status,
        proxima_tentativa
    );