-- Migration to drop seconds from cronogramas time columns
-- This will truncate the seconds part for existing data and change column type to TIME(0)

-- 1. Truncate seconds for existing rows
UPDATE cronogramas
SET horario_inicio = date_trunc('minute', horario_inicio),
    horario_fim = date_trunc('minute', horario_fim);

-- 2. Alter columns to TIME(0) (precision 0, no seconds)
ALTER TABLE cronogramas
    ALTER COLUMN horario_inicio TYPE TIME(0),
    ALTER COLUMN horario_fim TYPE TIME(0);

-- Note: After this migration, any insert will store times without seconds by default.

COMMIT;
