-- ============================================================
-- SIMUL - V26
-- Faixa de horário dos turnos por cidade e coleta convencional.
--
-- As prefeituras informam só o turno (diurno ou noturno). Cada
-- cidade passa a guardar a faixa média de cada turno, informada
-- pela operadora da coleta. A faixa é mostrada como aproximada
-- ("turno noturno, aprox. das 19h às 4h") e o lembrete conta a
-- partir do início do turno da cidade. Os cronogramas continuam
-- sem horário exato: nada é inventado por bairro.
--
-- Aparecida de Goiânia, Trindade e Senador Canedo têm só a coleta
-- convencional cadastrada: as rotas dessas cidades deixam de ser
-- "tipo não informado" e passam a CONVENCIONAL. Goiânia continua
-- com a coleta seletiva (colunas de seletiva do PDF da Comurg).
-- ============================================================

ALTER TABLE cidades
    ADD COLUMN diurno_inicio TIME,
    ADD COLUMN diurno_fim TIME,
    ADD COLUMN noturno_inicio TIME,
    ADD COLUMN noturno_fim TIME,
    ADD COLUMN fonte_turnos VARCHAR(255),
    ADD CONSTRAINT ck_cidades_diurno_completo
        CHECK ((diurno_inicio IS NULL) = (diurno_fim IS NULL)),
    ADD CONSTRAINT ck_cidades_noturno_completo
        CHECK ((noturno_inicio IS NULL) = (noturno_fim IS NULL));

-- Faixa média de cada turno, por operadora (o horário exato varia por rota).
UPDATE cidades
SET diurno_inicio = v.diurno_inicio,
    diurno_fim = v.diurno_fim,
    noturno_inicio = v.noturno_inicio,
    noturno_fim = v.noturno_fim,
    fonte_turnos = v.fonte,
    data_atualizacao = CURRENT_TIMESTAMP
FROM (VALUES
    ('Goiânia', TIME '07:00', TIME '16:00', TIME '19:00', TIME '04:00',
        'Consórcio LimpaGyn: faixa média dos turnos; o horário exato varia por rota.'),
    ('Aparecida de Goiânia', TIME '06:00', TIME '16:00', TIME '18:00', TIME '03:00',
        'Consórcio Aparecida Limpa: faixa média dos turnos; o horário exato varia por rota.'),
    ('Senador Canedo', TIME '06:00', TIME '16:00', TIME '18:00', TIME '03:00',
        'Prefeitura de Senador Canedo: faixa média dos turnos; o horário exato varia por rota.'),
    ('Trindade', TIME '07:00', TIME '16:00', TIME '18:00', TIME '03:00',
        'Quebec Ambiental: faixa média dos turnos; o horário exato varia por rota.')
) AS v(nome, diurno_inicio, diurno_fim, noturno_inicio, noturno_fim, fonte)
WHERE UPPER(cidades.nome) = UPPER(v.nome);

-- Tipo de coleta: entra CONVENCIONAL.
ALTER TABLE rotas
    DROP CONSTRAINT ck_rotas_tipo_coleta,
    ADD CONSTRAINT ck_rotas_tipo_coleta
        CHECK (tipo_coleta IN ('SELETIVA', 'CONVENCIONAL', 'NAO_INFORMADO'));

UPDATE rotas r
SET tipo_coleta = 'CONVENCIONAL',
    descricao = REPLACE(r.descricao, 'A fonte não diz se é a coleta seletiva.', 'Coleta convencional.'),
    fonte = REPLACE(r.fonte, 'tipo não informado', 'coleta convencional'),
    data_atualizacao = CURRENT_TIMESTAMP
FROM cidades c
WHERE c.id = r.cidade_id
  AND r.tipo_coleta = 'NAO_INFORMADO'
  AND UPPER(c.nome) IN ('APARECIDA DE GOIÂNIA', 'TRINDADE', 'SENADOR CANEDO');
