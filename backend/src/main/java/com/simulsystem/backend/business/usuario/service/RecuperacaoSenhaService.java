package com.simulsystem.backend.business.usuario.service;

import com.simulsystem.backend.business.usuario.dto.RecuperacaoSenhaResponseDTO;
import com.simulsystem.backend.business.usuario.dto.RedefinicaoSenhaRequestDTO;

/** "Esqueci minha senha": link de uso único enviado por e-mail. */
public interface RecuperacaoSenhaService {

    /**
     * Envia o link de redefinição se o e-mail pertencer a uma conta ativa.
     * Não lança erro quando o e-mail não existe, para não revelar quem é cadastrado.
     */
    void solicitarRecuperacao(String email);

    /** Troca a senha a partir do token do link e invalida o token. */
    RecuperacaoSenhaResponseDTO redefinirSenha(RedefinicaoSenhaRequestDTO requestDTO);
}
