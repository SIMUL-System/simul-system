package com.simulsystem.backend.core.migracao;

import com.simulsystem.backend.core.security.CriptografiaDados;
import com.simulsystem.backend.core.util.Textos;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

import java.sql.PreparedStatement;

/**
 * Migration V6 (em Java, porque o e-mail é gravado cifrado com a chave
 * SIMUL_DADOS_CHAVE, que nunca vai para o SQL): cria a conta administrativa
 * do sistema.
 *
 * <p>A senha foi combinada com a equipe; aqui fica só o hash BCrypt. Depois da
 * apresentação, troque a senha pelo "Esqueci minha senha".
 *
 * <p>O Flyway roda esta classe uma única vez, como qualquer outra migration.
 * Ela é um bean do Spring para receber a CriptografiaDados configurada.
 */
@Component
public class V6__ContaAdministrativa extends BaseJavaMigration {

    static final String NOME = "Administração SIMUL";
    static final String EMAIL = "simul.sistema@gmail.com";
    static final String SENHA_BCRYPT = "$2a$10$NRURh93ChoBMy5.QjAMpfecAbErjdD0V7849TKw8DLBIhL1U5YV/K";

    private final CriptografiaDados criptografia;

    public V6__ContaAdministrativa(CriptografiaDados criptografia) {
        this.criptografia = criptografia;
    }

    @Override
    public void migrate(Context context) throws Exception {
        String email = Textos.normalizarEmail(EMAIL);

        try (PreparedStatement insercao = context.getConnection().prepareStatement("""
                INSERT INTO usuarios (
                    nome, email, email_hash, senha, perfil, ativo, email_verificado,
                    data_criacao, data_atualizacao
                )
                VALUES (?, ?, ?, ?, 'ADMIN', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """)) {
            insercao.setString(1, NOME);
            insercao.setString(2, criptografia.cifrar(email));
            insercao.setString(3, criptografia.indiceEmail(email));
            insercao.setString(4, SENHA_BCRYPT);
            insercao.executeUpdate();
        }
    }
}
