import {
  DIAS_SEMANA,
  ehNoturno,
  horaCurta,
} from '../../../utils/cronogramas'

/**
 * Grade semanal: uma linha por rota, uma coluna por dia.
 * Horário existente abre a edição; espaço vazio abre a criação.
 */
function GradeCronogramas({
  linhas,
  selecionadas,
  cronogramaAberto,
  onAlternarRota,
  onAbrirCronograma,
  onCriar,
}) {
  return (
    <div className="grade-cronogramas__rolagem">
      <table className="grade-cronogramas">
        <caption className="visualmente-oculto">
          Horários de coleta por rota e dia da semana
        </caption>

        <thead>
          <tr>
            <th
              scope="col"
              className="grade-cronogramas__rota"
            >
              Rota
            </th>

            {DIAS_SEMANA.map((dia) => (
              <th
                key={dia.valor}
                scope="col"
              >
                <abbr title={dia.longo}>{dia.curto}</abbr>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {linhas.map(({ rota, celulas, ativos }) => {
            const idCaixa = `selecionar-rota-${rota.id}`

            return (
              <tr
                key={rota.id}
                className={rota.ativo ? '' : 'grade-cronogramas__linha--inativa'}
              >
                <th
                  scope="row"
                  className="grade-cronogramas__rota"
                >
                  <div className="grade-cronogramas__rota-conteudo">
                    <input
                      id={idCaixa}
                      type="checkbox"
                      className="grade-cronogramas__caixa"
                      checked={selecionadas.includes(rota.id)}
                      onChange={() => onAlternarRota(rota.id)}
                      disabled={ativos.length === 0}
                    />

                    <label htmlFor={idCaixa}>
                      <span className="grade-cronogramas__nome">
                        {rota.nome}
                      </span>

                      <span className="grade-cronogramas__meta">
                        {ativos.length === 1
                          ? '1 horário ativo'
                          : `${ativos.length} horários ativos`}
                        {!rota.ativo && ' · rota inativa'}
                      </span>
                    </label>
                  </div>
                </th>

                {celulas.map(({ dia, cronograma }) => (
                  <td key={dia.valor}>
                    {cronograma ? (
                      <button
                        type="button"
                        className={[
                          'horario-chip',
                          ehNoturno(cronograma.horarioInicio)
                            ? 'horario-chip--noturno'
                            : 'horario-chip--diurno',
                          cronograma.ativo ? '' : 'horario-chip--inativo',
                          cronogramaAberto === cronograma.id
                            ? 'horario-chip--aberto'
                            : '',
                        ].join(' ')}
                        onClick={() => onAbrirCronograma(cronograma)}
                        aria-label={`Editar ${rota.nome}, ${dia.longo}, ${horaCurta(cronograma.horarioInicio)} às ${horaCurta(cronograma.horarioFim)}${cronograma.ativo ? '' : ', inativo'}`}
                      >
                        <span>{horaCurta(cronograma.horarioInicio)}</span>
                        <span aria-hidden="true">–</span>
                        <span>{horaCurta(cronograma.horarioFim)}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="horario-vazio"
                        onClick={() => onCriar(rota.id, dia.valor)}
                        aria-label={`Criar horário para ${rota.nome}, ${dia.longo}`}
                      >
                        <span aria-hidden="true">+</span>
                      </button>
                    )}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default GradeCronogramas
