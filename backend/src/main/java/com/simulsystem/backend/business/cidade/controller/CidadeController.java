package com.simulsystem.backend.business.cidade.controller;

import com.simulsystem.backend.business.cidade.dto.CidadeResponseDTO;
import com.simulsystem.backend.business.cidade.dto.FaixaTurnosDTO;
import com.simulsystem.backend.business.cidade.service.CidadeService;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Cidades e seus indicadores para o painel do ADMIN (/api/admin/cidades). */
@RestController
@RequestMapping("/api/admin/cidades")
@PreAuthorize("hasRole('ADMIN')")
public class CidadeController {

    private final CidadeService cidadeService;

    public CidadeController(CidadeService cidadeService) {
        this.cidadeService = cidadeService;
    }

    /** GET: cidades com rotas, bairros, coletas e pendências. */
    @GetMapping
    public ResponseEntity<List<CidadeResponseDTO>> listar() {
        return ResponseEntity.ok(cidadeService.listarComIndicadores());
    }

    /** GET /{id}: uma cidade com os indicadores. */
    @GetMapping("/{id}")
    public ResponseEntity<CidadeResponseDTO> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(cidadeService.buscarComIndicadores(id));
    }

    /** PUT /{id}/turnos: faixa média do turno diurno e do noturno na cidade. */
    @PutMapping("/{id}/turnos")
    public ResponseEntity<CidadeResponseDTO> atualizarTurnos(
            @PathVariable Long id,
            @Valid @RequestBody FaixaTurnosDTO faixa
    ) {
        return ResponseEntity.ok(cidadeService.atualizarTurnos(id, faixa));
    }
}
