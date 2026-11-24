package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.notificacao.dto.PushSubscriptionRequestDTO;
import com.simulsystem.backend.business.notificacao.dto.PushSubscriptionResponseDTO;
import com.simulsystem.backend.business.notificacao.mapper.PushSubscriptionMapper;
import com.simulsystem.backend.business.notificacao.model.PushSubscription;
import com.simulsystem.backend.business.notificacao.repository.PushSubscriptionRepository;
import com.simulsystem.backend.business.notificacao.validation.PushSubscriptionValidation;
import com.simulsystem.backend.business.usuario.model.Usuario;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Implementação de PushSubscriptionService. */
@Service
public class PushSubscriptionServiceImpl implements PushSubscriptionService {

    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final PushSubscriptionMapper pushSubscriptionMapper;
    private final PushSubscriptionValidation pushSubscriptionValidation;

    public PushSubscriptionServiceImpl(
            PushSubscriptionRepository pushSubscriptionRepository,
            PushSubscriptionMapper pushSubscriptionMapper,
            PushSubscriptionValidation pushSubscriptionValidation) {
        this.pushSubscriptionRepository = pushSubscriptionRepository;
        this.pushSubscriptionMapper = pushSubscriptionMapper;
        this.pushSubscriptionValidation = pushSubscriptionValidation;
    }

    @Override
    @Transactional
    public PushSubscriptionResponseDTO salvar(Usuario usuario, PushSubscriptionRequestDTO requestDTO) {
        PushSubscription inscricao = pushSubscriptionValidation
                .buscarInscricaoDoUsuario(requestDTO.endpoint(), usuario.getId())
                .map(existente -> {
                    // O navegador renovou as chaves: atualiza a mesma inscrição.
                    pushSubscriptionMapper.atualizarEntity(existente, requestDTO, usuario);
                    return existente;
                })
                .orElseGet(() -> pushSubscriptionMapper.toEntity(requestDTO, usuario));

        return pushSubscriptionMapper.toResponseDTO(pushSubscriptionRepository.save(inscricao));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PushSubscriptionResponseDTO> listarPorUsuario(Long usuarioId) {
        return pushSubscriptionRepository.findByUsuarioId(usuarioId).stream()
                .map(pushSubscriptionMapper::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional
    public void remover(Long usuarioId, String endpoint) {
        pushSubscriptionRepository.delete(pushSubscriptionValidation.buscarParaRemocao(endpoint, usuarioId));
    }
}
