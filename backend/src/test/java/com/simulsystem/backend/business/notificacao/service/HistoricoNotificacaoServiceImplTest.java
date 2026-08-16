package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.notificacao.model.CanalNotificacao;
import com.simulsystem.backend.business.notificacao.model.HistoricoNotificacao;
import com.simulsystem.backend.business.notificacao.model.StatusNotificacao;
import com.simulsystem.backend.business.notificacao.repository.HistoricoNotificacaoRepository;
import com.simulsystem.backend.business.rota.model.Rota;
import com.simulsystem.backend.business.usuario.model.Usuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HistoricoNotificacaoServiceImplTest {

    @Mock
    private HistoricoNotificacaoRepository repository;

    private HistoricoNotificacaoServiceImpl service;

    private Usuario usuario;
    private Rota rota;
    private LocalDateTime dataHoraColeta;

    @BeforeEach
    void setUp() {
        service = new HistoricoNotificacaoServiceImpl(repository);

        usuario = new Usuario();
        usuario.setId(3L);

        rota = new Rota();
        rota.setId(1L);

        dataHoraColeta =
                LocalDateTime.of(2026, 8, 17, 19, 0);
    }

    @Test
    void deveReservarEnvioQuandoAindaNaoExistirHistorico() {
        when(repository
                .existsByUsuarioIdAndRotaIdAndDataHoraColetaAndCanal(
                        3L,
                        1L,
                        dataHoraColeta,
                        CanalNotificacao.EMAIL
                ))
                .thenReturn(false);

        when(repository.saveAndFlush(any(HistoricoNotificacao.class)))
                .thenAnswer(invocation -> {
                    HistoricoNotificacao historico =
                            invocation.getArgument(0);

                    historico.setId(1L);
                    return historico;
                });

        Optional<HistoricoNotificacao> resultado =
                service.reservarEnvio(
                        usuario,
                        rota,
                        dataHoraColeta,
                        CanalNotificacao.EMAIL
                );

        assertTrue(resultado.isPresent());

        assertEquals(
                StatusNotificacao.PENDENTE,
                resultado.orElseThrow().getStatus()
        );

        assertEquals(
                CanalNotificacao.EMAIL,
                resultado.orElseThrow().getCanal()
        );
    }

    @Test
    void naoDeveReservarQuandoHistoricoJaExistir() {
        when(repository
                .existsByUsuarioIdAndRotaIdAndDataHoraColetaAndCanal(
                        3L,
                        1L,
                        dataHoraColeta,
                        CanalNotificacao.EMAIL
                ))
                .thenReturn(true);

        Optional<HistoricoNotificacao> resultado =
                service.reservarEnvio(
                        usuario,
                        rota,
                        dataHoraColeta,
                        CanalNotificacao.EMAIL
                );

        assertTrue(resultado.isEmpty());

        verify(repository, never())
                .saveAndFlush(any(HistoricoNotificacao.class));
    }

    @Test
    void naoDeveReservarQuandoBancoDetectarConcorrencia() {
        when(repository
                .existsByUsuarioIdAndRotaIdAndDataHoraColetaAndCanal(
                        3L,
                        1L,
                        dataHoraColeta,
                        CanalNotificacao.EMAIL
                ))
                .thenReturn(false);

        when(repository.saveAndFlush(any(HistoricoNotificacao.class)))
                .thenThrow(
                        new DataIntegrityViolationException(
                                "Registro duplicado"
                        )
                );

        Optional<HistoricoNotificacao> resultado =
                service.reservarEnvio(
                        usuario,
                        rota,
                        dataHoraColeta,
                        CanalNotificacao.EMAIL
                );

        assertTrue(resultado.isEmpty());
    }

    @Test
    void deveMarcarHistoricoComoEnviado() {
        HistoricoNotificacao historico =
                criarHistoricoPendente();

        when(repository.findById(1L))
                .thenReturn(Optional.of(historico));

        LocalDateTime dataEnvio =
                LocalDateTime.of(2026, 8, 17, 16, 0);

        service.marcarComoEnviado(
                1L,
                dataEnvio
        );

        assertEquals(
                StatusNotificacao.ENVIADO,
                historico.getStatus()
        );

        assertEquals(
                dataEnvio,
                historico.getDataEnvio()
        );

        assertNull(historico.getMensagemErro());

        verify(repository).save(historico);
    }

    @Test
    void deveMarcarHistoricoComoFalha() {
        HistoricoNotificacao historico =
                criarHistoricoPendente();

        when(repository.findById(1L))
                .thenReturn(Optional.of(historico));

        service.marcarComoFalha(
                1L,
                "Erro SMTP"
        );

        assertEquals(
                StatusNotificacao.FALHA,
                historico.getStatus()
        );

        assertNull(historico.getDataEnvio());

        assertEquals(
                "Erro SMTP",
                historico.getMensagemErro()
        );

        verify(repository).save(historico);
    }

    private HistoricoNotificacao criarHistoricoPendente() {
        HistoricoNotificacao historico =
                new HistoricoNotificacao();

        historico.setId(1L);
        historico.setUsuario(usuario);
        historico.setRota(rota);
        historico.setDataHoraColeta(dataHoraColeta);
        historico.setCanal(CanalNotificacao.EMAIL);
        historico.setStatus(StatusNotificacao.PENDENTE);

        return historico;
    }
}