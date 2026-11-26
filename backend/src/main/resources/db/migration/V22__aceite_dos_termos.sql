-- ============================================================
-- SIMUL - V22
-- Registro do aceite dos Termos de Uso e da Política de
-- Privacidade (LGPD): quando a pessoa aceitou e qual versão do
-- texto ela leu. Contas antigas ficam em branco e recebem o
-- pedido de aceite no próximo acesso.
-- ============================================================

ALTER TABLE usuarios
    ADD COLUMN termos_aceitos_em TIMESTAMP,
    ADD COLUMN termos_versao VARCHAR(20);
