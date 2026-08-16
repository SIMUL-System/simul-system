package com.simulsystem.backend.business.cronograma.controller;

import com.simulsystem.backend.business.cronograma.dto.CronogramaRequestDTO;
import com.simulsystem.backend.business.cronograma.dto.CronogramaResponseDTO;
import com.simulsystem.backend.business.cronograma.service.CronogramaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PatchMapping;

import java.util.List;

@RestController
@RequestMapping("/api/admin/cronogramas")
@PreAuthorize("hasRole('ADMIN')")
public class CronogramaController {

    private final CronogramaService cronogramaService;

    public CronogramaController(
            CronogramaService cronogramaService
    ) {
        this.cronogramaService = cronogramaService;
    }

    @PostMapping
    public ResponseEntity<CronogramaResponseDTO> cadastrar(
            @Valid @RequestBody CronogramaRequestDTO requestDTO
    ) {

        CronogramaResponseDTO cronograma =
                cronogramaService.cadastrar(requestDTO);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(cronograma);
    }

    @GetMapping
    public ResponseEntity<List<CronogramaResponseDTO>> listar() {

        List<CronogramaResponseDTO> cronogramas =
                cronogramaService.listar();

        return ResponseEntity.ok(cronogramas);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CronogramaResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody CronogramaRequestDTO requestDTO
    ) {

        CronogramaResponseDTO cronograma =
                cronogramaService.atualizar(
                        id,
                        requestDTO
                );

        return ResponseEntity.ok(cronograma);
    }
    @PatchMapping("/{id}/status")
public ResponseEntity<CronogramaResponseDTO> alterarStatus(
        @PathVariable Long id,
        @RequestParam boolean ativo
) {
    CronogramaResponseDTO cronograma =
            cronogramaService.alterarStatus(id, ativo);

    return ResponseEntity.ok(cronograma);
}
    
}