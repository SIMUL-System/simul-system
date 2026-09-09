package com.simulsystem.backend.business.usuario.service;

import com.simulsystem.backend.business.usuario.dto.RecuperacaoSenhaResponseDTO;
import com.simulsystem.backend.business.usuario.dto.RedefinicaoSenhaRequestDTO;

public interface RecuperacaoSenhaService {

    void solicitarRecuperacao(
            String email
    );

    RecuperacaoSenhaResponseDTO redefinirSenha(
            RedefinicaoSenhaRequestDTO requestDTO
    );
}