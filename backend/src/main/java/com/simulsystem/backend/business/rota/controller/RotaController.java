package com.simulsystem.backend.business.rota.controller;

import com.simulsystem.backend.business.rota.dto.AreaAtendidaRequestDTO;
import com.simulsystem.backend.business.rota.dto.AreaAtendidaResponseDTO;
import com.simulsystem.backend.business.rota.dto.AreaGeometriaRequestDTO;
import com.simulsystem.backend.business.rota.dto.AreaGeometriaResponseDTO;
import com.simulsystem.backend.business.rota.dto.RotaRequestDTO;
import com.simulsystem.backend.business.rota.dto.RotaResponseDTO;
import com.simulsystem.backend.business.rota.service.RotaService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Endpoints do ADMIN para rotas e áreas atendidas (/api/admin/rotas). */
@RestController
@RequestMapping("/api/admin/rotas")
@PreAuthorize("hasRole('ADMIN')")
public class RotaController {

    private final RotaService rotaService;

    public RotaController(RotaService rotaService) {
        this.rotaService = rotaService;
    }

    /** POST: cria uma rota. */
    @PostMapping
    public ResponseEntity<RotaResponseDTO> cadastrarRota(@Valid @RequestBody RotaRequestDTO requestDTO) {
        RotaResponseDTO rota = rotaService.cadastrarRota(requestDTO);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(rota);
    }

    /** GET: todas as rotas. */
    @GetMapping
    public ResponseEntity<List<RotaResponseDTO>> listarRotas() {
        List<RotaResponseDTO> rotas = rotaService.listarRotas();

        return ResponseEntity.ok(rotas);
    }

    /** PUT /{id}: edita nome e descrição. */
    @PutMapping("/{id}")
    public ResponseEntity<RotaResponseDTO> atualizarRota(
            @PathVariable Long id,
            @Valid @RequestBody RotaRequestDTO requestDTO
    ) {
        RotaResponseDTO rota = rotaService.atualizarRota(id, requestDTO);

        return ResponseEntity.ok(rota);
    }

    /** PATCH /{id}/status: ativa ou desativa a rota. */
    @PatchMapping("/{id}/status")
    public ResponseEntity<RotaResponseDTO> alterarStatus(@PathVariable Long id, @RequestParam boolean ativo) {
        RotaResponseDTO rota = rotaService.alterarStatus(id, ativo);

        return ResponseEntity.ok(rota);
    }

    /** POST /areas: cadastra um bairro numa rota. */
    @PostMapping("/areas")
    public ResponseEntity<AreaAtendidaResponseDTO> cadastrarAreaAtendida(
            @Valid @RequestBody AreaAtendidaRequestDTO requestDTO
    ) {
        AreaAtendidaResponseDTO area = rotaService.cadastrarAreaAtendida(requestDTO);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(area);
    }

    /** GET /areas: todas as áreas, inclusive de rotas inativas. */
    @GetMapping("/areas")
    public ResponseEntity<List<AreaAtendidaResponseDTO>> listarAreasAtendidas() {
        List<AreaAtendidaResponseDTO> areas = rotaService.listarAreasAtendidas();

        return ResponseEntity.ok(areas);
    }

    /** PUT /areas/{id}: edita cidade, bairro e rota. */
    @PutMapping("/areas/{id}")
    public ResponseEntity<AreaAtendidaResponseDTO> atualizarAreaAtendida(
            @PathVariable Long id,
            @Valid @RequestBody AreaAtendidaRequestDTO requestDTO
    ) {
        AreaAtendidaResponseDTO area = rotaService.atualizarAreaAtendida(id, requestDTO);

        return ResponseEntity.ok(area);
    }

    /** PUT /areas/{id}/geometria: salva o contorno desenhado no mapa. */
    @PutMapping("/areas/{id}/geometria")
    public ResponseEntity<AreaGeometriaResponseDTO> atualizarGeometriaArea(
            @PathVariable Long id,
            @Valid @RequestBody AreaGeometriaRequestDTO requestDTO
    ) {
        AreaGeometriaResponseDTO area = rotaService.atualizarGeometriaArea(id, requestDTO);

        return ResponseEntity.ok(area);
    }
}
