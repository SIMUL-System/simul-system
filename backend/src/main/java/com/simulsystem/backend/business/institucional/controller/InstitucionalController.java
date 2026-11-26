package com.simulsystem.backend.business.institucional.controller;

import com.simulsystem.backend.business.institucional.dto.ImagemArquivoDTO;
import com.simulsystem.backend.business.institucional.dto.InstitucionalResponseDTO;
import com.simulsystem.backend.business.institucional.service.InstitucionalService;

import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

/** Página pública "Quem somos" (/api/institucional), sem login. */
@RestController
@RequestMapping("/api/institucional")
public class InstitucionalController {

    private final InstitucionalService institucionalService;

    public InstitucionalController(InstitucionalService institucionalService) {
        this.institucionalService = institucionalService;
    }

    /** GET: textos, fotos da faculdade e equipe. */
    @GetMapping
    public ResponseEntity<InstitucionalResponseDTO> buscar() {
        return ResponseEntity.ok(institucionalService.buscar());
    }

    /**
     * GET /imagens/{id}: o arquivo da imagem. Uma imagem nunca muda (trocar a
     * foto cria outra), então o navegador pode guardá-la em cache por 30 dias.
     */
    @GetMapping("/imagens/{id}")
    public ResponseEntity<byte[]> buscarImagem(@PathVariable Long id) {
        ImagemArquivoDTO imagem = institucionalService.buscarImagem(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(imagem.tipoConteudo()))
                .cacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic().immutable())
                .header("X-Content-Type-Options", "nosniff")
                .body(imagem.dados());
    }
}
