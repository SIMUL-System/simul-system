package com.simulsystem.backend.business.cidade.dto;

/**
 * Cidade com os números do painel admin. Os contadores de pendência ajudam
 * a ver o que falta conferir em cada cidade.
 *
 * @param rotas                 rotas da cidade (ativas e inativas)
 * @param rotasAtivas           rotas ativas
 * @param bairros               bairros cadastrados
 * @param bairrosSemContorno    bairros sem contorno no mapa
 * @param coletasAtivas         coletas ativas (dia + turno) das rotas
 * @param coletasSemHorario     coletas ativas com só o turno (sem horário informado)
 * @param rotasSemColeta        rotas ativas sem nenhum dia de coleta
 * @param rotasSemBairro        rotas ativas sem bairros
 * @param rotasTipoNaoInformado rotas ativas cuja fonte não diz se a coleta é a seletiva
 * @param rotasConvencionais    rotas ativas de coleta convencional
 * @param turnos                faixa média dos turnos na cidade
 */
public record CidadeResponseDTO(
        Long id,
        String nome,
        String uf,
        String fonte,
        long rotas,
        long rotasAtivas,
        long bairros,
        long bairrosSemContorno,
        long coletasAtivas,
        long coletasSemHorario,
        long rotasSemColeta,
        long rotasSemBairro,
        long rotasTipoNaoInformado,
        long rotasConvencionais,
        FaixaTurnosDTO turnos
) {
}
