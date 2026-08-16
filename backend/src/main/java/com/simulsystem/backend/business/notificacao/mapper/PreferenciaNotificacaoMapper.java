package com.simulsystem.backend.business.notificacao.mapper;

import com.simulsystem.backend.business.notificacao.dto.PreferenciaNotificacaoRequestDTO;
import com.simulsystem.backend.business.notificacao.dto.PreferenciaNotificacaoResponseDTO;
import com.simulsystem.backend.business.notificacao.model.PreferenciaNotificacao;
import com.simulsystem.backend.business.usuario.model.Usuario;
import org.springframework.stereotype.Component;

@Component
public class PreferenciaNotificacaoMapper {

    public PreferenciaNotificacao toEntity(
            PreferenciaNotificacaoRequestDTO requestDTO,
            Usuario usuario
    ) {
        PreferenciaNotificacao preferencia =
                new PreferenciaNotificacao();

        preferencia.setUsuario(usuario);
        preferencia.setEmailAtivo(requestDTO.emailAtivo());
        preferencia.setAntecedenciaHoras(
                requestDTO.antecedenciaHoras()
        );

        return preferencia;
    }

    public void atualizarEntity(
            PreferenciaNotificacao preferencia,
            PreferenciaNotificacaoRequestDTO requestDTO
    ) {
        preferencia.setEmailAtivo(requestDTO.emailAtivo());
        preferencia.setAntecedenciaHoras(
                requestDTO.antecedenciaHoras()
        );
    }

    public PreferenciaNotificacaoResponseDTO toResponseDTO(
            PreferenciaNotificacao preferencia
    ) {
        return new PreferenciaNotificacaoResponseDTO(
                preferencia.getId(),
                preferencia.getUsuario().getId(),
                preferencia.getEmailAtivo(),
                preferencia.getAntecedenciaHoras(),
                preferencia.getDataCriacao(),
                preferencia.getDataAtualizacao()
        );
    }
}