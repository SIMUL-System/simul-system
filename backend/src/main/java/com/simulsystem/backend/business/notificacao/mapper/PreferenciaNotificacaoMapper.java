package com.simulsystem.backend.business.notificacao.mapper;

import com.simulsystem.backend.business.notificacao.dto.PreferenciaNotificacaoRequestDTO;
import com.simulsystem.backend.business.notificacao.dto.PreferenciaNotificacaoResponseDTO;
import com.simulsystem.backend.business.notificacao.model.PreferenciaNotificacao;
import com.simulsystem.backend.business.rota.model.Rota;
import com.simulsystem.backend.business.usuario.model.Usuario;

import org.springframework.stereotype.Component;

/** Converte entre PreferenciaNotificacao e seus DTOs. */
@Component
public class PreferenciaNotificacaoMapper {

    /** Cria a preferência a partir do pedido. */
    public PreferenciaNotificacao toEntity(PreferenciaNotificacaoRequestDTO requestDTO, Usuario usuario, Rota rota) {
        PreferenciaNotificacao preferencia = new PreferenciaNotificacao();

        preferencia.setUsuario(usuario);
        preferencia.setRota(rota);
        preferencia.setEmailAtivo(requestDTO.emailAtivo());
        preferencia.setWebPushAtivo(requestDTO.webPushAtivo());
        preferencia.setAntecedenciaHoras(requestDTO.antecedenciaHoras());

        return preferencia;
    }

    /** Copia rota, canais e antecedência para a preferência existente. */
    public void atualizarEntity(
            PreferenciaNotificacao preferencia,
            PreferenciaNotificacaoRequestDTO requestDTO,
            Rota rota
    ) {
        preferencia.setRota(rota);
        preferencia.setEmailAtivo(requestDTO.emailAtivo());
        preferencia.setWebPushAtivo(requestDTO.webPushAtivo());
        preferencia.setAntecedenciaHoras(requestDTO.antecedenciaHoras());
    }

    /** Monta a resposta da preferência. */
    public PreferenciaNotificacaoResponseDTO toResponseDTO(PreferenciaNotificacao preferencia) {
        return new PreferenciaNotificacaoResponseDTO(
                preferencia.getId(),
                preferencia.getUsuario().getId(),
                preferencia.getRota().getId(),
                preferencia.getRota().getNome(),
                preferencia.getEmailAtivo(),
                preferencia.getWebPushAtivo(),
                preferencia.getAntecedenciaHoras(),
                preferencia.getDataCriacao(),
                preferencia.getDataAtualizacao()
        );
    }
}
