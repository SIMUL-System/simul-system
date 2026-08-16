package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.notificacao.dto.PreferenciaNotificacaoRequestDTO;
import com.simulsystem.backend.business.notificacao.dto.PreferenciaNotificacaoResponseDTO;

public interface PreferenciaNotificacaoService {

    PreferenciaNotificacaoResponseDTO cadastrar(
            String emailUsuario,
            PreferenciaNotificacaoRequestDTO requestDTO
    );

    PreferenciaNotificacaoResponseDTO buscar(
            String emailUsuario
    );

    PreferenciaNotificacaoResponseDTO atualizar(
            String emailUsuario,
            PreferenciaNotificacaoRequestDTO requestDTO
    );
}