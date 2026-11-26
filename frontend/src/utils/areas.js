/**
 * Funções puras da tela de áreas atendidas do painel admin.
 */

import {
  ativosDaRota,
  DIAS_SEMANA,
  horaCurta,
  listarDias,
  temHorario,
  TURNOS,
  turnoDe,
} from './cronogramas'
import { ordenarTexto, semAcento } from './texto'

/** Busca por bairro ou cidade, sem diferenciar acentos e maiúsculas. */
export function filtrarAreas(areas, { busca, rotaId, mapa }) {
  const termo = semAcento(busca.trim())

  return areas
    .filter(
      (area) =>
        !termo || semAcento(area.bairro).includes(termo) || semAcento(area.cidade).includes(termo),
    )
    .filter((area) => !rotaId || area.rotaId === Number(rotaId))
    .filter((area) => {
      if (mapa === 'sem') return !area.possuiGeometria
      if (mapa === 'com') return area.possuiGeometria
      return true
    })
    .sort((a, b) => ordenarTexto(a.bairro ?? '', b.bairro ?? ''))
}

/** Mesma cidade e bairro de outra área (o banco também impede). */
export function encontrarDuplicada(areas, { id, cidade, bairro }) {
  return areas.find(
    (area) =>
      area.id !== id &&
      semAcento(area.cidade?.trim()) === semAcento(cidade) &&
      semAcento(area.bairro?.trim()) === semAcento(bairro),
  )
}

/** Aceita só Polygon ou MultiPolygon com coordenadas. */
export function validarGeometria(geometria) {
  if (!geometria || typeof geometria !== 'object') return null
  if (geometria.type !== 'Polygon' && geometria.type !== 'MultiPolygon') return null
  if (!Array.isArray(geometria.coordinates) || geometria.coordinates.length === 0) return null
  return geometria
}

/** Lê o GeoJSON salvo; devolve null se não for um polígono válido. */
export function converterGeoJson(texto) {
  if (!texto) return null

  try {
    return validarGeometria(JSON.parse(texto))
  } catch {
    return null
  }
}

/**
 * Resumo da coleta da rota por turno, para mostrar ao lado dela:
 * "Coleta: diurna seg, qua e sex · noturna ter (19:00–23:00)".
 * Sem horário informado, aparece só o turno.
 */
export function resumirColetaDaRota(cronogramas, rotaId) {
  const ativos = ativosDaRota(cronogramas, rotaId)

  if (ativos.length === 0) {
    return 'Rota sem dia de coleta cadastrado.'
  }

  const partes = TURNOS.map((turno) => {
    const doTurno = ativos.filter((item) => turnoDe(item) === turno.valor)

    if (doTurno.length === 0) return null

    const dias = listarDias(
      DIAS_SEMANA.filter((dia) => doTurno.some((item) => item.diaSemana === dia.valor)).map(
        (dia) => dia.valor,
      ),
      'curto',
    )
    const faixas = [
      ...new Set(
        doTurno
          .filter(temHorario)
          .map((item) => `${horaCurta(item.horarioInicio)}–${horaCurta(item.horarioFim)}`),
      ),
    ]
    const nome = turno.valor === 'NAO_INFORMADO' ? 'turno não informado' : turno.adjetivo

    return `${nome} ${dias}${faixas.length ? ` (${faixas.join(' / ')})` : ''}`
  }).filter(Boolean)

  return `Coleta: ${partes.join(' · ')}`
}

/**
 * "Senador Canedo - Diurna (seg, qua e sex)" vira "Diurna (seg, qua e sex)"
 * quando a cidade já aparece na tela. Só encurta a exibição.
 */
export function nomeRotaCurto(nome, cidade) {
  const prefixo = `${cidade ?? ''} - `

  return nome && cidade && nome.startsWith(prefixo) ? nome.slice(prefixo.length) : nome
}
