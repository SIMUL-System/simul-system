package com.simulsystem.backend.business.notificacao.validation;

import com.simulsystem.backend.business.notificacao.model.PreferenciaNotificacao;
import com.simulsystem.backend.business.notificacao.repository.PreferenciaNotificacaoRepository;
import com.simulsystem.backend.core.exception.PreferenciaNotificacaoJaCadastradaException;
import com.simulsystem.backend.core.exception.PreferenciaNotificacaoNaoEncontradaException;

import org.springframework.stereotype.Component;

/** Regras da preferência de lembrete (uma por usuário). */
@Component
public class PreferenciaNotificacaoValidation {

    private final PreferenciaNotificacaoRepository repository;

    public PreferenciaNotificacaoValidation(PreferenciaNotificacaoRepository repository) {
        this.repository = repository;
    }

    /** Impede uma segunda preferência para o mesmo usuário. */
    public void validarPreferenciaNaoCadastrada(Long usuarioId) {
        boolean existe = repository.existsByUsuarioId(usuarioId);

        if (existe) {
            throw new PreferenciaNotificacaoJaCadastradaException(
                    "O usuário já possui preferências de notificação cadastradas."
            );
        }
    }

    /** Preferência do usuário ou 404. */
    public PreferenciaNotificacao buscarPreferenciaExistente(Long usuarioId) {
        return repository.findByUsuarioId(usuarioId)
                .orElseThrow(() ->
                        new PreferenciaNotificacaoNaoEncontradaException(
                                "As preferências de notificação do usuário não foram encontradas."
                        )
                );
    }
}
