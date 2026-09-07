package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.notificacao.dto.PushSubscriptionRequestDTO;
import com.simulsystem.backend.business.notificacao.dto.PushSubscriptionResponseDTO;

import java.util.List;

public interface PushSubscriptionService {

    PushSubscriptionResponseDTO salvar(
            Long usuarioId,
            PushSubscriptionRequestDTO requestDTO
    );

    List<PushSubscriptionResponseDTO> listarPorUsuario(
            Long usuarioId
    );

    void remover(
            Long usuarioId,
            String endpoint
    );
}