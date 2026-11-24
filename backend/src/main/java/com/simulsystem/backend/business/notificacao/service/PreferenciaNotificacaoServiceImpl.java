package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.notificacao.dto.PreferenciaNotificacaoRequestDTO;
import com.simulsystem.backend.business.notificacao.dto.PreferenciaNotificacaoResponseDTO;
import com.simulsystem.backend.business.notificacao.mapper.PreferenciaNotificacaoMapper;
import com.simulsystem.backend.business.notificacao.model.CanalNotificacao;
import com.simulsystem.backend.business.notificacao.model.PreferenciaNotificacao;
import com.simulsystem.backend.business.notificacao.repository.PreferenciaNotificacaoRepository;
import com.simulsystem.backend.business.notificacao.validation.PreferenciaNotificacaoValidation;
import com.simulsystem.backend.business.rota.model.Rota;
import com.simulsystem.backend.business.rota.validation.RotaValidation;
import com.simulsystem.backend.business.usuario.model.Usuario;
import com.simulsystem.backend.business.usuario.service.UsuarioService;

import org.springframework.stereotype.Service;

import java.util.List;

/** Implementação de PreferenciaNotificacaoService. */
@Service
public class PreferenciaNotificacaoServiceImpl
        implements PreferenciaNotificacaoService {
    private final PreferenciaNotificacaoRepository repository;
    private final PreferenciaNotificacaoMapper mapper;
    private final PreferenciaNotificacaoValidation validation;
    private final UsuarioService usuarioService;
    private final RotaValidation rotaValidation;

    public PreferenciaNotificacaoServiceImpl(
            PreferenciaNotificacaoRepository repository,
            PreferenciaNotificacaoMapper mapper,
            PreferenciaNotificacaoValidation validation,
            UsuarioService usuarioService,
            RotaValidation rotaValidation
    ) {
        this.repository = repository;
        this.mapper = mapper;
        this.validation = validation;
        this.usuarioService = usuarioService;
        this.rotaValidation = rotaValidation;
    }

    @Override
    public PreferenciaNotificacaoResponseDTO cadastrar(
            String emailUsuario,
            PreferenciaNotificacaoRequestDTO requestDTO
    ) {
        Usuario usuario = usuarioService.buscarEntidadePorEmail(emailUsuario);

        validation.validarPreferenciaNaoCadastrada(usuario.getId());

        Rota rota = rotaValidation.buscarRotaExistente(requestDTO.rotaId());

        PreferenciaNotificacao preferencia = mapper.toEntity(requestDTO, usuario, rota);

        PreferenciaNotificacao preferenciaSalva = repository.save(preferencia);

        return mapper.toResponseDTO(preferenciaSalva);
    }

    @Override
    public PreferenciaNotificacaoResponseDTO buscar(String emailUsuario) {
        Usuario usuario = usuarioService.buscarEntidadePorEmail(emailUsuario);

        PreferenciaNotificacao preferencia = validation.buscarPreferenciaExistente(usuario.getId());

        return mapper.toResponseDTO(preferencia);
    }

    @Override
    public PreferenciaNotificacaoResponseDTO atualizar(
            String emailUsuario,
            PreferenciaNotificacaoRequestDTO requestDTO
    ) {
        Usuario usuario = usuarioService.buscarEntidadePorEmail(emailUsuario);

        PreferenciaNotificacao preferencia = validation.buscarPreferenciaExistente(usuario.getId());

        Rota rota = rotaValidation.buscarRotaExistente(requestDTO.rotaId());

        mapper.atualizarEntity(preferencia, requestDTO, rota);

        PreferenciaNotificacao preferenciaAtualizada = repository.save(preferencia);

        return mapper.toResponseDTO(preferenciaAtualizada);
    }

    @Override
    public List<PreferenciaNotificacao> buscarElegiveisParaProcessamento() {
        return repository.buscarElegiveisParaProcessamento();
    }

    @Override
    public boolean podeReceber(Long usuarioId, Long rotaId, CanalNotificacao canal) {
        if (usuarioId == null || rotaId == null || canal == null) {
            return false;
        }

        PreferenciaNotificacao preferencia = repository.findByUsuarioId(usuarioId).orElse(null);

        // Sem preferência, ou o usuário trocou de rota depois da falha.
        if (preferencia == null || !rotaId.equals(preferencia.getRota().getId())) {
            return false;
        }

        if (!Boolean.TRUE.equals(preferencia.getUsuario().getAtivo())
                || !Boolean.TRUE.equals(preferencia.getRota().getAtivo())) {
            return false;
        }

        return switch (canal) {
            case EMAIL -> Boolean.TRUE.equals(preferencia.getEmailAtivo());
            case WEB_PUSH -> Boolean.TRUE.equals(preferencia.getWebPushAtivo());
        };
    }
}
