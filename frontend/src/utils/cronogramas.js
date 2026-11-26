/**
 * Funções puras sobre dias e horários de coleta, usadas nas telas de
 * Rotas e Agenda do painel admin. Não fazem chamadas à API.
 */

export const DIAS_SEMANA = [
  { valor: 'SEGUNDA', curto: 'Seg', longo: 'segunda-feira' },
  { valor: 'TERCA', curto: 'Ter', longo: 'terça-feira' },
  { valor: 'QUARTA', curto: 'Qua', longo: 'quarta-feira' },
  { valor: 'QUINTA', curto: 'Qui', longo: 'quinta-feira' },
  { valor: 'SEXTA', curto: 'Sex', longo: 'sexta-feira' },
  { valor: 'SABADO', curto: 'Sáb', longo: 'sábado' },
  { valor: 'DOMINGO', curto: 'Dom', longo: 'domingo' },
]

export const ATALHOS_DIAS = [
  { rotulo: 'Seg, qua e sex', dias: ['SEGUNDA', 'QUARTA', 'SEXTA'] },
  { rotulo: 'Ter, qui e sáb', dias: ['TERCA', 'QUINTA', 'SABADO'] },
  {
    rotulo: 'Seg a sáb',
    dias: ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO'],
  },
]

export const ATALHOS_HORARIO = [
  { rotulo: 'Diurno', inicio: '06:00', fim: '18:00' },
  { rotulo: 'Noturno', inicio: '18:00', fim: '23:59' },
]

/** "06:00:00" → "06:00" */
export function horaCurta(horario) {
  return typeof horario === 'string' ? horario.slice(0, 5) : ''
}

/** "06:00" → "06:00:00", formato que o back-end já recebe hoje. */
export function horaParaApi(horario) {
  return horario.length === 5 ? `${horario}:00` : horario
}

/** Coleta que começa das 18h às 5h59 é tratada como noturna. */
export function ehNoturno(horarioInicio) {
  const hora = Number(horaCurta(horarioInicio).slice(0, 2))
  return hora >= 18 || hora < 6
}

/** Fim antes do início: a coleta termina no dia seguinte. */
export function viraODia(inicio, fim) {
  return Boolean(inicio && fim) && fim < inicio
}

/** Nome do dia (curto ou longo) pela chave da API. */
export function nomeDia(valor, formato = 'longo') {
  return DIAS_SEMANA.find((dia) => dia.valor === valor)?.[formato] ?? valor
}

/** ['SEGUNDA', 'QUARTA'] → "segunda-feira e quarta-feira" (ou "seg e qua" no formato curto) */
export function listarDias(dias, formato = 'longo') {
  const nomes = DIAS_SEMANA.filter((dia) => dias.includes(dia.valor)).map((dia) =>
    formato === 'curto' ? dia.curto.toLowerCase() : dia.longo,
  )

  if (nomes.length <= 1) {
    return nomes.join('')
  }

  return `${nomes.slice(0, -1).join(', ')} e ${nomes.at(-1)}`
}

/** Horários ativos da rota, em ordem de segunda a domingo. */
export function ativosDaRota(cronogramas, rotaId) {
  const ordem = DIAS_SEMANA.map((dia) => dia.valor)

  return cronogramas
    .filter((item) => item.ativo && item.rotaId === rotaId)
    .sort((a, b) => ordem.indexOf(a.diaSemana) - ordem.indexOf(b.diaSemana))
}

/**
 * Semana atual da rota no formato do editor:
 * { SEGUNDA: { inicio: '06:00', fim: '18:00' }, ... }
 */
export function semanaDaRota(cronogramas, rotaId) {
  return Object.fromEntries(
    ativosDaRota(cronogramas, rotaId).map((item) => [
      item.diaSemana,
      { inicio: horaCurta(item.horarioInicio), fim: horaCurta(item.horarioFim) },
    ]),
  )
}

/** Faixas de horário diferentes usadas na semana ("06:00–18:00"). */
export function faixasDaSemana(semana) {
  return [...new Set(Object.values(semana).map((dia) => `${dia.inicio}–${dia.fim}`))]
}
