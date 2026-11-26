import Icone from '../Icone'

import { descreverQuando, formatarData, formatarHora, TURNOS } from '../../utils/coleta'

/**
 * ColetaCard do Design System: a próxima coleta da região.
 * Variante "hoje" (amarela) quando a coleta é hoje ou está acontecendo.
 * Quando a prefeitura informa só o turno, o cartão mostra o turno, sem
 * inventar horário.
 */
function CartaoProximaColeta({ proxima, bairro }) {
  if (!proxima) {
    return null
  }

  const destaque = proxima.hoje || proxima.emAndamento

  const quando = descreverQuando(proxima)

  const inicio = formatarHora(proxima.cronograma.horarioInicio)

  const fim = formatarHora(proxima.cronograma.horarioFim)

  let orientacao

  if (proxima.semHorario) {
    orientacao =
      proxima.turno === 'NAO_INFORMADO'
        ? 'A prefeitura não informa o turno nem o horário: separe os recicláveis com antecedência.'
        : `Coleta no turno ${TURNOS[proxima.turno].rotulo.toLowerCase()}. A prefeitura não informa o horário exato: separe os recicláveis com antecedência.`
  } else {
    orientacao = proxima.emAndamento
      ? `O caminhão pode passar até as ${fim}`
      : `Coloque os recicláveis na calçada antes das ${inicio}`
  }

  return (
    <article
      className={destaque ? 'coleta-cartao coleta-cartao--hoje' : 'coleta-cartao'}
      aria-labelledby="proxima-coleta-titulo"
    >
      <div className="coleta-cartao__topo">
        <div>
          <p className="sobretitulo">Próxima coleta</p>

          <h3 id="proxima-coleta-titulo" className="coleta-cartao__dia">
            {formatarData(proxima.inicio)}
          </h3>
        </div>

        <span className={destaque ? 'selo selo--hoje' : 'selo selo--info'}>{quando}</span>
      </div>

      <p
        className={`coleta-cartao__hora${proxima.semHorario ? ' coleta-cartao__hora--turno' : ''}`}
      >
        {proxima.semHorario ? (
          proxima.turno === 'NAO_INFORMADO' ? (
            'Turno não informado'
          ) : (
            `Turno ${TURNOS[proxima.turno].rotulo.toLowerCase()}`
          )
        ) : (
          <>
            <time dateTime={inicio}>{inicio}</time>
            {' – '}
            <time dateTime={fim}>{fim}</time>
          </>
        )}
      </p>

      <p className="coleta-cartao__meta">
        <span>
          <Icone nome="local" tamanho={16} />
          {bairro}
        </span>

        <span>
          <Icone nome="relogio" tamanho={16} />
          {orientacao}
        </span>
      </p>
    </article>
  )
}

export default CartaoProximaColeta
