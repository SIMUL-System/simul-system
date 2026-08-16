ALTER TABLE preferencias_notificacao
    ADD COLUMN web_push_ativo BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE preferencias_notificacao
    ALTER COLUMN web_push_ativo DROP DEFAULT;