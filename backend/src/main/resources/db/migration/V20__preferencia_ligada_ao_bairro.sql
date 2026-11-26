-- ============================================================
-- SIMUL - V20
-- A preferência de lembrete passa a guardar o BAIRRO escolhido
-- (area_atendida_id) em vez da rota. A rota passa a vir do
-- bairro: se o administrador mover o bairro para outra rota,
-- o lembrete do morador acompanha automaticamente.
--
-- Migração dos registros existentes: cada preferência recebe um
-- bairro da rota que ela guardava (o de menor id). Preferência
-- cuja rota não tem nenhum bairro não tem como ser convertida e
-- é removida; o morador escolhe o bairro de novo em Meus lembretes.
-- ============================================================

ALTER TABLE preferencias_notificacao
    ADD COLUMN area_atendida_id BIGINT;

UPDATE preferencias_notificacao p
SET area_atendida_id = (
    SELECT MIN(a.id)
    FROM areas_atendidas a
    WHERE a.rota_id = p.rota_id
);

DELETE FROM preferencias_notificacao
WHERE area_atendida_id IS NULL;

ALTER TABLE preferencias_notificacao
    ALTER COLUMN area_atendida_id SET NOT NULL;

ALTER TABLE preferencias_notificacao
    ADD CONSTRAINT fk_preferencias_notificacao_area_atendida
        FOREIGN KEY (area_atendida_id)
        REFERENCES areas_atendidas(id);

CREATE INDEX idx_preferencias_notificacao_area_atendida_id
    ON preferencias_notificacao (area_atendida_id);

-- A rota agora é obtida pelo bairro. Remover a coluna também remove
-- a chave estrangeira e o índice que dependiam dela.
ALTER TABLE preferencias_notificacao
    DROP COLUMN rota_id;
