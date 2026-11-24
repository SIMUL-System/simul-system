package com.simulsystem.backend.business.usuario.service;

import com.simulsystem.backend.business.usuario.dto.VerificacaoEmailResponseDTO;
import com.simulsystem.backend.business.usuario.model.Usuario;

/** Confirmação do e-mail do cadastro (o login só é liberado depois dela). */
public interface VerificacaoEmailService {

    /** Gera um novo link de confirmação (invalidando o anterior) e envia por e-mail. */
    void enviarVerificacao(Usuario usuario);

    /** Valida o token do link; confirma o e-mail se ele existir, não tiver sido usado e não estiver vencido. */
    VerificacaoEmailResponseDTO verificarEmail(String token);

    /** Reenvia o link. Não revela se o e-mail existe: quem chama sempre responde de forma neutra. */
    void reenviarVerificacao(String email);
}
