package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.notificacao.dto.PreferenciaNotificacaoRequestDTO;
import com.simulsystem.backend.business.notificacao.dto.PreferenciaNotificacaoResponseDTO;
import com.simulsystem.backend.business.notificacao.mapper.PreferenciaNotificacaoMapper;
import com.simulsystem.backend.business.notificacao.model.PreferenciaNotificacao;
import com.simulsystem.backend.business.notificacao.repository.PreferenciaNotificacaoRepository;
import com.simulsystem.backend.business.notificacao.validation.PreferenciaNotificacaoValidation;
import com.simulsystem.backend.business.usuario.model.Usuario;
import com.simulsystem.backend.business.usuario.service.UsuarioService;
import org.springframework.stereotype.Service;

@Service
public class PreferenciaNotificacaoServiceImpl
        implements PreferenciaNotificacaoService {

    private final PreferenciaNotificacaoRepository repository;
    private final PreferenciaNotificacaoMapper mapper;
    private final PreferenciaNotificacaoValidation validation;
    private final UsuarioService usuarioService;

    public PreferenciaNotificacaoServiceImpl(
            PreferenciaNotificacaoRepository repository,
            PreferenciaNotificacaoMapper mapper,
            PreferenciaNotificacaoValidation validation,
            UsuarioService usuarioService
    ) {
        this.repository = repository;
        this.mapper = mapper;
        this.validation = validation;
        this.usuarioService = usuarioService;
    }

    @Override
    public PreferenciaNotificacaoResponseDTO cadastrar(
            String emailUsuario,
            PreferenciaNotificacaoRequestDTO requestDTO
    ) {
        Usuario usuario =
                usuarioService.buscarEntidadePorEmail(
                        emailUsuario
                );

        validation.validarPreferenciaNaoCadastrada(
                usuario.getId()
        );

        PreferenciaNotificacao preferencia =
                mapper.toEntity(
                        requestDTO,
                        usuario
                );

        PreferenciaNotificacao preferenciaSalva =
                repository.save(preferencia);

        return mapper.toResponseDTO(
                preferenciaSalva
        );
    }

    @Override
    public PreferenciaNotificacaoResponseDTO buscar(
            String emailUsuario
    ) {
        Usuario usuario =
                usuarioService.buscarEntidadePorEmail(
                        emailUsuario
                );

        PreferenciaNotificacao preferencia =
                validation.buscarPreferenciaExistente(
                        usuario.getId()
                );

        return mapper.toResponseDTO(preferencia);
    }

    @Override
    public PreferenciaNotificacaoResponseDTO atualizar(
            String emailUsuario,
            PreferenciaNotificacaoRequestDTO requestDTO
    ) {
        Usuario usuario =
                usuarioService.buscarEntidadePorEmail(
                        emailUsuario
                );

        PreferenciaNotificacao preferencia =
                validation.buscarPreferenciaExistente(
                        usuario.getId()
                );

        mapper.atualizarEntity(
                preferencia,
                requestDTO
        );

        PreferenciaNotificacao preferenciaAtualizada =
                repository.save(preferencia);

        return mapper.toResponseDTO(
                preferenciaAtualizada
        );
    }
}