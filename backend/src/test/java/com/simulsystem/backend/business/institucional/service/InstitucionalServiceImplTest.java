package com.simulsystem.backend.business.institucional.service;

import com.simulsystem.backend.business.institucional.dto.IntegranteRequestDTO;
import com.simulsystem.backend.business.institucional.model.Imagem;
import com.simulsystem.backend.business.institucional.model.Integrante;
import com.simulsystem.backend.business.institucional.repository.ConteudoInstitucionalRepository;
import com.simulsystem.backend.business.institucional.repository.FotoInstituicaoRepository;
import com.simulsystem.backend.business.institucional.repository.ImagemRepository;
import com.simulsystem.backend.business.institucional.repository.IntegranteRepository;
import com.simulsystem.backend.business.institucional.validation.ImagemValidation;
import com.simulsystem.backend.business.institucional.validation.InstitucionalValidation;
import com.simulsystem.backend.core.exception.ConteudoInvalidoException;
import com.simulsystem.backend.core.exception.ConteudoNaoEncontradoException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InstitucionalServiceImplTest {

    private static final byte[] JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x00};

    @Mock
    private ConteudoInstitucionalRepository conteudoRepository;

    @Mock
    private FotoInstituicaoRepository fotoRepository;

    @Mock
    private IntegranteRepository integranteRepository;

    @Mock
    private ImagemRepository imagemRepository;

    private InstitucionalServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new InstitucionalServiceImpl(
                conteudoRepository,
                fotoRepository,
                integranteRepository,
                imagemRepository,
                new ImagemValidation(),
                new InstitucionalValidation(fotoRepository, integranteRepository)
        );
    }

    @Test
    void deveTrocarAFotoDoIntegranteEApagarAAnterior() {
        Integrante integrante = integrante(1L, 0);
        integrante.setFotoId(50L);

        Imagem nova = new Imagem();
        nova.setId(60L);

        when(integranteRepository.findById(1L)).thenReturn(Optional.of(integrante));
        when(imagemRepository.save(any(Imagem.class))).thenReturn(nova);
        when(integranteRepository.save(integrante)).thenReturn(integrante);

        service.atualizarFotoIntegrante(1L, JPEG);

        assertEquals(60L, integrante.getFotoId());
        verify(imagemRepository).deleteById(50L);
    }

    @Test
    void deveReordenarAEquipeConformeALista() {
        Integrante a = integrante(1L, 0);
        Integrante b = integrante(2L, 1);

        when(integranteRepository.findAll()).thenReturn(List.of(a, b));

        service.reordenarIntegrantes(List.of(2L, 1L));

        assertEquals(1, a.getOrdem());
        assertEquals(0, b.getOrdem());
    }

    @Test
    void deveRecusarOrdemIncompleta() {
        when(integranteRepository.findAll()).thenReturn(List.of(integrante(1L, 0), integrante(2L, 1)));

        assertThrows(ConteudoNaoEncontradoException.class, () -> service.reordenarIntegrantes(List.of(1L)));
    }

    @Test
    void deveRecusarLinkQueNaoSejaHttp() {
        IntegranteRequestDTO pedido = new IntegranteRequestDTO("Ana", "Front-end", "Descrição", "javascript:alert(1)");

        assertThrows(ConteudoInvalidoException.class, () -> service.cadastrarIntegrante(pedido));
        verify(integranteRepository, never()).save(any());
    }

    @Test
    void naoDeveGuardarFotoSemLegenda() {
        assertThrows(ConteudoInvalidoException.class, () -> service.adicionarFoto(JPEG, "  "));
        verify(imagemRepository, never()).save(any());
    }

    private Integrante integrante(Long id, int ordem) {
        Integrante integrante = new Integrante();
        integrante.setId(id);
        integrante.setNome("Pessoa " + id);
        integrante.setOrdem(ordem);
        return integrante;
    }
}
