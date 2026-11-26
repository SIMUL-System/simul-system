package com.simulsystem.backend.business.privacidade.controller;

import com.simulsystem.backend.business.privacidade.dto.AceiteTermosRequestDTO;
import com.simulsystem.backend.business.privacidade.dto.ExclusaoContaRequestDTO;
import com.simulsystem.backend.business.privacidade.dto.MeusDadosResponseDTO;
import com.simulsystem.backend.business.privacidade.service.PrivacidadeService;

import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Direitos do titular dos dados, sempre sobre a conta de quem está logado (/api/usuarios/me). */
@RestController
@RequestMapping("/api/usuarios/me")
public class PrivacidadeController {

    private final PrivacidadeService privacidadeService;

    public PrivacidadeController(PrivacidadeService privacidadeService) {
        this.privacidadeService = privacidadeService;
    }

    /** GET /dados: cópia dos dados pessoais, em JSON, para baixar. */
    @GetMapping("/dados")
    public ResponseEntity<MeusDadosResponseDTO> exportarDados(Authentication authentication) {
        MeusDadosResponseDTO dados = privacidadeService.exportarDados(authentication.getName());

        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(dados);
    }

    /** DELETE: exclui a conta e os dados ligados a ela (pede a senha). */
    @DeleteMapping
    public ResponseEntity<Void> excluirConta(
            Authentication authentication,
            @Valid @RequestBody ExclusaoContaRequestDTO requestDTO
    ) {
        privacidadeService.excluirConta(authentication.getName(), requestDTO.senha());

        return ResponseEntity.noContent().build();
    }

    /** PUT /termos: registra o aceite da versão atual dos termos. */
    @PutMapping("/termos")
    public ResponseEntity<Void> aceitarTermos(
            Authentication authentication,
            @Valid @RequestBody AceiteTermosRequestDTO requestDTO
    ) {
        privacidadeService.registrarAceiteTermos(authentication.getName(), requestDTO.versao());

        return ResponseEntity.noContent().build();
    }
}
