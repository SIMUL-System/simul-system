package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.notificacao.dto.PushSubscriptionRequestDTO;
import com.simulsystem.backend.business.notificacao.dto.PushSubscriptionResponseDTO;
import com.simulsystem.backend.business.notificacao.mapper.PushSubscriptionMapper;
import com.simulsystem.backend.business.notificacao.model.PushSubscription;
import com.simulsystem.backend.business.notificacao.repository.PushSubscriptionRepository;
import com.simulsystem.backend.business.notificacao.validation.PushSubscriptionValidation;
import com.simulsystem.backend.business.usuario.model.Usuario;
import com.simulsystem.backend.business.usuario.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PushSubscriptionServiceImpl
        implements PushSubscriptionService {

    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final UsuarioRepository usuarioRepository;
    private final PushSubscriptionMapper pushSubscriptionMapper;
    private final PushSubscriptionValidation pushSubscriptionValidation;

    public PushSubscriptionServiceImpl(
            PushSubscriptionRepository pushSubscriptionRepository,
            UsuarioRepository usuarioRepository,
            PushSubscriptionMapper pushSubscriptionMapper,
            PushSubscriptionValidation pushSubscriptionValidation
    ) {
        this.pushSubscriptionRepository =
                pushSubscriptionRepository;

        this.usuarioRepository =
                usuarioRepository;

        this.pushSubscriptionMapper =
                pushSubscriptionMapper;

        this.pushSubscriptionValidation =
                pushSubscriptionValidation;
    }

    @Override
    @Transactional
    public PushSubscriptionResponseDTO salvar(
            Long usuarioId,
            PushSubscriptionRequestDTO requestDTO
    ) {
        Usuario usuario =
                usuarioRepository
                        .findById(usuarioId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Usuário não encontrado."
                                )
                        );

        PushSubscription existente =
                pushSubscriptionValidation
                        .buscarPorEndpoint(
                                requestDTO.endpoint()
                        );

        PushSubscription subscription;

        if (existente != null) {
            Long usuarioExistenteId =
                    existente
                            .getUsuario()
                            .getId();

            if (!usuarioExistenteId.equals(usuarioId)) {
                throw new IllegalArgumentException(
                        "Este navegador já está associado a outro usuário."
                );
            }

            pushSubscriptionMapper
                    .atualizarEntity(
                            existente,
                            requestDTO,
                            usuario
                    );

            subscription = existente;
        } else {
            subscription =
                    pushSubscriptionMapper
                            .toEntity(
                                    requestDTO,
                                    usuario
                            );
        }

        PushSubscription salva =
                pushSubscriptionRepository
                        .save(subscription);

        return pushSubscriptionMapper
                .toResponseDTO(salva);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PushSubscriptionResponseDTO> listarPorUsuario(
            Long usuarioId
    ) {
        return pushSubscriptionRepository
                .findByUsuarioId(usuarioId)
                .stream()
                .map(
                        pushSubscriptionMapper::toResponseDTO
                )
                .toList();
    }

    @Override
    @Transactional
    public void remover(
            Long usuarioId,
            String endpoint
    ) {
        PushSubscription subscription =
                pushSubscriptionValidation
                        .buscarPorEndpointDoUsuario(
                                endpoint,
                                usuarioId
                        );

        pushSubscriptionRepository
                .delete(subscription);
    }
}