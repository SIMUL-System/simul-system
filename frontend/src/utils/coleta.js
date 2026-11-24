/**
 * Funções de apresentação da coleta seletiva (somente front-end).
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

const POR_CHAVE = Object.fromEntries(
  DIAS_SEMANA.map((dia) => [
    dia.chave,
    dia,
  ]),
)

export function obterDia(chave) {
  return POR_CHAVE[chave] || null
}

export function rotuloDia(chave) {
  return obterDia(chave)?.longo || chave
}

/** "07:00:00" → "07:00" */
export function formatarHora(hora) {
  return hora ? String(hora).slice(0, 5) : ''
}

function combinar(data, hora) {
  const [h, m] = formatarHora(hora)
    .split(':')
    .map(Number)

  const resultado = new Date(data)

  resultado.setHours(h || 0, m || 0, 0, 0)

  return resultado
}

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
      ordem.indexOf(a.diaSemana) -
        ordem.indexOf(b.diaSemana) ||
      formatarHora(a.horarioInicio).localeCompare(
        formatarHora(b.horarioInicio),
      ),
  )
}

/**
 * Próxima ocorrência da coleta a partir de "agora".
 * Uma coleta em andamento (início <= agora < fim) conta como a próxima.
 * Horário de fim menor que o de início significa que termina no dia seguinte.
 */
export function calcularProximaColeta(
  cronogramas = [],
  agora,
) {
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

      const inicio = combinar(data, cronograma.horarioInicio)
      let fim = combinar(data, cronograma.horarioFim)

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
    (new Date(melhor.inicio).setHours(0, 0, 0, 0) -
      inicioDoDia.getTime()) /
      (24 * 60 * 60 * 1000),
  )

  return {
    ...melhor,
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

  if (proxima.emAndamento) {
    return 'Acontecendo agora'
  }

  if (proxima.hoje) {
    return 'Hoje'
  }

  if (proxima.amanha) {
    return 'Amanhã'
  }

  return `Em ${proxima.diasAte} dias`
}
