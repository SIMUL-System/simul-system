package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.notificacao.dto.PreferenciaNotificacaoRequestDTO;
import com.simulsystem.backend.business.notificacao.dto.PreferenciaNotificacaoResponseDTO;
import com.simulsystem.backend.business.notificacao.mapper.PreferenciaNotificacaoMapper;
import com.simulsystem.backend.business.notificacao.model.CanalNotificacao;
import com.simulsystem.backend.business.notificacao.model.PreferenciaNotificacao;
import com.simulsystem.backend.business.notificacao.repository.PreferenciaNotificacaoRepository;
import com.simulsystem.backend.business.notificacao.validation.PreferenciaNotificacaoValidation;
import com.simulsystem.backend.business.rota.model.AreaAtendida;
import com.simulsystem.backend.business.rota.validation.AreaAtendidaValidation;
import com.simulsystem.backend.business.usuario.model.Usuario;
import com.simulsystem.backend.business.usuario.service.UsuarioService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Implementação de PreferenciaNotificacaoService. */
@Service
public class PreferenciaNotificacaoServiceImpl
        implements PreferenciaNotificacaoService {
    private final PreferenciaNotificacaoRepository repository;
    private final PreferenciaNotificacaoMapper mapper;
    private final PreferenciaNotificacaoValidation validation;
    private final UsuarioService usuarioService;
    private final AreaAtendidaValidation areaAtendidaValidation;

    public PreferenciaNotificacaoServiceImpl(
            PreferenciaNotificacaoRepository repository,
            PreferenciaNotificacaoMapper mapper,
            PreferenciaNotificacaoValidation validation,
            UsuarioService usuarioService,
            AreaAtendidaValidation areaAtendidaValidation
    ) {
        this.repository = repository;
        this.mapper = mapper;
        this.validation = validation;
        this.usuarioService = usuarioService;
        this.areaAtendidaValidation = areaAtendidaValidation;
    }

    @Override
    @Transactional
    public PreferenciaNotificacaoResponseDTO cadastrar(
            String emailUsuario,
            PreferenciaNotificacaoRequestDTO requestDTO
    ) {
        Usuario usuario = usuarioService.buscarEntidadePorEmail(emailUsuario);

        validation.validarPreferenciaNaoCadastrada(usuario.getId());

        AreaAtendida areaAtendida = areaAtendidaValidation.buscarPorId(requestDTO.areaAtendidaId());

        PreferenciaNotificacao preferencia = mapper.toEntity(requestDTO, usuario, areaAtendida);

        PreferenciaNotificacao preferenciaSalva = repository.save(preferencia);

        return mapper.toResponseDTO(preferenciaSalva);
    }

    @Override
    @Transactional
    public PreferenciaNotificacaoResponseDTO buscar(String emailUsuario) {
        Usuario usuario = usuarioService.buscarEntidadePorEmail(emailUsuario);

        PreferenciaNotificacao preferencia = validation.buscarPreferenciaExistente(usuario.getId());

        return mapper.toResponseDTO(preferencia);
    }

    @Override
    @Transactional
    public PreferenciaNotificacaoResponseDTO atualizar(
            String emailUsuario,
            PreferenciaNotificacaoRequestDTO requestDTO
    ) {
        Usuario usuario = usuarioService.buscarEntidadePorEmail(emailUsuario);

        PreferenciaNotificacao preferencia = validation.buscarPreferenciaExistente(usuario.getId());

        AreaAtendida areaAtendida = areaAtendidaValidation.buscarPorId(requestDTO.areaAtendidaId());

        mapper.atualizarEntity(preferencia, requestDTO, areaAtendida);

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

        // Sem preferência, ou o bairro do usuário está em outra rota desde a falha.
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
