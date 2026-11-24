/**
 * Funções puras da tela de áreas atendidas do painel admin.
 */

import {
  DIAS_SEMANA,
  horaCurta,
} from './cronogramas'

export function ordenarTexto(a, b) {
  return a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })
}

/** Tira espaços das pontas e junta espaços repetidos. */
export function normalizarTexto(valor) {
  return valor.trim().replace(/\s+/g, ' ')
}

function semAcento(valor) {
  return (valor ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLocaleLowerCase('pt-BR')
}

/** Busca por bairro ou cidade, sem diferenciar acentos e maiúsculas. */
export function filtrarAreas(areas, { busca, rotaId, mapa }) {
  const termo = semAcento(busca.trim())

  return areas
    .filter((area) =>
      !termo
      || semAcento(area.bairro).includes(termo)
      || semAcento(area.cidade).includes(termo),
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
  return areas.find((area) =>
    area.id !== id
    && semAcento(area.cidade?.trim()) === semAcento(cidade)
    && semAcento(area.bairro?.trim()) === semAcento(bairro),
  )
}

/** Aceita só Polygon ou MultiPolygon com coordenadas. */
export function validarGeometria(geometria) {
  if (!geometria || typeof geometria !== 'object') return null
  if (geometria.type !== 'Polygon' && geometria.type !== 'MultiPolygon') return null
  if (!Array.isArray(geometria.coordinates) || geometria.coordinates.length === 0) return null
  return geometria
}

export function converterGeoJson(texto) {
  if (!texto) return null

  try {
    return validarGeometria(JSON.parse(texto))
  } catch {
    return null
  }
}

/** "seg, qua e sex · 06:00–18:00" para mostrar ao lado da rota. */
export function resumirColetaDaRota(cronogramas, rotaId) {
  const ativos = cronogramas.filter((item) => item.ativo && item.rotaId === rotaId)

  if (ativos.length === 0) {
    return 'Rota sem horário de coleta cadastrado.'
  }

  const dias = DIAS_SEMANA
    .filter((dia) => ativos.some((item) => item.diaSemana === dia.valor))
    .map((dia) => dia.curto.toLowerCase())

  const faixas = [...new Set(ativos.map((item) =>
    `${horaCurta(item.horarioInicio)}–${horaCurta(item.horarioFim)}`,
  ))]

  const textoDias = dias.length > 1
    ? `${dias.slice(0, -1).join(', ')} e ${dias.at(-1)}`
    : dias[0]

  return `Coleta: ${textoDias} · ${faixas.join(' / ')}`
}

/**
 * "Senador Canedo - Diurna (seg, qua e sex)" vira "Diurna (seg, qua e sex)"
 * quando a cidade já aparece na tela. Só encurta a exibição.
 */
export function nomeRotaCurto(nome, cidade) {
  const prefixo = `${cidade ?? ''} - `

  return nome && cidade && nome.startsWith(prefixo)
    ? nome.slice(prefixo.length)
    : nome
}
