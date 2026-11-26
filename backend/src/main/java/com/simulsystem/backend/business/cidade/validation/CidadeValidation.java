package com.simulsystem.backend.business.cidade.validation;

import com.simulsystem.backend.business.cidade.model.Cidade;
import com.simulsystem.backend.business.cidade.repository.CidadeRepository;
import com.simulsystem.backend.core.exception.CidadeDivergenteException;
import com.simulsystem.backend.core.exception.CidadeNaoEncontradaException;

import org.springframework.stereotype.Component;

/** Regras das cidades: existência e "tudo na mesma cidade". */
@Component
public class CidadeValidation {

    private final CidadeRepository cidadeRepository;

    public CidadeValidation(CidadeRepository cidadeRepository) {
        this.cidadeRepository = cidadeRepository;
    }

    /** Cidade pelo id ou 404. */
    public Cidade buscarCidadeExistente(Long cidadeId) {
        if (cidadeId == null) {
            throw new CidadeNaoEncontradaException("Escolha a cidade.");
        }

        return cidadeRepository.findById(cidadeId)
                .orElseThrow(() -> new CidadeNaoEncontradaException("A cidade informada não existe."));
    }

    /**
     * Quando o pedido informa a cidade pelo nome, ela precisa ser a cidade
     * da rota. Nome vazio é aceito (a cidade vem da rota).
     */
    public void validarNomeDaCidade(Cidade cidadeDaRota, String nomeInformado) {
        if (nomeInformado == null || nomeInformado.isBlank()) {
            return;
        }

        if (!cidadeDaRota.getNome().equalsIgnoreCase(nomeInformado.trim())) {
            throw new CidadeDivergenteException(
                    "A rota escolhida é de " + cidadeDaRota.getNome()
                            + ". Um bairro só pode ficar numa rota da própria cidade.");
        }
    }

    /** Duas cidades precisam ser a mesma (por exemplo, bairro e nova rota). */
    public void validarMesmaCidade(Cidade esperada, Cidade informada, String mensagem) {
        if (esperada == null || informada == null || !esperada.getId().equals(informada.getId())) {
            throw new CidadeDivergenteException(mensagem);
        }
    }
}
