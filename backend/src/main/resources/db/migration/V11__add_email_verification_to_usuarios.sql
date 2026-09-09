ALTER TABLE usuarios
ADD COLUMN email_verificado BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE usuarios
SET email_verificado = TRUE
WHERE email_verificado = FALSE;