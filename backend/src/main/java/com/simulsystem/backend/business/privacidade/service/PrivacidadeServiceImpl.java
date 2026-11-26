package com.simulsystem.backend.business.privacidade.service;

import com.simulsystem.backend.business.notificacao.model.HistoricoNotificacao;
import com.simulsystem.backend.business.notificacao.model.PreferenciaNotificacao;
import com.simulsystem.backend.business.notificacao.repository.HistoricoNotificacaoRepository;
import com.simulsystem.backend.business.notificacao.repository.PreferenciaNotificacaoRepository;
import com.simulsystem.backend.business.notificacao.repository.PushSubscriptionRepository;
import com.simulsystem.backend.business.privacidade.dto.DadosContaDTO;
import com.simulsystem.backend.business.privacidade.dto.DadosLembreteDTO;
import com.simulsystem.backend.business.privacidade.dto.DadosPreferenciaDTO;
import com.simulsystem.backend.business.privacidade.dto.MeusDadosResponseDTO;
import com.simulsystem.backend.business.usuario.model.PerfilUsuario;
import com.simulsystem.backend.business.usuario.model.Usuario;
import com.simulsystem.backend.business.usuario.repository.TokenRecuperacaoSenhaRepository;
import com.simulsystem.backend.business.usuario.repository.TokenVerificacaoEmailRepository;
import com.simulsystem.backend.business.usuario.repository.UsuarioRepository;
import com.simulsystem.backend.business.usuario.service.UsuarioService;
import com.simulsystem.backend.core.exception.ExclusaoNaoPermitidaException;
import com.simulsystem.backend.core.exception.SenhaIncorretaException;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;

/** Implementação de PrivacidadeService. */
@Service
public class PrivacidadeServiceImpl implements PrivacidadeService {

    private static final String OBSERVACAO =
            "Senhas não aparecem aqui: o SIMUL guarda só um resumo irreversível delas. "
                    + "O e-mail fica criptografado no banco de dados.";

    private final UsuarioService usuarioService;
    private final UsuarioRepository usuarioRepository;
    private final PreferenciaNotificacaoRepository preferenciaRepository;
    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final HistoricoNotificacaoRepository historicoRepository;
    private final TokenVerificacaoEmailRepository tokenVerificacaoRepository;
    private final TokenRecuperacaoSenhaRepository tokenRecuperacaoRepository;
    private final PasswordEncoder passwordEncoder;
    private final Clock clock;

    public PrivacidadeServiceImpl(
            UsuarioService usuarioService,
            UsuarioRepository usuarioRepository,
            PreferenciaNotificacaoRepository preferenciaRepository,
            PushSubscriptionRepository pushSubscriptionRepository,
            HistoricoNotificacaoRepository historicoRepository,
            TokenVerificacaoEmailRepository tokenVerificacaoRepository,
            TokenRecuperacaoSenhaRepository tokenRecuperacaoRepository,
            PasswordEncoder passwordEncoder,
            Clock clock
    ) {
        this.usuarioService = usuarioService;
        this.usuarioRepository = usuarioRepository;
        this.preferenciaRepository = preferenciaRepository;
        this.pushSubscriptionRepository = pushSubscriptionRepository;
        this.historicoRepository = historicoRepository;
        this.tokenVerificacaoRepository = tokenVerificacaoRepository;
        this.tokenRecuperacaoRepository = tokenRecuperacaoRepository;
        this.passwordEncoder = passwordEncoder;
        this.clock = clock;
    }

    @Override
    @Transactional(readOnly = true)
    public MeusDadosResponseDTO exportarDados(String emailUsuario) {
        Usuario usuario = usuarioService.buscarEntidadePorEmail(emailUsuario);

        DadosContaDTO conta = new DadosContaDTO(
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil().name(),
                usuario.getEmailVerificado(),
                usuario.getDataCriacao(),
                usuario.getTermosVersao(),
                usuario.getTermosAceitosEm()
        );

        DadosPreferenciaDTO preferencia = preferenciaRepository
                .findByUsuarioId(usuario.getId())
                .map(this::converterPreferencia)
                .orElse(null);

        List<LocalDateTime> navegadores = pushSubscriptionRepository
                .findByUsuarioId(usuario.getId())
                .stream()
                .map(inscricao -> inscricao.getDataCriacao())
                .toList();

        List<DadosLembreteDTO> lembretes = historicoRepository
                .findTop200ByUsuarioIdOrderByDataHoraColetaDesc(usuario.getId())
                .stream()
                .map(this::converterLembrete)
                .toList();

        return new MeusDadosResponseDTO(
                LocalDateTime.now(clock), conta, preferencia, navegadores, lembretes, OBSERVACAO
        );
    }

    @Override
    @Transactional
    public void excluirConta(String emailUsuario, String senha) {
        Usuario usuario = usuarioService.buscarEntidadePorEmail(emailUsuario);

        if (usuario.getPerfil() == PerfilUsuario.ADMIN) {
            throw new ExclusaoNaoPermitidaException(
                    "A conta de administrador do sistema não pode ser excluída por aqui."
            );
        }

        if (senha == null || !passwordEncoder.matches(senha, usuario.getSenha())) {
            throw new SenhaIncorretaException("Senha incorreta. A conta não foi excluída.");
        }

        Long usuarioId = usuario.getId();

        // Primeiro o que depende do usuário, depois a conta.
        historicoRepository.deleteByUsuarioId(usuarioId);
        preferenciaRepository.deleteByUsuarioId(usuarioId);
        pushSubscriptionRepository.deleteByUsuarioId(usuarioId);
        tokenVerificacaoRepository.deleteByUsuarioId(usuarioId);
        tokenRecuperacaoRepository.deleteByUsuarioId(usuarioId);
        usuarioRepository.delete(usuario);
    }

    @Override
    @Transactional
    public void registrarAceiteTermos(String emailUsuario, String versao) {
        Usuario usuario = usuarioService.buscarEntidadePorEmail(emailUsuario);

        usuario.setTermosVersao(versao.trim());
        usuario.setTermosAceitosEm(LocalDateTime.now(clock));

        usuarioRepository.save(usuario);
    }

    private DadosPreferenciaDTO converterPreferencia(PreferenciaNotificacao preferencia) {
        return new DadosPreferenciaDTO(
                preferencia.getAreaAtendida().getNomeCidade(),
                preferencia.getAreaAtendida().getBairro(),
                preferencia.getRota().getNome(),
                preferencia.getEmailAtivo(),
                preferencia.getWebPushAtivo(),
                preferencia.getAntecedenciaHoras(),
                preferencia.getDataAtualizacao()
        );
    }

    private DadosLembreteDTO converterLembrete(HistoricoNotificacao historico) {
        return new DadosLembreteDTO(
                historico.getDataHoraColeta(),
                historico.getRota().getNome(),
                historico.getCanal().name(),
                historico.getStatus().name(),
                historico.getDataEnvio()
        );
    }
}
