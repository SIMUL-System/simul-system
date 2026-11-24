package com.simulsystem.backend.business.notificacao.service;

import com.simulsystem.backend.business.notificacao.dto.PreferenciaNotificacaoRequestDTO;
import com.simulsystem.backend.business.notificacao.dto.PreferenciaNotificacaoResponseDTO;
import com.simulsystem.backend.business.notificacao.model.CanalNotificacao;
import com.simulsystem.backend.business.notificacao.model.PreferenciaNotificacao;

import java.util.List;

/** Preferências de lembrete do morador (uma por usuário). */
public interface PreferenciaNotificacaoService {

    /** Cria a preferência do usuário logado; só pode existir uma. */
    PreferenciaNotificacaoResponseDTO cadastrar(String emailUsuario, PreferenciaNotificacaoRequestDTO requestDTO);

    /** Retorna a preferência do usuário logado (404 se ainda não existir). */
    PreferenciaNotificacaoResponseDTO buscar(String emailUsuario);

    /** Troca rota, canais e antecedência da preferência do usuário logado. */
    PreferenciaNotificacaoResponseDTO atualizar(String emailUsuario, PreferenciaNotificacaoRequestDTO requestDTO);

    /** Preferências de usuários e rotas ativos com ao menos um canal ligado (usadas pelo agendador). */
    List<PreferenciaNotificacao> buscarElegiveisParaProcessamento();

    /**
     * Diz se, pela configuração atual, o usuário ainda deve receber lembretes
     * dessa rota por esse canal. Usado antes de cada reenvio.
     */
    boolean podeReceber(Long usuarioId, Long rotaId, CanalNotificacao canal);
}
