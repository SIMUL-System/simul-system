package com.simulsystem.backend.business.cidade;

import com.simulsystem.backend.business.cidade.model.Cidade;

/** Cidades prontas para os testes. */
public final class CidadesDeTeste {

    private CidadesDeTeste() {
    }

    public static Cidade cidade(Long id, String nome) {
        Cidade cidade = new Cidade();
        cidade.setId(id);
        cidade.setNome(nome);
        cidade.setUf("GO");
        return cidade;
    }

    public static Cidade senadorCanedo() {
        return cidade(1L, "Senador Canedo");
    }

    public static Cidade goiania() {
        return cidade(2L, "Goiânia");
    }
}
