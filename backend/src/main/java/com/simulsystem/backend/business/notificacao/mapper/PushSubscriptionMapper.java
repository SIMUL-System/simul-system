package com.simulsystem.backend.business.notificacao.mapper;

import com.simulsystem.backend.business.notificacao.dto.PushSubscriptionRequestDTO;
import com.simulsystem.backend.business.notificacao.dto.PushSubscriptionResponseDTO;
import com.simulsystem.backend.business.notificacao.model.PushSubscription;
import com.simulsystem.backend.business.usuario.model.Usuario;
import org.springframework.stereotype.Component;

@Component
public class PushSubscriptionMapper {

    public PushSubscription toEntity(
            PushSubscriptionRequestDTO requestDTO,
            Usuario usuario
    ) {
        PushSubscription subscription =
                new PushSubscription();

        subscription.setUsuario(usuario);
        subscription.setEndpoint(requestDTO.endpoint());
        subscription.setP256dh(requestDTO.p256dh());
        subscription.setAuth(requestDTO.auth());

        return subscription;
    }

    public void atualizarEntity(
            PushSubscription subscription,
            PushSubscriptionRequestDTO requestDTO,
            Usuario usuario
    ) {
        subscription.setUsuario(usuario);
        subscription.setEndpoint(requestDTO.endpoint());
        subscription.setP256dh(requestDTO.p256dh());
        subscription.setAuth(requestDTO.auth());
    }

    public PushSubscriptionResponseDTO toResponseDTO(
            PushSubscription subscription
    ) {
        return new PushSubscriptionResponseDTO(
                subscription.getId(),
                subscription.getEndpoint(),
                subscription.getDataCriacao(),
                subscription.getDataAtualizacao()
        );
    }
}