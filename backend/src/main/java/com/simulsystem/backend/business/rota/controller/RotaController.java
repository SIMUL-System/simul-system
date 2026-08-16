package com.simulsystem.backend.business.rota.controller;

import com.simulsystem.backend.business.rota.dto.AreaAtendidaRequestDTO;
import com.simulsystem.backend.business.rota.dto.AreaAtendidaResponseDTO;
import com.simulsystem.backend.business.rota.dto.RotaRequestDTO;
import com.simulsystem.backend.business.rota.dto.RotaResponseDTO;
import com.simulsystem.backend.business.rota.service.RotaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/rotas")
@PreAuthorize("hasRole('ADMIN')")
public class RotaController {

    private final RotaService rotaService;

    public RotaController(RotaService rotaService) {
        this.rotaService = rotaService;
    }

    @PostMapping
    public ResponseEntity<RotaResponseDTO> cadastrarRota(
            @Valid @RequestBody RotaRequestDTO requestDTO
    ) {
        RotaResponseDTO rota = rotaService.cadastrarRota(requestDTO);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(rota);
    }

    @PostMapping("/areas")
    public ResponseEntity<AreaAtendidaResponseDTO> cadastrarAreaAtendida(
            @Valid @RequestBody AreaAtendidaRequestDTO requestDTO
    ) {
        AreaAtendidaResponseDTO area =
                rotaService.cadastrarAreaAtendida(requestDTO);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(area);
    }
}