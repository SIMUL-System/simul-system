package com.simulsystem.backend.business.usuario.service;

import com.simulsystem.backend.business.usuario.dto.VerificacaoEmailResponseDTO;
import com.simulsystem.backend.business.usuario.model.Usuario;

public interface VerificacaoEmailService {

    void enviarVerificacao(
            Usuario usuario
    );

    VerificacaoEmailResponseDTO verificarEmail(
            String token
    );

    void reenviarVerificacao(
            String email
    );
}