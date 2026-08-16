ALTER TABLE preferencias_notificacao
    ADD COLUMN rota_id BIGINT;

UPDATE preferencias_notificacao
SET rota_id = 1
WHERE rota_id IS NULL;

ALTER TABLE preferencias_notificacao
    ALTER COLUMN rota_id SET NOT NULL;

ALTER TABLE preferencias_notificacao
    ADD CONSTRAINT fk_preferencias_notificacao_rota
        FOREIGN KEY (rota_id)
        REFERENCES rotas(id);