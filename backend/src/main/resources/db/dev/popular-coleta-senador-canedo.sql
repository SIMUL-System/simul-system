-- ============================================================
-- SIMUL
-- Carga acadêmica da coleta de Senador Canedo
-- ============================================================
--
-- Fonte de referência:
-- material "Coleta por Bairro" da Prefeitura de Senador Canedo.
--
-- O material informa período, e não horário exato.
--
-- Convenção acadêmica adotada pelo SIMUL:
--
-- DIURNO:
-- 06:00:00 até 18:00:00
--
-- NOTURNO:
-- 18:00:00 até 23:59:00
--
-- Cada área recebe uma rota própria para permitir que
-- cronogramas sejam administrados individualmente.
--
-- A rota NÃO representa necessariamente a trajetória física
-- de um caminhão.
-- ============================================================

BEGIN;

CREATE TEMP TABLE carga_coleta (
    area VARCHAR(120) NOT NULL,
    periodo VARCHAR(10) NOT NULL,
    grupo_dias VARCHAR(30) NOT NULL
);

-- ============================================================
-- DIURNO
-- SEGUNDA, QUARTA E SEXTA
-- ============================================================

INSERT INTO carga_coleta (area, periodo, grupo_dias)
VALUES
('Bairro São Francisco', 'DIURNO', 'SEG_QUA_SEX'),
('Bairro São Francisco II', 'DIURNO', 'SEG_QUA_SEX'),
('Cemitério', 'DIURNO', 'SEG_QUA_SEX'),
('Chácaras São Geraldo', 'DIURNO', 'SEG_QUA_SEX'),
('Chácaras Vargem Bonita II', 'DIURNO', 'SEG_QUA_SEX'),
('Chácaras Vargem Bonita', 'DIURNO', 'SEG_QUA_SEX'),
('Clube Social dos Cabos e Soldados', 'DIURNO', 'SEG_QUA_SEX'),
('Cond. Alto da Boa Vista', 'DIURNO', 'SEG_QUA_SEX'),
('Condomínio Alta Vista', 'DIURNO', 'SEG_QUA_SEX'),
('Condomínio Ecológico Mansões Morumbi', 'DIURNO', 'SEG_QUA_SEX'),
('Dist. Ind. Brasil Central', 'DIURNO', 'SEG_QUA_SEX'),
('Distrito Agroindustrial de Senador Canedo', 'DIURNO', 'SEG_QUA_SEX'),
('Frigorífico Independência', 'DIURNO', 'SEG_QUA_SEX'),
('Hortegranjeira', 'DIURNO', 'SEG_QUA_SEX'),
('Jardim Bougainville', 'DIURNO', 'SEG_QUA_SEX'),
('Jardim Flamboyant', 'DIURNO', 'SEG_QUA_SEX'),
('Jardim Primavera', 'DIURNO', 'SEG_QUA_SEX'),
('Jardim Sevilha', 'DIURNO', 'SEG_QUA_SEX'),
('Novo Residencial Prado', 'DIURNO', 'SEG_QUA_SEX'),
('Parque Industrial', 'DIURNO', 'SEG_QUA_SEX'),
('Parque Residencial Morumbi', 'DIURNO', 'SEG_QUA_SEX'),
('Perfinasa', 'DIURNO', 'SEG_QUA_SEX'),
('Petrobras', 'DIURNO', 'SEG_QUA_SEX'),
('Residencial Parque das Flores', 'DIURNO', 'SEG_QUA_SEX'),
('Residencial Ravena', 'DIURNO', 'SEG_QUA_SEX'),
('Residencial Aracy Amaral', 'DIURNO', 'SEG_QUA_SEX'),
('Residencial Aurora das Mansões', 'DIURNO', 'SEG_QUA_SEX'),
('Residencial Dona Lindu', 'DIURNO', 'SEG_QUA_SEX'),
('Residencial Laranjeiras', 'DIURNO', 'SEG_QUA_SEX'),
('Residencial Pedro Miranda', 'DIURNO', 'SEG_QUA_SEX'),
('Residencial Prado', 'DIURNO', 'SEG_QUA_SEX'),
('Residencial Villa Verde', 'DIURNO', 'SEG_QUA_SEX'),
('Setor Goiás', 'DIURNO', 'SEG_QUA_SEX'),
('Setor Monte Azul', 'DIURNO', 'SEG_QUA_SEX'),
('Setor Park Vitória', 'DIURNO', 'SEG_QUA_SEX'),
('Setor Vargem Bonita', 'DIURNO', 'SEG_QUA_SEX'),
('Sítio Café', 'DIURNO', 'SEG_QUA_SEX'),
('Sítio Olhos D''água', 'DIURNO', 'SEG_QUA_SEX'),
('Sítio Vale das Brisas', 'DIURNO', 'SEG_QUA_SEX'),
('Sítios Para Recreio Solar das Auroras', 'DIURNO', 'SEG_QUA_SEX'),
('Solar Park Ilhabelha', 'DIURNO', 'SEG_QUA_SEX'),
('Terra Bela', 'DIURNO', 'SEG_QUA_SEX'),
('Terras Alpha I', 'DIURNO', 'SEG_QUA_SEX'),
('Terras Alpha II', 'DIURNO', 'SEG_QUA_SEX'),
('Vargem Bonita', 'DIURNO', 'SEG_QUA_SEX'),
('Vila Bonsucesso', 'DIURNO', 'SEG_QUA_SEX'),
('Vila São Sebastião', 'DIURNO', 'SEG_QUA_SEX');

-- ============================================================
-- DIURNO
-- TERÇA, QUINTA E SÁBADO
-- ============================================================

INSERT INTO carga_coleta (area, periodo, grupo_dias)
VALUES
('Acambago', 'DIURNO', 'TER_QUI_SAB'),
('Chácaras Alvorada', 'DIURNO', 'TER_QUI_SAB'),
('Chácaras Pedroso', 'DIURNO', 'TER_QUI_SAB'),
('Cond. Toyolândia', 'DIURNO', 'TER_QUI_SAB'),
('Condomínio Portugal', 'DIURNO', 'TER_QUI_SAB'),
('Conj. Margarida Procópio', 'DIURNO', 'TER_QUI_SAB'),
('Conj. Valéria Perillo II', 'DIURNO', 'TER_QUI_SAB'),
('Conj. Valéria Perillo', 'DIURNO', 'TER_QUI_SAB'),
('Industrial Estrela Do Sul', 'DIURNO', 'TER_QUI_SAB'),
('Jardim das Oliveiras II', 'DIURNO', 'TER_QUI_SAB'),
('Jardim das Oliveiras', 'DIURNO', 'TER_QUI_SAB'),
('Jardim Liberdade', 'DIURNO', 'TER_QUI_SAB'),
('Parque Alvorada II', 'DIURNO', 'TER_QUI_SAB'),
('Parque Alvorada', 'DIURNO', 'TER_QUI_SAB'),
('Polo Confeccionista de Senador Canedo', 'DIURNO', 'TER_QUI_SAB'),
('Polo Educacional e Cultural de Senador Canedo', 'DIURNO', 'TER_QUI_SAB'),
('Polo Empresarial Nova Canaã', 'DIURNO', 'TER_QUI_SAB'),
('Quinhão 5', 'DIURNO', 'TER_QUI_SAB'),
('Jardim Ingá', 'DIURNO', 'TER_QUI_SAB'),
('Res. Condomínio Jardim Veneza', 'DIURNO', 'TER_QUI_SAB'),
('Residencial Morada do Sol', 'DIURNO', 'TER_QUI_SAB'),
('Residencial Flor do Ipê I', 'DIURNO', 'TER_QUI_SAB'),
('Residencial Flor do Ipê II', 'DIURNO', 'TER_QUI_SAB'),
('Residencial Hebrom', 'DIURNO', 'TER_QUI_SAB'),
('Residencial Marília', 'DIURNO', 'TER_QUI_SAB'),
('Residencial Parque Industrial', 'DIURNO', 'TER_QUI_SAB'),
('Residencial Parque dos Buritis', 'DIURNO', 'TER_QUI_SAB'),
('Residencial Vale Verde', 'DIURNO', 'TER_QUI_SAB'),
('Residencial Recanto das Oliveiras', 'DIURNO', 'TER_QUI_SAB'),
('Residencial Rio Araguaia', 'DIURNO', 'TER_QUI_SAB'),
('Setor Castros', 'DIURNO', 'TER_QUI_SAB'),
('Setor Estrela Sul', 'DIURNO', 'TER_QUI_SAB'),
('Sítio Mansões Retiro', 'DIURNO', 'TER_QUI_SAB'),
('Vila Galvão', 'DIURNO', 'TER_QUI_SAB'),
('Vila São João', 'DIURNO', 'TER_QUI_SAB');

-- ============================================================
-- NOTURNO
-- SEGUNDA, QUARTA E SEXTA
-- ============================================================

INSERT INTO carga_coleta (area, periodo, grupo_dias)
VALUES
('Bairro Alvorada', 'NOTURNO', 'SEG_QUA_SEX'),
('Bairro das Indústrias', 'NOTURNO', 'SEG_QUA_SEX'),
('Conj. Morada do Morro', 'NOTURNO', 'SEG_QUA_SEX'),
('Conjunto Sabiá', 'NOTURNO', 'SEG_QUA_SEX'),
('Conjunto Urapuru', 'NOTURNO', 'SEG_QUA_SEX'),
('Jardim do Lago', 'NOTURNO', 'SEG_QUA_SEX'),
('Jardim Nova Goiânia', 'NOTURNO', 'SEG_QUA_SEX'),
('Res. Anuar Aliad', 'NOTURNO', 'SEG_QUA_SEX'),
('Residencial Boa Esperança', 'NOTURNO', 'SEG_QUA_SEX'),
('Residencial Boa Vista II', 'NOTURNO', 'SEG_QUA_SEX'),
('Residencial Boa Vista', 'NOTURNO', 'SEG_QUA_SEX'),
('Residencial Buriti', 'NOTURNO', 'SEG_QUA_SEX'),
('Residencial Ecológico', 'NOTURNO', 'SEG_QUA_SEX'),
('Residencial Paraíso II', 'NOTURNO', 'SEG_QUA_SEX'),
('Residencial Paraíso', 'NOTURNO', 'SEG_QUA_SEX'),
('Residencial Recanto dos Sonhos', 'NOTURNO', 'SEG_QUA_SEX'),
('Setor Genoveva Rezende Machado', 'NOTURNO', 'SEG_QUA_SEX'),
('Solar Monte Cristo', 'NOTURNO', 'SEG_QUA_SEX'),
('St. Morada Nova', 'NOTURNO', 'SEG_QUA_SEX');

-- ============================================================
-- NOTURNO
-- TERÇA, QUINTA E SÁBADO
-- ============================================================

INSERT INTO carga_coleta (area, periodo, grupo_dias)
VALUES
('Residencial Jardim Canedo III', 'NOTURNO', 'TER_QUI_SAB'),
('Residencial Jardim Canedo', 'NOTURNO', 'TER_QUI_SAB'),
('Residencial Santa Edwiges', 'NOTURNO', 'TER_QUI_SAB'),
('Residencial Morada do Bosque', 'NOTURNO', 'TER_QUI_SAB'),
('Residencial Jardim Canedo II', 'NOTURNO', 'TER_QUI_SAB'),
('Setor Comercial', 'NOTURNO', 'TER_QUI_SAB');

-- ============================================================
-- NOTURNO
-- SEGUNDA A SÁBADO
-- ============================================================

INSERT INTO carga_coleta (area, periodo, grupo_dias)
VALUES
('Jardim Todos os Santos', 'NOTURNO', 'SEG_A_SAB'),
('Vila Santa Rosa', 'NOTURNO', 'SEG_A_SAB');

-- ============================================================
-- Validação da carga temporária
-- Devem existir exatamente 109 áreas.
-- ============================================================

DO $$
BEGIN
    IF (
        SELECT COUNT(*)
        FROM carga_coleta
    ) <> 109 THEN
        RAISE EXCEPTION
            'Carga inválida. Eram esperadas 109 áreas.';
    END IF;
END $$;

-- ============================================================
-- ROTAS
-- Uma rota interna para cada área atendida.
-- ============================================================

INSERT INTO rotas (
    nome,
    descricao,
    ativo,
    data_criacao,
    data_atualizacao
)
SELECT
    'Rota - ' || area,
    'Rota interna associada à área ' || area ||
    '. Carga acadêmica baseada no cronograma municipal.',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM carga_coleta
ORDER BY area;

-- ============================================================
-- ÁREAS ATENDIDAS
-- ============================================================

INSERT INTO areas_atendidas (
    cidade,
    bairro,
    rota_id
)
SELECT
    'Senador Canedo',
    carga.area,
    rota.id
FROM carga_coleta carga
JOIN rotas rota
    ON rota.nome = 'Rota - ' || carga.area
ORDER BY carga.area;

-- ============================================================
-- CRONOGRAMAS
--
-- DIURNO:
-- 06:00 até 18:00
--
-- NOTURNO:
-- 18:00 até 23:59
-- ============================================================

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
    rota.id,
    dias.dia_semana,
    CASE
        WHEN carga.periodo = 'DIURNO'
            THEN TIME '06:00:00'
        ELSE TIME '18:00:00'
    END,
    CASE
        WHEN carga.periodo = 'DIURNO'
            THEN TIME '18:00:00'
        ELSE TIME '23:59:00'
    END,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM carga_coleta carga
JOIN rotas rota
    ON rota.nome = 'Rota - ' || carga.area
JOIN (
    VALUES
        ('SEG_QUA_SEX', 'SEGUNDA'),
        ('SEG_QUA_SEX', 'QUARTA'),
        ('SEG_QUA_SEX', 'SEXTA'),

        ('TER_QUI_SAB', 'TERCA'),
        ('TER_QUI_SAB', 'QUINTA'),
        ('TER_QUI_SAB', 'SABADO'),

        ('SEG_A_SAB', 'SEGUNDA'),
        ('SEG_A_SAB', 'TERCA'),
        ('SEG_A_SAB', 'QUARTA'),
        ('SEG_A_SAB', 'QUINTA'),
        ('SEG_A_SAB', 'SEXTA'),
        ('SEG_A_SAB', 'SABADO')
) AS dias(grupo_dias, dia_semana)
    ON dias.grupo_dias = carga.grupo_dias;

-- ============================================================
-- VALIDAÇÃO FINAL
-- ============================================================

DO $$
DECLARE
    quantidade_rotas INTEGER;
    quantidade_areas INTEGER;
    quantidade_cronogramas INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO quantidade_rotas
    FROM rotas;

    SELECT COUNT(*)
    INTO quantidade_areas
    FROM areas_atendidas;

    SELECT COUNT(*)
    INTO quantidade_cronogramas
    FROM cronogramas;

    IF quantidade_rotas <> 109 THEN
        RAISE EXCEPTION
            'Quantidade de rotas inválida: %. Esperado: 109.',
            quantidade_rotas;
    END IF;

    IF quantidade_areas <> 109 THEN
        RAISE EXCEPTION
            'Quantidade de áreas inválida: %. Esperado: 109.',
            quantidade_areas;
    END IF;

    IF quantidade_cronogramas <> 333 THEN
        RAISE EXCEPTION
            'Quantidade de cronogramas inválida: %. Esperado: 333.',
            quantidade_cronogramas;
    END IF;
END $$;

COMMIT;

-- ============================================================
-- CONSULTA DE CONFERÊNCIA
-- ============================================================

SELECT
    a.cidade,
    a.bairro,
    r.nome AS rota,
    c.dia_semana,
    c.horario_inicio,
    c.horario_fim
FROM areas_atendidas a
JOIN rotas r
    ON r.id = a.rota_id
JOIN cronogramas c
    ON c.rota_id = r.id
ORDER BY
    a.bairro,
    CASE c.dia_semana
        WHEN 'SEGUNDA' THEN 1
        WHEN 'TERCA' THEN 2
        WHEN 'QUARTA' THEN 3
        WHEN 'QUINTA' THEN 4
        WHEN 'SEXTA' THEN 5
        WHEN 'SABADO' THEN 6
        WHEN 'DOMINGO' THEN 7
    END;