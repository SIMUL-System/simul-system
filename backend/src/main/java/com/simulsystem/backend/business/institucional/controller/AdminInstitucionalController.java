package com.simulsystem.backend.business.institucional.controller;

import com.simulsystem.backend.business.institucional.dto.FotoInstituicaoResponseDTO;
import com.simulsystem.backend.business.institucional.dto.InstitucionalResponseDTO;
import com.simulsystem.backend.business.institucional.dto.IntegranteRequestDTO;
import com.simulsystem.backend.business.institucional.dto.IntegranteResponseDTO;
import com.simulsystem.backend.business.institucional.dto.LegendaFotoRequestDTO;
import com.simulsystem.backend.business.institucional.dto.OrdemRequestDTO;
import com.simulsystem.backend.business.institucional.dto.TextosInstitucionaisRequestDTO;
import com.simulsystem.backend.business.institucional.service.InstitucionalService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/** Edição do "Quem somos" pelo ADMIN (/api/admin/institucional). */
@RestController
@RequestMapping("/api/admin/institucional")
@PreAuthorize("hasRole('ADMIN')")
public class AdminInstitucionalController {

    private final InstitucionalService institucionalService;

    public AdminInstitucionalController(InstitucionalService institucionalService) {
        this.institucionalService = institucionalService;
    }

    /** PUT: textos da página. */
    @PutMapping
    public ResponseEntity<InstitucionalResponseDTO> atualizarTextos(
            @Valid @RequestBody TextosInstitucionaisRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(institucionalService.atualizarTextos(requestDTO));
    }

    /** POST /fotos (multipart: arquivo + legenda): nova foto da faculdade. */
    @PostMapping(value = "/fotos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FotoInstituicaoResponseDTO> adicionarFoto(
            @RequestPart("arquivo") MultipartFile arquivo,
            @RequestParam("legenda") String legenda
    ) throws IOException {
        FotoInstituicaoResponseDTO foto = institucionalService.adicionarFoto(arquivo.getBytes(), legenda);

        return ResponseEntity.status(HttpStatus.CREATED).body(foto);
    }

    /** PUT /fotos/{id}: troca a legenda. */
    @PutMapping("/fotos/{id}")
    public ResponseEntity<FotoInstituicaoResponseDTO> atualizarLegenda(
            @PathVariable Long id,
            @Valid @RequestBody LegendaFotoRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(institucionalService.atualizarLegenda(id, requestDTO.legenda()));
    }

    /** DELETE /fotos/{id}: remove a foto. */
    @DeleteMapping("/fotos/{id}")
    public ResponseEntity<Void> removerFoto(@PathVariable Long id) {
        institucionalService.removerFoto(id);

        return ResponseEntity.noContent().build();
    }

    /** PUT /fotos/ordem: nova ordem da galeria. */
    @PutMapping("/fotos/ordem")
    public ResponseEntity<Void> reordenarFotos(@Valid @RequestBody OrdemRequestDTO requestDTO) {
        institucionalService.reordenarFotos(requestDTO.ids());

        return ResponseEntity.noContent().build();
    }

    /** POST /integrantes: novo integrante. */
    @PostMapping("/integrantes")
    public ResponseEntity<IntegranteResponseDTO> cadastrarIntegrante(
            @Valid @RequestBody IntegranteRequestDTO requestDTO
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(institucionalService.cadastrarIntegrante(requestDTO));
    }

    /** PUT /integrantes/{id}: edita nome, função, descrição e link. */
    @PutMapping("/integrantes/{id}")
    public ResponseEntity<IntegranteResponseDTO> atualizarIntegrante(
            @PathVariable Long id,
            @Valid @RequestBody IntegranteRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(institucionalService.atualizarIntegrante(id, requestDTO));
    }

    /** PUT /integrantes/{id}/foto (multipart: arquivo): troca a foto. */
    @PutMapping(value = "/integrantes/{id}/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<IntegranteResponseDTO> atualizarFotoIntegrante(
            @PathVariable Long id,
            @RequestPart("arquivo") MultipartFile arquivo
    ) throws IOException {
        return ResponseEntity.ok(institucionalService.atualizarFotoIntegrante(id, arquivo.getBytes()));
    }

    /** DELETE /integrantes/{id}/foto: tira a foto. */
    @DeleteMapping("/integrantes/{id}/foto")
    public ResponseEntity<IntegranteResponseDTO> removerFotoIntegrante(@PathVariable Long id) {
        return ResponseEntity.ok(institucionalService.removerFotoIntegrante(id));
    }

    /** DELETE /integrantes/{id}: remove o integrante. */
    @DeleteMapping("/integrantes/{id}")
    public ResponseEntity<Void> removerIntegrante(@PathVariable Long id) {
        institucionalService.removerIntegrante(id);

        return ResponseEntity.noContent().build();
    }

    /** PUT /integrantes/ordem: nova ordem da equipe. */
    @PutMapping("/integrantes/ordem")
    public ResponseEntity<Void> reordenarIntegrantes(@Valid @RequestBody OrdemRequestDTO requestDTO) {
        institucionalService.reordenarIntegrantes(requestDTO.ids());

        return ResponseEntity.noContent().build();
    }
}
