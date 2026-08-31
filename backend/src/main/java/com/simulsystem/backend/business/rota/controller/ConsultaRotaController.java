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

@RestController
@RequestMapping("/api/rotas")
public class ConsultaRotaController {

    private final RotaService rotaService;

    public ConsultaRotaController(
            RotaService rotaService
    ) {
        this.rotaService = rotaService;
    }

    @GetMapping("/areas")
    public ResponseEntity<List<AreaDisponivelResponseDTO>>
    listarAreasDisponiveis() {

        List<AreaDisponivelResponseDTO> areas =
                rotaService.listarAreasDisponiveis();

        return ResponseEntity.ok(areas);
    }

    @GetMapping("/consulta")
    public ResponseEntity<ConsultaColetaResponseDTO> consultar(
            @RequestParam String cidade,
            @RequestParam String bairro
    ) {
        ConsultaColetaResponseDTO response =
                rotaService.consultarPorCidadeEBairro(
                        cidade,
                        bairro
                );

        return ResponseEntity.ok(response);
    }
}