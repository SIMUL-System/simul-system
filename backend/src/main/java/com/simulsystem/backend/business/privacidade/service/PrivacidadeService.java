package com.simulsystem.backend.business.privacidade.service;

import com.simulsystem.backend.business.privacidade.dto.MeusDadosResponseDTO;

/** Direitos do titular dos dados (LGPD): acesso, exclusão e registro de aceite. */
public interface PrivacidadeService {

    /** Cópia de tudo o que o SIMUL guarda sobre o usuário. */
    MeusDadosResponseDTO exportarDados(String emailUsuario);

    /** Exclui a conta e todos os dados ligados a ela, depois de conferir a senha. */
    void excluirConta(String emailUsuario, String senha);

    /** Registra o aceite de uma nova versão dos Termos de Uso e da Política de Privacidade. */
    void registrarAceiteTermos(String emailUsuario, String versao);
}
