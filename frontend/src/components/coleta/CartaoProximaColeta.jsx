import Icone from '../Icone'

import { descreverQuando, formatarData, formatarHora, TURNOS } from '../../utils/coleta'

/** "19:00" → "18:00" (uma hora antes, virando o dia se preciso). */
function umaHoraAntes(hora) {
  const [h, m] = hora.split(':').map(Number)
  return `${String((h + 23) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

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

  if (proxima.semHorario && proxima.faixa && proxima.emAndamento) {
    orientacao = `O turno vai até cerca de ${proxima.faixa.fim}: o caminhão pode passar a qualquer momento.`
  } else if (proxima.semHorario && proxima.faixa) {
    // Orientação das prefeituras: lixo na calçada até 1 hora antes do início do turno.
    orientacao = `Deixe o lixo na calçada até 1 hora antes do início do turno (${umaHoraAntes(proxima.faixa.inicio)}). O horário exato varia por rua.`
  } else if (proxima.semHorario) {
    orientacao =
      proxima.turno === 'NAO_INFORMADO'
        ? 'A prefeitura não informa o turno nem o horário: separe o lixo com antecedência.'
        : `Coleta no turno ${TURNOS[proxima.turno].rotulo.toLowerCase()}. A prefeitura não informa o horário exato: separe o lixo com antecedência.`
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
            <>
              Turno {TURNOS[proxima.turno].rotulo.toLowerCase()}
              {proxima.faixa && (
                <span className="coleta-cartao__faixa">
                  aprox. {proxima.faixa.inicio} – {proxima.faixa.fim}
                </span>
              )}
            </>
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
