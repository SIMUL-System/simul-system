package com.simulsystem.backend.business.usuario.validation;

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
}