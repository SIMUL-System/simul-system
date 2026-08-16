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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.List;

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
    @GetMapping
public ResponseEntity<List<RotaResponseDTO>> listarRotas() {

    List<RotaResponseDTO> rotas =
            rotaService.listarRotas();

    return ResponseEntity.ok(rotas);
}
@PutMapping("/{id}")
public ResponseEntity<RotaResponseDTO> atualizarRota(
        @PathVariable Long id,
        @Valid @RequestBody RotaRequestDTO requestDTO
) {

    RotaResponseDTO rota =
            rotaService.atualizarRota(
                    id,
                    requestDTO
            );

    return ResponseEntity.ok(rota);
}
}