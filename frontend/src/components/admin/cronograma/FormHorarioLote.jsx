import { useState } from 'react'

import Icone from '../../Icone'
import CamposHorario from './CamposHorario'

import { ativosDaRota, ehNoturno } from '../../../utils/cronogramas'
import { resumirColetaDaRota } from '../../../utils/areas'

/**
 * Muda início e fim de todos os dias das rotas marcadas, de uma vez só
 * (o back-end aplica tudo ou nada). Os dias de cada rota não mudam.
 */
function FormHorarioLote({ rotas, cronogramas, salvando, onEnviar }) {
  const [marcadas, setMarcadas] = useState([])
  const [horario, setHorario] = useState({ inicio: '', fim: '' })
  const [erro, setErro] = useState('')

  const comHorario = rotas.filter((rota) => ativosDaRota(cronogramas, rota.id).length > 0)
  const ids = comHorario
    .filter((rota) => marcadas.includes(rota.id))
    .flatMap((rota) => ativosDaRota(cronogramas, rota.id).map((item) => item.id))

  function noturna(rota) {
    return ativosDaRota(cronogramas, rota.id).some((item) => ehNoturno(item.horarioInicio))
  }

  const grupos = [
    { rotulo: 'Todas', filtro: () => true },
    { rotulo: 'Diurnas', filtro: (rota) => !noturna(rota) },
    { rotulo: 'Noturnas', filtro: noturna },
  ]

  function alternar(id) {
    setErro('')
    setMarcadas((atual) =>
      atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id],
    )
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (marcadas.length === 0) {
      setErro('Marque pelo menos uma rota.')
      return
    }

    if (!horario.inicio || !horario.fim) {
      setErro('Informe o novo início e o novo fim.')
      return
    }

    if (horario.inicio === horario.fim) {
      setErro('O início e o fim da coleta não podem ser iguais.')
      return
    }

    onEnviar(ids, horario, marcadas.length)
  }

  return (
    <form className="painel-form" onSubmit={handleSubmit} noValidate>
      <fieldset className="lote-rotas">
        <legend className="campo-ds__rotulo">Quais rotas mudam?</legend>

        <div className="atalhos" role="group" aria-label="Marcar várias rotas">
          {grupos.map((grupo) => (
            <button
              key={grupo.rotulo}
              type="button"
              className="atalho"
              onClick={() => {
                setErro('')
                setMarcadas(comHorario.filter(grupo.filtro).map((rota) => rota.id))
              }}
              disabled={salvando}
            >
              {grupo.rotulo}
            </button>
          ))}
          {marcadas.length > 0 && (
            <button type="button" className="botao-link" onClick={() => setMarcadas([])}>
              Desmarcar
            </button>
          )}
        </div>

        <ul className="lote-rotas__lista">
          {comHorario.map((rota) => (
            <li key={rota.id}>
              <label className="caixa-opcao lote-rotas__item">
                <input
                  type="checkbox"
                  checked={marcadas.includes(rota.id)}
                  onChange={() => alternar(rota.id)}
                  disabled={salvando}
                />
                <span>
                  {rota.nome}
                  <small>
                    {resumirColetaDaRota(cronogramas, rota.id).replace(/^Coleta: /, '')}
                  </small>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <CamposHorario
        idBase="horario-lote"
        inicio={horario.inicio}
        fim={horario.fim}
        onAlterar={(novo) => {
          setErro('')
          setHorario(novo)
        }}
        disabled={salvando}
      />

      <p className="painel-form__resumo" aria-live="polite">
        {marcadas.length > 0 && horario.inicio && horario.fim
          ? `${marcadas.length === 1 ? 'A rota marcada passa' : `As ${marcadas.length} rotas marcadas passam`} a coletar das ${horario.inicio} às ${horario.fim}, nos mesmos dias de hoje. Tudo é salvo de uma vez: se algo falhar, nada muda.`
          : 'Marque as rotas e informe o novo horário para ver o resumo.'}
      </p>

      {erro && (
        <p className="campo-ds__erro" role="alert">
          <Icone nome="erro" tamanho={16} />
          {erro}
        </p>
      )}

      <button
        type="submit"
        className="botao botao--primario painel-form__principal"
        disabled={salvando}
      >
        {salvando
          ? 'Salvando…'
          : marcadas.length === 0
            ? 'Alterar horário'
            : `Alterar horário de ${marcadas.length === 1 ? '1 rota' : `${marcadas.length} rotas`}`}
      </button>
    </form>
  )
}

export default FormHorarioLote
