package com.simulsystem.backend.business.cronograma.controller;

import com.simulsystem.backend.business.cronograma.dto.CronogramaHorarioLoteRequestDTO;
import com.simulsystem.backend.business.cronograma.dto.CronogramaRequestDTO;
import com.simulsystem.backend.business.cronograma.dto.CronogramaResponseDTO;
import com.simulsystem.backend.business.cronograma.dto.SemanaColetaRequestDTO;
import com.simulsystem.backend.business.cronograma.service.CronogramaService;

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

/** Endpoints do ADMIN para os horários de coleta de cada rota (/api/admin/cronogramas). */
@RestController
@RequestMapping("/api/admin/cronogramas")
@PreAuthorize("hasRole('ADMIN')")
public class CronogramaController {

    private final CronogramaService cronogramaService;

    public CronogramaController(CronogramaService cronogramaService) {
        this.cronogramaService = cronogramaService;
    }

    /** POST: cria um horário de coleta. */
    @PostMapping
    public ResponseEntity<CronogramaResponseDTO> cadastrar(@Valid @RequestBody CronogramaRequestDTO requestDTO) {
        CronogramaResponseDTO cronograma = cronogramaService.cadastrar(requestDTO);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(cronograma);
    }

    /** GET: todos os horários, ativos e inativos. */
    @GetMapping
    public ResponseEntity<List<CronogramaResponseDTO>> listar() {
        List<CronogramaResponseDTO> cronogramas = cronogramaService.listar();

        return ResponseEntity.ok(cronogramas);
    }

    /** PUT /lote/horario: muda início e fim de vários horários numa única transação. */
    @PutMapping("/lote/horario")
    public ResponseEntity<List<CronogramaResponseDTO>> alterarHorariosEmLote(
            @Valid @RequestBody CronogramaHorarioLoteRequestDTO requestDTO
    ) {
        List<CronogramaResponseDTO> cronogramas = cronogramaService.alterarHorariosEmLote(requestDTO);

        return ResponseEntity.ok(cronogramas);
    }

    /** PUT /rota/{rotaId}: define os dias e horários da semana da rota de uma só vez. */
    @PutMapping("/rota/{rotaId}")
    public ResponseEntity<List<CronogramaResponseDTO>> definirSemanaDaRota(
            @PathVariable Long rotaId,
            @Valid @RequestBody SemanaColetaRequestDTO requestDTO
    ) {
        List<CronogramaResponseDTO> cronogramas = cronogramaService.definirSemanaDaRota(rotaId, requestDTO);

        return ResponseEntity.ok(cronogramas);
    }

    /** PUT /{id}: edita rota, dia e horários. */
    @PutMapping("/{id}")
    public ResponseEntity<CronogramaResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody CronogramaRequestDTO requestDTO
    ) {
        CronogramaResponseDTO cronograma = cronogramaService.atualizar(id, requestDTO);

        return ResponseEntity.ok(cronograma);
    }

    /** PATCH /{id}/status: ativa ou desativa o horário. */
    @PatchMapping("/{id}/status")
    public ResponseEntity<CronogramaResponseDTO> alterarStatus(@PathVariable Long id, @RequestParam boolean ativo) {
        CronogramaResponseDTO cronograma = cronogramaService.alterarStatus(id, ativo);

        return ResponseEntity.ok(cronograma);
    }
}
