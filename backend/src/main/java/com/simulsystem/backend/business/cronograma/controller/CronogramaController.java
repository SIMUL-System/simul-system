package com.simulsystem.backend.business.cronograma.controller;

import com.simulsystem.backend.business.cronograma.dto.CronogramaRequestDTO;
import com.simulsystem.backend.business.cronograma.dto.CronogramaResponseDTO;
import com.simulsystem.backend.business.cronograma.service.CronogramaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}