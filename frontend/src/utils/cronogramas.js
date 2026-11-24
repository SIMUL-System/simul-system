/**
 * Funções puras da tela de cronogramas do painel admin.
 * Não fazem chamadas à API: recebem as listas já carregadas.
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

export function nomeDia(valor, formato = 'longo') {
  return DIAS_SEMANA.find((dia) => dia.valor === valor)?.[formato] ?? valor
}

/** ['SEGUNDA', 'QUARTA'] → "segunda-feira e quarta-feira" */
export function listarDias(dias) {
  const nomes = DIAS_SEMANA
    .filter((dia) => dias.includes(dia.valor))
    .map((dia) => dia.longo)

  if (nomes.length <= 1) {
    return nomes.join('')
  }

  return `${nomes.slice(0, -1).join(', ')} e ${nomes.at(-1)}`
}

function maisRecente(lista) {
  return [...lista].sort((a, b) =>
    String(b.dataAtualizacao ?? '').localeCompare(
      String(a.dataAtualizacao ?? ''),
    ),
  )[0]
}

/**
 * Monta as linhas da grade: uma por rota, com uma célula por dia.
 * Em cada célula vale o cronograma ativo; sem ativo, e com
 * "mostrar inativos" ligado, aparece o inativo mais recente.
 */
export function montarGrade(rotas, cronogramas, mostrarInativos) {
  return rotas
    .filter((rota) => mostrarInativos || rota.ativo)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    .map((rota) => {
      const daRota = cronogramas.filter((item) => item.rotaId === rota.id)
      const ativos = daRota.filter((item) => item.ativo)

      const celulas = DIAS_SEMANA.map((dia) => {
        const doDia = daRota.filter((item) => item.diaSemana === dia.valor)
        const ativo = doDia.find((item) => item.ativo) ?? null
        const inativo = mostrarInativos && !ativo
          ? maisRecente(doDia.filter((item) => !item.ativo)) ?? null
          : null

        return { dia, cronograma: ativo ?? inativo }
      })

      return {
        rota,
        celulas,
        ativos,
        noturna: ativos.some((item) => ehNoturno(item.horarioInicio)),
      }
    })
}

/** Dias em que a rota já tem cronograma ativo (não podem ser criados de novo). */
export function diasOcupados(cronogramas, rotaId) {
  return cronogramas
    .filter((item) => item.ativo && item.rotaId === rotaId)
    .map((item) => item.diaSemana)
}
