package com.simulsystem.backend.business.notificacao.validation;

import com.simulsystem.backend.business.notificacao.model.PreferenciaNotificacao;
import com.simulsystem.backend.business.notificacao.repository.PreferenciaNotificacaoRepository;
import com.simulsystem.backend.core.exception.PreferenciaNotificacaoJaCadastradaException;
import com.simulsystem.backend.core.exception.PreferenciaNotificacaoNaoEncontradaException;
import org.springframework.stereotype.Component;

@Component
public class PreferenciaNotificacaoValidation {

    private final PreferenciaNotificacaoRepository repository;

    public PreferenciaNotificacaoValidation(
            PreferenciaNotificacaoRepository repository
    ) {
        this.repository = repository;
    }

    public void validarPreferenciaNaoCadastrada(
            Long usuarioId
    ) {
        boolean existe =
                repository.existsByUsuarioId(usuarioId);

        if (existe) {
            throw new PreferenciaNotificacaoJaCadastradaException(
                    "O usuário já possui preferências de notificação cadastradas."
            );
        }
    }

    public PreferenciaNotificacao buscarPreferenciaExistente(
            Long usuarioId
    ) {
        return repository.findByUsuarioId(usuarioId)
                .orElseThrow(() ->
                        new PreferenciaNotificacaoNaoEncontradaException(
                                "As preferências de notificação do usuário não foram encontradas."
                        )
                );
    }
}