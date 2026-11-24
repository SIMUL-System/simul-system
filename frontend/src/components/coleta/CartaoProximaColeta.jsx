import Icone from '../Icone'

import { descreverQuando, formatarData, formatarHora } from '../../utils/coleta'

/**
 * ColetaCard do Design System: a próxima coleta da região.
 * Variante "hoje" (amarela) quando a coleta é hoje ou está acontecendo.
 */
function CartaoProximaColeta({ proxima, bairro }) {
  if (!proxima) {
    return null
  }

  const destaque = proxima.hoje || proxima.emAndamento

  const quando = descreverQuando(proxima)

  const inicio = formatarHora(proxima.cronograma.horarioInicio)

  const fim = formatarHora(proxima.cronograma.horarioFim)

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

      <p className="coleta-cartao__hora">
        <time dateTime={inicio}>{inicio}</time>
        {' – '}
        <time dateTime={fim}>{fim}</time>
      </p>

      <p className="coleta-cartao__meta">
        <span>
          <Icone nome="local" tamanho={16} />
          {bairro}
        </span>

        <span>
          <Icone nome="relogio" tamanho={16} />
          {proxima.emAndamento
            ? `O caminhão pode passar até as ${fim}`
            : `Coloque os recicláveis na calçada antes das ${inicio}`}
        </span>
      </p>
    </article>
  )
}

export default CartaoProximaColeta
