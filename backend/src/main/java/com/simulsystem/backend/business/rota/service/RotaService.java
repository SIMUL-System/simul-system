package com.simulsystem.backend.business.rota.service;

import com.simulsystem.backend.business.rota.dto.AreaAtendidaRequestDTO;
import com.simulsystem.backend.business.rota.dto.AreaAtendidaResponseDTO;
import com.simulsystem.backend.business.rota.dto.AreaDisponivelResponseDTO;
import com.simulsystem.backend.business.rota.dto.AreaGeometriaRequestDTO;
import com.simulsystem.backend.business.rota.dto.AreaGeometriaResponseDTO;
import com.simulsystem.backend.business.rota.dto.BairrosRotaRequestDTO;
import com.simulsystem.backend.business.rota.dto.BairrosRotaResponseDTO;
import com.simulsystem.backend.business.rota.dto.ConsultaColetaResponseDTO;
import com.simulsystem.backend.business.rota.dto.RotaRequestDTO;
import com.simulsystem.backend.business.rota.dto.RotaResponseDTO;

import java.util.List;

/** Regras de rotas e áreas atendidas, do admin e da consulta pública. */
public interface RotaService {

    /** Cria uma rota (ativa). */
    RotaResponseDTO cadastrarRota(RotaRequestDTO requestDTO);

    /** Liga um bairro a uma rota; o bairro fica na cidade da rota (bairro único por cidade). */
    AreaAtendidaResponseDTO cadastrarAreaAtendida(AreaAtendidaRequestDTO requestDTO);

    /** Áreas para o admin: todas ou só as da cidade (cidadeId opcional). */
    List<AreaAtendidaResponseDTO> listarAreasAtendidas(Long cidadeId);

    /** Edita bairro e rota de uma área (só rotas da mesma cidade). */
    AreaAtendidaResponseDTO atualizarAreaAtendida(Long id, AreaAtendidaRequestDTO requestDTO);

    /** Valida e salva o contorno GeoJSON da área. */
    AreaGeometriaResponseDTO atualizarGeometriaArea(Long id, AreaGeometriaRequestDTO requestDTO);

    /** Cidades e bairros de rotas ativas, para a consulta pública. */
    List<AreaDisponivelResponseDTO> listarAreasDisponiveis();

    /** Rota, contorno e horários ativos do bairro (404 se não houver rota ativa). */
    ConsultaColetaResponseDTO consultarPorCidadeEBairro(String cidade, String bairro);

    /** Rotas para o admin: todas ou só as da cidade (cidadeId opcional). */
    List<RotaResponseDTO> listarRotas(Long cidadeId);

    /** Edita nome e descrição. */
    RotaResponseDTO atualizarRota(Long id, RotaRequestDTO requestDTO);

    /** Ativa ou desativa a rota. */
    RotaResponseDTO alterarStatus(Long id, boolean ativo);

    /**
     * Coloca vários bairros da cidade da rota na rota, numa única transação:
     * cadastra os novos e move para esta rota os que estavam em outra.
     */
    BairrosRotaResponseDTO adicionarBairrosNaRota(Long rotaId, BairrosRotaRequestDTO requestDTO);
}
