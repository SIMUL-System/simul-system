package com.simulsystem.backend.business.usuario.validation;

import com.simulsystem.backend.business.usuario.model.Usuario;
import com.simulsystem.backend.business.usuario.repository.UsuarioRepository;
import com.simulsystem.backend.core.exception.EmailJaCadastradoException;
import com.simulsystem.backend.core.security.CriptografiaDados;

import org.springframework.stereotype.Component;

/** Regras do usuário: e-mail único, e-mail confirmado e senhas iguais. */
@Component
public class UsuarioValidation {

    private final UsuarioRepository usuarioRepository;
    private final CriptografiaDados criptografia;

    public UsuarioValidation(UsuarioRepository usuarioRepository, CriptografiaDados criptografia) {
        this.usuarioRepository = usuarioRepository;
        this.criptografia = criptografia;
    }

    /** Impede dois cadastros com o mesmo e-mail. */
    public void validarEmailNaoCadastrado(String email) {
        if (usuarioRepository.existsByEmailHash(criptografia.indiceEmail(email))) {
            throw new EmailJaCadastradoException("Já existe um usuário cadastrado com este e-mail.");
        }
    }

    /** O usuário já confirmou o e-mail? */
    public boolean emailJaVerificado(Usuario usuario) {
        return Boolean.TRUE.equals(usuario.getEmailVerificado());
    }

    /** Nova senha e confirmação são iguais? */
    public boolean senhasCoincidem(String senha, String confirmacaoSenha) {
        if (senha == null || confirmacaoSenha == null) {
            return false;
        }

        return senha.equals(confirmacaoSenha);
    }
}
