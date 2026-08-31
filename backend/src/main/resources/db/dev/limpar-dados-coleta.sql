-- ============================================================
-- SIMUL
-- Limpeza dos dados de coleta para ambiente de desenvolvimento
-- ============================================================
--
-- ATENÇÃO:
-- Este script remove as rotas e os registros que dependem delas.
--
-- Pode remover, por CASCADE:
-- - áreas atendidas
-- - cronogramas
-- - preferências de notificação vinculadas às rotas
-- - outros registros dependentes por chave estrangeira
--
-- Os usuários cadastrados NÃO são removidos.
--
-- Utilizar somente no ambiente de desenvolvimento.
-- ============================================================

BEGIN;

TRUNCATE TABLE rotas
RESTART IDENTITY
CASCADE;

COMMIT;