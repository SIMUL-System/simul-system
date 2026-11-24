-- ============================================================
-- SIMUL - V17
-- Integridade e desempenho: leva para o banco as regras de
-- unicidade que hoje só a aplicação garante e cria os índices
-- das consultas mais frequentes (consulta pública, login e
-- ciclo de notificações, que roda a cada minuto).
--
-- Não altera nem apaga dados. Se algum CREATE UNIQUE INDEX
-- falhar, existem registros duplicados no banco: rode a
-- consulta de diagnóstico do README (seção 12) e corrija
-- antes de aplicar.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Unicidade sem diferenciar maiúsculas/minúsculas
--    (o código busca com findBy...IgnoreCase = UPPER(...))
-- ------------------------------------------------------------

-- E-mail único independentemente de maiúsculas. Também acelera
-- o login (findByEmailIgnoreCase).
CREATE UNIQUE INDEX uk_usuarios_email_upper
    ON usuarios (UPPER(email));

-- Um bairro aparece uma única vez por cidade. Sem isso, um
-- cadastro duplicado faz a consulta pública falhar.
CREATE UNIQUE INDEX uk_areas_atendidas_cidade_bairro
    ON areas_atendidas (UPPER(cidade), UPPER(bairro));

-- No máximo um cronograma ATIVO por rota e dia da semana
-- (mesma regra de CronogramaValidation). Também atende a busca
-- findByRotaIdAndAtivoTrue, executada pelo ciclo de lembretes.
CREATE UNIQUE INDEX uk_cronogramas_rota_dia_ativo
    ON cronogramas (rota_id, dia_semana)
    WHERE ativo;

-- ------------------------------------------------------------
-- 2. Índices nas chaves estrangeiras sem índice
--    (o PostgreSQL não cria índice automático para FK)
-- ------------------------------------------------------------

CREATE INDEX idx_areas_atendidas_rota_id
    ON areas_atendidas (rota_id);

CREATE INDEX idx_cronogramas_rota_id
    ON cronogramas (rota_id);

CREATE INDEX idx_preferencias_notificacao_rota_id
    ON preferencias_notificacao (rota_id);

CREATE INDEX idx_historico_notificacoes_rota_id
    ON historico_notificacoes (rota_id);

-- ------------------------------------------------------------
-- 3. Regras de domínio que só existiam no Java
-- ------------------------------------------------------------

-- Antecedência do lembrete: 0 a 72 horas (@Min/@Max do DTO).
ALTER TABLE preferencias_notificacao
    ADD CONSTRAINT ck_preferencias_notificacao_antecedencia_max
        CHECK (antecedencia_horas <= 72);

-- Valores dos enums CanalNotificacao e StatusNotificacao.
ALTER TABLE historico_notificacoes
    ADD CONSTRAINT ck_historico_notificacoes_canal
        CHECK (canal IN ('EMAIL', 'WEB_PUSH'));

ALTER TABLE historico_notificacoes
    ADD CONSTRAINT ck_historico_notificacoes_status
        CHECK (status IN ('PENDENTE', 'ENVIADO', 'FALHA', 'CANCELADO'));

-- Início e fim do cronograma não podem ser iguais
-- (CronogramaValidation.validarHorarios). Fim menor que o
-- início continua permitido: coleta que passa da meia-noite.
ALTER TABLE cronogramas
    ADD CONSTRAINT ck_cronogramas_horarios_diferentes
        CHECK (horario_inicio <> horario_fim);
