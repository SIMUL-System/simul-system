package com.simulsystem.backend.business.institucional.validation;

import com.simulsystem.backend.business.institucional.model.FotoInstituicao;
import com.simulsystem.backend.business.institucional.model.Integrante;
import com.simulsystem.backend.business.institucional.repository.FotoInstituicaoRepository;
import com.simulsystem.backend.business.institucional.repository.IntegranteRepository;
import com.simulsystem.backend.core.exception.ConteudoNaoEncontradoException;
import com.simulsystem.backend.core.exception.ConteudoInvalidoException;

import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/** Regras do "Quem somos": existência, link seguro e lista de ordem completa. */
@Component
public class InstitucionalValidation {

    private final FotoInstituicaoRepository fotoRepository;
    private final IntegranteRepository integranteRepository;

    public InstitucionalValidation(
            FotoInstituicaoRepository fotoRepository,
            IntegranteRepository integranteRepository
    ) {
        this.fotoRepository = fotoRepository;
        this.integranteRepository = integranteRepository;
    }

    /** Foto pelo id ou 404. */
    public FotoInstituicao buscarFoto(Long id) {
        return fotoRepository.findById(id)
                .orElseThrow(() -> new ConteudoNaoEncontradoException("Foto não encontrada."));
    }

    /** Integrante pelo id ou 404. */
    public Integrante buscarIntegrante(Long id) {
        return integranteRepository.findById(id)
                .orElseThrow(() -> new ConteudoNaoEncontradoException("Integrante não encontrado."));
    }

    /** Link vazio vira null; se houver, precisa começar com http:// ou https://. */
    public String validarLink(String link) {
        if (link == null || link.isBlank()) {
            return null;
        }

        String limpo = link.trim();

        if (!limpo.startsWith("https://") && !limpo.startsWith("http://")) {
            throw new ConteudoInvalidoException("O link deve começar com https://");
        }

        return limpo;
    }

    /** Legenda obrigatória, até 200 caracteres (vem de formulário com arquivo, fora do Bean Validation). */
    public String validarLegenda(String legenda) {
        if (legenda == null || legenda.isBlank()) {
            throw new ConteudoInvalidoException("Escreva uma legenda para a foto.");
        }

        if (legenda.trim().length() > 200) {
            throw new ConteudoInvalidoException("A legenda deve ter no máximo 200 caracteres.");
        }

        return legenda.trim();
    }

    /** A nova ordem precisa ter exatamente os mesmos ids que existem hoje. */
    public void validarOrdemCompleta(List<Long> idsExistentes, List<Long> idsEnviados) {
        Set<Long> enviados = new HashSet<>(idsEnviados);

        if (enviados.size() != idsEnviados.size() || !enviados.equals(new HashSet<>(idsExistentes))) {
            throw new ConteudoNaoEncontradoException(
                    "A lista de ordem está desatualizada. Recarregue a página e tente de novo."
            );
        }
    }
}
