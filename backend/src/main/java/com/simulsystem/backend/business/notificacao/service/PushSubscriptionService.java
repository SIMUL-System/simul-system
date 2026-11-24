package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.notificacao.dto.PushSubscriptionRequestDTO;
import com.simulsystem.backend.business.notificacao.dto.PushSubscriptionResponseDTO;
import com.simulsystem.backend.business.usuario.model.Usuario;

import java.util.List;

/** Navegadores inscritos para receber o lembrete por Web Push. */
public interface PushSubscriptionService {

    /** Inscreve o navegador ou atualiza as chaves de uma inscrição já existente do mesmo usuário. */
    PushSubscriptionResponseDTO salvar(Usuario usuario, PushSubscriptionRequestDTO requestDTO);

    /** Navegadores inscritos do usuário. */
    List<PushSubscriptionResponseDTO> listarPorUsuario(Long usuarioId);

    /** Cancela a inscrição do navegador (endpoint) do usuário. */
    void remover(Long usuarioId, String endpoint);
}
