/**
 * Funções de apresentação da coleta (somente front-end).
 * Os dados vêm de GET /api/rotas/consulta; aqui só calculamos e
 * formatamos para exibir. Não há regra de negócio do servidor aqui.
 */

export const DIAS_SEMANA = [
  {
    chave: 'SEGUNDA',
    curto: 'Seg',
    longo: 'Segunda-feira',
    js: 1,
  },
  {
    chave: 'TERCA',
    curto: 'Ter',
    longo: 'Terça-feira',
    js: 2,
  },
  {
    chave: 'QUARTA',
    curto: 'Qua',
    longo: 'Quarta-feira',
    js: 3,
  },
  {
    chave: 'QUINTA',
    curto: 'Qui',
    longo: 'Quinta-feira',
    js: 4,
  },
  {
    chave: 'SEXTA',
    curto: 'Sex',
    longo: 'Sexta-feira',
    js: 5,
  },
  {
    chave: 'SABADO',
    curto: 'Sáb',
    longo: 'Sábado',
    js: 6,
  },
  {
    chave: 'DOMINGO',
    curto: 'Dom',
    longo: 'Domingo',
    js: 0,
  },
]

const POR_CHAVE = Object.fromEntries(DIAS_SEMANA.map((dia) => [dia.chave, dia]))

/** Dados do dia da semana pela chave da API (SEGUNDA, TERCA…). */
function obterDia(chave) {
  return POR_CHAVE[chave] || null
}

/** Nome do dia por extenso. */
export function rotuloDia(chave) {
  return obterDia(chave)?.longo || chave
}

/** "07:00:00" → "07:00" */
export function formatarHora(hora) {
  return hora ? String(hora).slice(0, 5) : ''
}

/**
 * Turnos de coleta. Muitas prefeituras informam só o turno, sem horário.
 * "referencia" e "fimReferencia" NÃO são mostrados como horário da coleta:
 * servem só para ordenar e calcular a próxima coleta e o lembrete (o
 * back-end usa o mesmo começo de referência para mandar o aviso).
 */
export const TURNOS = {
  DIURNO: { rotulo: 'Diurno', adjetivo: 'diurna', referencia: '06:00', fimReferencia: '18:00' },
  NOTURNO: { rotulo: 'Noturno', adjetivo: 'noturna', referencia: '18:00', fimReferencia: '23:59' },
  NAO_INFORMADO: {
    rotulo: 'Turno não informado',
    adjetivo: 'sem turno informado',
    referencia: '06:00',
    fimReferencia: '23:59',
  },
}

/** A coleta tem horário informado? (falso quando a fonte diz só o turno) */
export function temHorario(cronograma) {
  return Boolean(cronograma?.horarioInicio && cronograma?.horarioFim)
}

/** Turno da coleta; registros antigos sem turno: deduzido do horário. */
export function turnoDaColeta(cronograma) {
  if (cronograma?.turno) {
    return cronograma.turno
  }

  const hora = Number(formatarHora(cronograma?.horarioInicio).slice(0, 2))

  return hora >= 18 || hora < 6 ? 'NOTURNO' : 'DIURNO'
}

/**
 * "07:00 – 12:00" ou "Turno noturno (horário não informado)".
 * Com curto = true, sem o parêntese (quando a tela já explica ao lado).
 */
export function descreverHorario(cronograma, curto = false) {
  if (temHorario(cronograma)) {
    return `${formatarHora(cronograma.horarioInicio)} – ${formatarHora(cronograma.horarioFim)}`
  }

  const turno = turnoDaColeta(cronograma)

  if (turno === 'NAO_INFORMADO') {
    return curto ? 'Turno não informado' : 'Turno e horário não informados'
  }

  const nome = `Turno ${TURNOS[turno].rotulo.toLowerCase()}`

  return curto ? nome : `${nome} (horário não informado)`
}

/** Início usado nos cálculos: o horário informado ou a referência do turno. */
function inicioParaCalculo(cronograma) {
  return temHorario(cronograma)
    ? cronograma.horarioInicio
    : TURNOS[turnoDaColeta(cronograma)].referencia
}

/** Fim usado nos cálculos: o horário informado ou o fim de referência do turno. */
function fimParaCalculo(cronograma) {
  return temHorario(cronograma)
    ? cronograma.horarioFim
    : TURNOS[turnoDaColeta(cronograma)].fimReferencia
}

/** Junta uma data e um horário "HH:MM:SS" num Date. */
function combinar(data, hora) {
  const [h, m] = formatarHora(hora).split(':').map(Number)

  const resultado = new Date(data)

  resultado.setHours(h || 0, m || 0, 0, 0)

  return resultado
}

/** As duas datas caem no mesmo dia? */
function mesmoDia(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** Cronogramas na ordem da semana (segunda → domingo). */
export function ordenarCronogramas(cronogramas = []) {
  const ordem = DIAS_SEMANA.map((d) => d.chave)

  return [...cronogramas].sort(
    (a, b) =>
      ordem.indexOf(a.diaSemana) - ordem.indexOf(b.diaSemana) ||
      formatarHora(inicioParaCalculo(a)).localeCompare(formatarHora(inicioParaCalculo(b))),
  )
}

/**
 * Próxima ocorrência da coleta a partir de "agora".
 * Uma coleta em andamento (início <= agora < fim) conta como a próxima.
 * Horário de fim menor que o de início significa que termina no dia seguinte.
 * Coleta só com turno usa a janela de referência do turno (semHorario: true).
 */
export function calcularProximaColeta(cronogramas = [], agora) {
  let melhor = null

  for (const cronograma of cronogramas) {
    const dia = obterDia(cronograma.diaSemana)

    if (!dia) {
      continue
    }

    // Começa em -1 para pegar uma coleta de ontem que termina depois da meia-noite.
    for (let k = -1; k <= 7; k += 1) {
      const data = new Date(agora)

      data.setDate(agora.getDate() + k)

      if (data.getDay() !== dia.js) {
        continue
      }

      const inicio = combinar(data, inicioParaCalculo(cronograma))
      let fim = combinar(data, fimParaCalculo(cronograma))

      if (fim <= inicio) {
        fim = new Date(fim.getTime() + 24 * 60 * 60 * 1000)
      }

      if (fim <= agora) {
        continue
      }

      if (!melhor || inicio < melhor.inicio) {
        melhor = {
          cronograma,
          inicio,
          fim,
        }
      }

      break
    }
  }

  if (!melhor) {
    return null
  }

  const amanha = new Date(agora)

  amanha.setDate(agora.getDate() + 1)

  const emAndamento = melhor.inicio <= agora

  const hoje = mesmoDia(melhor.inicio, agora)

  const inicioDoDia = new Date(agora)

  inicioDoDia.setHours(0, 0, 0, 0)

  const diasAte = Math.round(
    (new Date(melhor.inicio).setHours(0, 0, 0, 0) - inicioDoDia.getTime()) / (24 * 60 * 60 * 1000),
  )

  return {
    ...melhor,
    semHorario: !temHorario(melhor.cronograma),
    turno: turnoDaColeta(melhor.cronograma),
    emAndamento,
    hoje,
    amanha: mesmoDia(melhor.inicio, amanha),
    diasAte,
  }
}

/** "quarta-feira, 25/11" */
export function formatarData(data) {
  const diaSemana = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
  }).format(data)

  const diaMes = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(data)

  return `${diaSemana}, ${diaMes}`
}

/** Frase curta sobre quando é a próxima coleta. */
export function descreverQuando(proxima) {
  if (!proxima) {
    return ''
  }

  // Sem horário informado não dá para dizer que o caminhão está passando agora.
  if (proxima.emAndamento && !proxima.semHorario) {
    return 'Acontecendo agora'
  }

  if (proxima.hoje || proxima.emAndamento) {
    return 'Hoje'
  }

  if (proxima.amanha) {
    return 'Amanhã'
  }

  return `Em ${proxima.diasAte} dias`
}

/** 0 → "no horário da coleta"; 1 → "1 hora antes"; 3 → "3 horas antes". */
export function descreverAntecedencia(horas) {
  if (horas === 0) {
    return 'no horário da coleta'
  }

  return horas === 1 ? '1 hora antes' : `${horas} horas antes`
}
