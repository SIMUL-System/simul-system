package com.simulsystem.backend.business.usuario.validation;

import com.simulsystem.backend.business.usuario.model.Usuario;
import com.simulsystem.backend.business.usuario.repository.UsuarioRepository;
import com.simulsystem.backend.core.exception.EmailJaCadastradoException;
import org.springframework.stereotype.Component;

@Component
public class UsuarioValidation {

    private final UsuarioRepository usuarioRepository;

    public UsuarioValidation(
            UsuarioRepository usuarioRepository
    ) {
        this.usuarioRepository =
                usuarioRepository;
    }

    public void validarEmailNaoCadastrado(
            String email
    ) {
        if (
                usuarioRepository
                        .existsByEmailIgnoreCase(email)
        ) {
            throw new EmailJaCadastradoException(
                    "Já existe um usuário cadastrado com este e-mail."
            );
        }
    }

    public boolean emailJaVerificado(
            Usuario usuario
    ) {
        return Boolean.TRUE.equals(
                usuario.getEmailVerificado()
        );
    }

    public boolean senhasCoincidem(
            String senha,
            String confirmacaoSenha
    ) {
        if (
                senha == null ||
                confirmacaoSenha == null
        ) {
            return false;
        }

        return senha.equals(
                confirmacaoSenha
        );
    }
}