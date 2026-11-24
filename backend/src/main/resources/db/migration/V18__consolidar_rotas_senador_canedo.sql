-- ============================================================
-- SIMUL - V18
-- Consolida as rotas de Senador Canedo criadas pela V15.
--
-- A V15 criou uma rota por bairro (109 rotas), mas só existem
-- 5 padrões de dias/horários. Esta migration cria uma rota por
-- padrão, aponta áreas, preferências e histórico para ela e
-- remove as rotas antigas e seus cronogramas duplicados.
--
-- O agrupamento é feito pelos cronogramas ATIVOS no momento da
-- execução: uma rota editada no painel (horário diferente) vira
-- um grupo próprio, sem ser misturada às outras. Rotas criadas
-- pelo painel (nome fora do padrão da V15) não são tocadas.
-- Cronogramas inativos das rotas antigas são descartados.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Padrão de cada rota da V15
-- ------------------------------------------------------------
CREATE TEMP TABLE v18_rota_padrao AS
SELECT
    r.id AS rota_id,
    r.ativo,
    COALESCE(
        STRING_AGG(
            c.dia_semana || ' ' ||
            TO_CHAR(c.horario_inicio, 'HH24:MI') || '-' ||
            TO_CHAR(c.horario_fim, 'HH24:MI'),
            ', '
            ORDER BY
                ARRAY_POSITION(
                    ARRAY['SEGUNDA','TERCA','QUARTA','QUINTA','SEXTA','SABADO','DOMINGO']::VARCHAR[],
                    c.dia_semana
                ),
                c.horario_inicio
        ),
        'SEM CRONOGRAMA ATIVO'
    ) AS padrao
FROM rotas r
LEFT JOIN cronogramas c
    ON c.rota_id = r.id
    AND c.ativo
WHERE r.nome LIKE 'Rota - % (Senador Canedo)'
GROUP BY r.id, r.ativo;

-- ------------------------------------------------------------
-- 2. Um grupo por padrão (ativo e inativo ficam separados)
-- ------------------------------------------------------------
CREATE TEMP TABLE v18_grupo AS
SELECT
    ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC, padrao) AS numero,
    padrao,
    ativo,
    MIN(rota_id) AS rota_modelo,
    COUNT(*) AS quantidade_rotas,
    CAST(NULL AS VARCHAR(120)) AS nome
FROM v18_rota_padrao
GROUP BY padrao, ativo;

UPDATE v18_grupo
SET nome =
    CASE padrao
        WHEN 'SEGUNDA 06:00-18:00, QUARTA 06:00-18:00, SEXTA 06:00-18:00'
            THEN 'Senador Canedo - Diurna (seg, qua e sex)'
        WHEN 'TERCA 06:00-18:00, QUINTA 06:00-18:00, SABADO 06:00-18:00'
            THEN 'Senador Canedo - Diurna (ter, qui e sáb)'
        WHEN 'SEGUNDA 18:00-23:59, QUARTA 18:00-23:59, SEXTA 18:00-23:59'
            THEN 'Senador Canedo - Noturna (seg, qua e sex)'
        WHEN 'TERCA 18:00-23:59, QUINTA 18:00-23:59, SABADO 18:00-23:59'
            THEN 'Senador Canedo - Noturna (ter, qui e sáb)'
        WHEN 'SEGUNDA 18:00-23:59, TERCA 18:00-23:59, QUARTA 18:00-23:59, QUINTA 18:00-23:59, SEXTA 18:00-23:59, SABADO 18:00-23:59'
            THEN 'Senador Canedo - Noturna (seg a sáb)'
        ELSE LEFT('Senador Canedo - ' || LOWER(padrao), 110)
    END
    || CASE WHEN ativo THEN '' ELSE ' - inativa' END;

-- ------------------------------------------------------------
-- 3. Rotas novas
-- ------------------------------------------------------------
CREATE TEMP TABLE v18_ids_antigos AS
SELECT rota_id FROM v18_rota_padrao;

INSERT INTO rotas (
    nome,
    descricao,
    ativo,
    data_criacao,
    data_atualizacao
)
SELECT
    g.nome,
    'Coleta seletiva de Senador Canedo agrupada por dias e horários. '
        || 'Reúne ' || g.quantidade_rotas || ' bairro(s).',
    g.ativo,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM v18_grupo g
ORDER BY g.numero;

-- Rota antiga -> rota nova
CREATE TEMP TABLE v18_mapa AS
SELECT
    p.rota_id AS rota_antiga,
    nova.id AS rota_nova
FROM v18_rota_padrao p
JOIN v18_grupo g
    ON g.padrao = p.padrao
    AND g.ativo = p.ativo
JOIN rotas nova
    ON nova.nome = g.nome
    AND nova.id NOT IN (SELECT rota_id FROM v18_ids_antigos);

-- Cronogramas da rota nova = cronogramas ativos da rota modelo
INSERT INTO cronogramas (
    rota_id,
    dia_semana,
    horario_inicio,
    horario_fim,
    ativo,
    data_criacao,
    data_atualizacao
)
SELECT
    m.rota_nova,
    c.dia_semana,
    c.horario_inicio,
    c.horario_fim,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM v18_grupo g
JOIN v18_mapa m
    ON m.rota_antiga = g.rota_modelo
JOIN cronogramas c
    ON c.rota_id = g.rota_modelo
    AND c.ativo;

-- ------------------------------------------------------------
-- 4. Aponta tudo para as rotas novas
-- ------------------------------------------------------------
UPDATE areas_atendidas a
SET rota_id = m.rota_nova
FROM v18_mapa m
WHERE a.rota_id = m.rota_antiga;

UPDATE preferencias_notificacao p
SET rota_id = m.rota_nova,
    data_atualizacao = CURRENT_TIMESTAMP
FROM v18_mapa m
WHERE p.rota_id = m.rota_antiga;

-- Histórico: se dois registros passarem a representar a mesma
-- ocorrência (usuário + rota + data da coleta + canal), mantém
-- o mais recente e descarta o outro, preservando a deduplicação.
DELETE FROM historico_notificacoes h
USING v18_mapa m
WHERE h.rota_id = m.rota_antiga
  AND EXISTS (
        SELECT 1
        FROM historico_notificacoes outro
        LEFT JOIN v18_mapa mo
            ON mo.rota_antiga = outro.rota_id
        WHERE outro.id <> h.id
          AND outro.usuario_id = h.usuario_id
          AND outro.data_hora_coleta = h.data_hora_coleta
          AND outro.canal = h.canal
          AND COALESCE(mo.rota_nova, outro.rota_id) = m.rota_nova
          AND outro.id > h.id
  );

UPDATE historico_notificacoes h
SET rota_id = m.rota_nova,
    data_atualizacao = CURRENT_TIMESTAMP
FROM v18_mapa m
WHERE h.rota_id = m.rota_antiga;

-- ------------------------------------------------------------
-- 5. Remove cronogramas e rotas antigos
-- ------------------------------------------------------------
DELETE FROM cronogramas
WHERE rota_id IN (SELECT rota_antiga FROM v18_mapa);

DELETE FROM rotas
WHERE id IN (SELECT rota_antiga FROM v18_mapa);

-- ------------------------------------------------------------
-- 6. Validação (divisão por zero aborta a migration)
-- ------------------------------------------------------------
SELECT
    1 / CASE WHEN COUNT(*) = (SELECT COUNT(*) FROM v18_ids_antigos)
             THEN 1 ELSE 0 END AS validacao_mapa_completo
FROM v18_mapa;

SELECT
    1 / CASE WHEN NOT EXISTS (
                SELECT 1 FROM rotas
                WHERE id IN (SELECT rota_id FROM v18_ids_antigos)
             )
             THEN 1 ELSE 0 END AS validacao_rotas_antigas_removidas;

SELECT
    1 / CASE WHEN NOT EXISTS (
                SELECT 1 FROM areas_atendidas a
                LEFT JOIN rotas r ON r.id = a.rota_id
                WHERE r.id IS NULL
             )
             THEN 1 ELSE 0 END AS validacao_areas_com_rota;

DROP TABLE v18_mapa;
DROP TABLE v18_ids_antigos;
DROP TABLE v18_grupo;
DROP TABLE v18_rota_padrao;
