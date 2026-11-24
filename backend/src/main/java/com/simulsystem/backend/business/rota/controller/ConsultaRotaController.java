package com.simulsystem.backend.business.rota.controller;

import com.simulsystem.backend.business.rota.dto.AreaDisponivelResponseDTO;
import com.simulsystem.backend.business.rota.dto.ConsultaColetaResponseDTO;
import com.simulsystem.backend.business.rota.service.RotaService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Consulta pública da coleta, sem login (/api/rotas). */
@RestController
@RequestMapping("/api/rotas")
public class ConsultaRotaController {

    private final RotaService rotaService;

    public ConsultaRotaController(RotaService rotaService) {
        this.rotaService = rotaService;
    }

    /** GET /consulta?cidade=&bairro=: rota, contorno e horários ativos do bairro. */
    @GetMapping("/consulta")
    public ResponseEntity<ConsultaColetaResponseDTO> consultar(
            @RequestParam String cidade,
            @RequestParam String bairro
    ) {
        ConsultaColetaResponseDTO response = rotaService.consultarPorCidadeEBairro(cidade, bairro);

        return ResponseEntity.ok(response);
    }

    /** GET /areas: cidades e bairros disponíveis na consulta. */
    @GetMapping("/areas")
    public ResponseEntity<List<AreaDisponivelResponseDTO>> listarAreas() {
        // Só bairros de rotas ativas, e só cidade e bairro: é uma lista pública.
        List<AreaDisponivelResponseDTO> areas = rotaService.listarAreasDisponiveis();

        return ResponseEntity.ok(areas);
    }
}
