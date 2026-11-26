package com.simulsystem.backend.core.migracao;

import com.simulsystem.backend.core.security.CriptografiaDados;
import com.simulsystem.backend.core.util.Textos;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

/**
 * Migration V21 (em Java, porque precisa da chave, que nunca vai para o SQL):
 * cifra o e-mail de todos os usuários já cadastrados e cria o índice HMAC
 * (email_hash), que passa a garantir e-mail único no lugar dos índices antigos.
 *
 * <p>O Flyway roda esta classe uma única vez, como qualquer outra migration.
 * Ela é um bean do Spring para receber a CriptografiaDados configurada com a
 * variável SIMUL_DADOS_CHAVE.
 */
@Component
public class V21__CriptografarEmails extends BaseJavaMigration {

    private final CriptografiaDados criptografia;

    public V21__CriptografarEmails(CriptografiaDados criptografia) {
        this.criptografia = criptografia;
    }

    @Override
    public void migrate(Context context) throws Exception {
        Connection conexao = context.getConnection();

        try (Statement comando = conexao.createStatement()) {
            comando.execute("ALTER TABLE usuarios ADD COLUMN email_hash VARCHAR(64)");
            // O texto cifrado é maior que o e-mail original.
            comando.execute("ALTER TABLE usuarios ALTER COLUMN email TYPE VARCHAR(512)");
            // Com o e-mail cifrado (IV aleatório), os índices sobre ele deixam de servir.
            comando.execute("ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS uk_usuarios_email");
            comando.execute("DROP INDEX IF EXISTS uk_usuarios_email_upper");
        }

        try (PreparedStatement consulta = conexao.prepareStatement("SELECT id, email FROM usuarios");
             PreparedStatement atualizacao = conexao.prepareStatement(
                     "UPDATE usuarios SET email = ?, email_hash = ? WHERE id = ?");
             ResultSet linhas = consulta.executeQuery()) {

            while (linhas.next()) {
                String email = Textos.normalizarEmail(linhas.getString("email"));

                atualizacao.setString(1, criptografia.cifrar(email));
                atualizacao.setString(2, criptografia.indiceEmail(email));
                atualizacao.setLong(3, linhas.getLong("id"));
                atualizacao.addBatch();
            }

            atualizacao.executeBatch();
        }

        try (Statement comando = conexao.createStatement()) {
            comando.execute("ALTER TABLE usuarios ALTER COLUMN email_hash SET NOT NULL");
            comando.execute(
                    "ALTER TABLE usuarios ADD CONSTRAINT uk_usuarios_email_hash UNIQUE (email_hash)");
        }
    }
}
