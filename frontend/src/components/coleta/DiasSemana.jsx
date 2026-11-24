import { DIAS_SEMANA } from '../../utils/coleta'

/**
 * DiasSemana do Design System: os 7 dias, com destaque nos dias de coleta
 * e contorno no dia de hoje. O estado de cada dia também vai em texto
 * para leitores de tela.
 */
function DiasSemana({ cronogramas = [], hoje }) {
  const diasComColeta = new Set(cronogramas.map((c) => c.diaSemana))

  const diaHoje = hoje.getDay()

  return (
    <div>
      <ul className="dias-semana" aria-label="Dias da semana com coleta seletiva">
        {DIAS_SEMANA.map((dia) => {
          const temColeta = diasComColeta.has(dia.chave)

          const ehHoje = dia.js === diaHoje

          const classes = [
            'dia-pilula',
            temColeta && 'dia-pilula--coleta',
            ehHoje && 'dia-pilula--hoje',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <li key={dia.chave} className={classes}>
              <span aria-hidden="true">{dia.curto}</span>

              <span className="visualmente-oculto">
                {dia.longo}
                {ehHoje ? ', hoje' : ''}
                {temColeta ? ', com coleta' : ', sem coleta'}
              </span>
            </li>
          )
        })}
      </ul>

      <p className="dias-semana__legenda">Em verde, os dias com coleta. O contorno marca hoje.</p>
    </div>
  )
}

export default DiasSemana
