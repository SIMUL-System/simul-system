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
  {
    rotulo: 'Todos os dias',
    dias: ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO'],
  },
]

/**
 * Turnos da coleta. As prefeituras costumam informar só o turno; o
 * horário é opcional e nunca é preenchido por conta própria.
 */
export const TURNOS = [
  { valor: 'DIURNO', rotulo: 'Diurno', adjetivo: 'diurna', icone: 'sol' },
  { valor: 'NOTURNO', rotulo: 'Noturno', adjetivo: 'noturna', icone: 'lua' },
  {
    valor: 'NAO_INFORMADO',
    rotulo: 'Turno não informado',
    adjetivo: 'sem turno',
    icone: 'relogio',
  },
]

/** Dados do turno pela chave da API. */
export function dadosTurno(valor) {
  return TURNOS.find((turno) => turno.valor === valor) ?? TURNOS[2]
}

/** "06:00:00" → "06:00" */
export function horaCurta(horario) {
  return typeof horario === 'string' ? horario.slice(0, 5) : ''
}

/** "06:00" → "06:00:00", formato que o back-end já recebe hoje (vazio → null). */
export function horaParaApi(horario) {
  if (!horario) return null
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

/** Turno do registro; registros antigos sem turno: deduzido do horário. */
export function turnoDe(item) {
  if (item?.turno) return item.turno
  return ehNoturno(item?.horarioInicio) ? 'NOTURNO' : 'DIURNO'
}

/** O registro tem horário informado? */
export function temHorario(item) {
  return Boolean(item?.horarioInicio && item?.horarioFim)
}

/** "06:00–12:00" ou, sem horário, o turno ("Noturno"). */
export function rotuloHorario(item) {
  return temHorario(item)
    ? `${horaCurta(item.horarioInicio)}–${horaCurta(item.horarioFim)}`
    : dadosTurno(turnoDe(item)).rotulo
}

const ORDEM_DIAS = DIAS_SEMANA.map((dia) => dia.valor)
const ORDEM_TURNOS = TURNOS.map((turno) => turno.valor)

/** Ordem da semana: dia e, no mesmo dia, diurno antes de noturno. */
export function compararColetas(a, b) {
  return (
    ORDEM_DIAS.indexOf(a.diaSemana) - ORDEM_DIAS.indexOf(b.diaSemana) ||
    ORDEM_TURNOS.indexOf(turnoDe(a)) - ORDEM_TURNOS.indexOf(turnoDe(b)) ||
    horaCurta(a.horarioInicio).localeCompare(horaCurta(b.horarioInicio))
  )
}

/** Coletas ativas da rota, de segunda a domingo. */
export function ativosDaRota(cronogramas, rotaId) {
  return cronogramas.filter((item) => item.ativo && item.rotaId === rotaId).sort(compararColetas)
}

/** Turnos usados pela rota, na ordem diurno, noturno, não informado. */
export function turnosDaRota(cronogramas, rotaId) {
  const usados = new Set(ativosDaRota(cronogramas, rotaId).map(turnoDe))
  return ORDEM_TURNOS.filter((turno) => usados.has(turno))
}

/** Semana vazia do editor: um bloco por turno. */
export function semanaVazia() {
  return Object.fromEntries(
    TURNOS.map((turno) => [turno.valor, { dias: [], informado: false, inicio: '', fim: '' }]),
  )
}

/**
 * Semana atual da rota no formato do editor, um bloco por turno:
 * { DIURNO: { dias: ['SEGUNDA'], informado: false, inicio: '', fim: '' }, NOTURNO: {...}, ... }
 * "informado" diz se a prefeitura informa o horário daquele turno.
 * "horariosDiferentes" lista os turnos em que os dias tinham horários
 * diferentes entre si (o editor usa um horário por turno).
 */
export function semanaDaRota(cronogramas, rotaId) {
  const semana = semanaVazia()
  const horariosDiferentes = []

  ativosDaRota(cronogramas, rotaId).forEach((item) => {
    const bloco = semana[turnoDe(item)]
    const inicio = horaCurta(item.horarioInicio)
    const fim = horaCurta(item.horarioFim)

    if (bloco.dias.length === 0) {
      bloco.inicio = inicio
      bloco.fim = fim
      bloco.informado = Boolean(inicio && fim)
    } else if (bloco.inicio !== inicio || bloco.fim !== fim) {
      if (!horariosDiferentes.includes(turnoDe(item))) horariosDiferentes.push(turnoDe(item))
    }

    if (!bloco.dias.includes(item.diaSemana)) bloco.dias.push(item.diaSemana)
  })

  return { semana, horariosDiferentes }
}

/** Semana do editor → lista para PUT /api/admin/cronogramas/rota/{id}. */
export function semanaParaApi(semana) {
  return TURNOS.flatMap((turno) => {
    const bloco = semana[turno.valor]

    return ORDEM_DIAS.filter((dia) => bloco.dias.includes(dia)).map((diaSemana) => ({
      diaSemana,
      turno: turno.valor,
      horarioInicio: bloco.informado ? horaParaApi(bloco.inicio) : null,
      horarioFim: bloco.informado ? horaParaApi(bloco.fim) : null,
    }))
  })
}

/** Duas semanas do editor são iguais? */
export function mesmaSemana(a, b) {
  return TURNOS.every(({ valor }) => {
    const x = a[valor]
    const y = b[valor]

    return (
      [...x.dias].sort().join() === [...y.dias].sort().join() &&
      (x.dias.length === 0 ||
        (x.informado === y.informado &&
          (!x.informado || (x.inicio === y.inicio && x.fim === y.fim))))
    )
  })
}

/** "coleta diurna seg, qua e sex · noturna ter (19:00–23:00)" */
export function resumirSemana(semana) {
  return TURNOS.filter(({ valor }) => semana[valor].dias.length > 0)
    .map(({ valor, adjetivo }) => {
      const bloco = semana[valor]
      const horario =
        bloco.informado && bloco.inicio && bloco.fim ? ` (${bloco.inicio}–${bloco.fim})` : ''
      return `${valor === 'NAO_INFORMADO' ? 'turno não informado' : adjetivo} ${listarDias(bloco.dias, 'curto')}${horario}`
    })
    .join(' · ')
}

/** Valida a semana do editor; devolve a mensagem de erro ou ''. */
export function erroDaSemana(semana) {
  const blocos = TURNOS.map((turno) => semana[turno.valor]).filter((bloco) => bloco.dias.length > 0)

  if (blocos.length === 0) {
    return 'Marque pelo menos um dia de coleta.'
  }

  if (blocos.some((bloco) => bloco.informado && (!bloco.inicio || !bloco.fim))) {
    return 'Preencha o início e o fim do horário, ou desmarque "A prefeitura informa o horário".'
  }

  if (blocos.some((bloco) => bloco.informado && bloco.inicio === bloco.fim)) {
    return 'O início e o fim do horário não podem ser iguais.'
  }

  return ''
}
