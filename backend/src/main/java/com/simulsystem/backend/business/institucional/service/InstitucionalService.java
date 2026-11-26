package com.simulsystem.backend.business.institucional.service;

import com.simulsystem.backend.business.institucional.dto.FotoInstituicaoResponseDTO;
import com.simulsystem.backend.business.institucional.dto.ImagemArquivoDTO;
import com.simulsystem.backend.business.institucional.dto.InstitucionalResponseDTO;
import com.simulsystem.backend.business.institucional.dto.IntegranteRequestDTO;
import com.simulsystem.backend.business.institucional.dto.IntegranteResponseDTO;
import com.simulsystem.backend.business.institucional.dto.TextosInstitucionaisRequestDTO;

import java.util.List;

/** Conteúdo da página "Quem somos": textos, fotos da faculdade e equipe. */
public interface InstitucionalService {

    /** Página completa, para o público e para o painel. */
    InstitucionalResponseDTO buscar();

    /** Bytes de uma imagem (404 se não existir). */
    ImagemArquivoDTO buscarImagem(Long id);

    /** Atualiza os textos da página. */
    InstitucionalResponseDTO atualizarTextos(TextosInstitucionaisRequestDTO requestDTO);

    /** Adiciona uma foto da faculdade ao fim da galeria. */
    FotoInstituicaoResponseDTO adicionarFoto(byte[] arquivo, String legenda);

    /** Troca a legenda de uma foto. */
    FotoInstituicaoResponseDTO atualizarLegenda(Long fotoId, String legenda);

    /** Remove a foto e a imagem dela. */
    void removerFoto(Long fotoId);

    /** Reordena a galeria. */
    void reordenarFotos(List<Long> ids);

    /** Cadastra um integrante no fim da lista. */
    IntegranteResponseDTO cadastrarIntegrante(IntegranteRequestDTO requestDTO);

    /** Edita os dados de um integrante. */
    IntegranteResponseDTO atualizarIntegrante(Long id, IntegranteRequestDTO requestDTO);

    /** Troca a foto do integrante (a anterior é apagada). */
    IntegranteResponseDTO atualizarFotoIntegrante(Long id, byte[] arquivo);

    /** Tira a foto do integrante. */
    IntegranteResponseDTO removerFotoIntegrante(Long id);

    /** Remove o integrante e a foto dele. */
    void removerIntegrante(Long id);

    /** Reordena a equipe. */
    void reordenarIntegrantes(List<Long> ids);
}
