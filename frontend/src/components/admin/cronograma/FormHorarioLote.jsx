import { useState } from 'react'

import Icone from '../../Icone'
import CamposHorario from './CamposHorario'

import { nomeRotaCurto } from '../../../utils/areas'
import { ativosDaRota, dadosTurno, listarDias, TURNOS, turnoDe } from '../../../utils/cronogramas'

/**
 * Muda, de uma vez, o horário de um turno nas rotas marcadas (o back-end
 * aplica tudo ou nada). Os dias de cada rota não mudam, e o outro turno da
 * rota também não. Também permite voltar a mostrar só o turno, quando o
 * horário cadastrado não vem da prefeitura.
 */
function FormHorarioLote({ rotas, cronogramas, cidade, salvando, onEnviar }) {
  const [turno, setTurno] = useState('DIURNO')
  const [marcadas, setMarcadas] = useState([])
  const [semHorario, setSemHorario] = useState(false)
  const [horario, setHorario] = useState({ inicio: '', fim: '' })
  const [erro, setErro] = useState('')

  function coletasDoTurno(rotaId) {
    return ativosDaRota(cronogramas, rotaId).filter((item) => turnoDe(item) === turno)
  }

  const doTurno = rotas.filter((rota) => coletasDoTurno(rota.id).length > 0)
  const marcadasNoTurno = doTurno.filter((rota) => marcadas.includes(rota.id))
  const ids = marcadasNoTurno.flatMap((rota) => coletasDoTurno(rota.id).map((item) => item.id))
  const adjetivo = dadosTurno(turno).adjetivo

  function trocarTurno(valor) {
    setTurno(valor)
    setMarcadas([])
    setErro('')
  }

  function alternar(id) {
    setErro('')
    setMarcadas((atual) =>
      atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id],
    )
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (marcadasNoTurno.length === 0) {
      setErro('Marque pelo menos uma rota.')
      return
    }

    if (!semHorario && (!horario.inicio || !horario.fim)) {
      setErro('Informe o novo início e o novo fim, ou marque “Mostrar só o turno”.')
      return
    }

    if (!semHorario && horario.inicio === horario.fim) {
      setErro('O início e o fim da coleta não podem ser iguais.')
      return
    }

    onEnviar(ids, { ...horario, semHorario, turno }, marcadasNoTurno.length)
  }

  return (
    <form className="painel-form" onSubmit={handleSubmit} noValidate>
      <fieldset className="lote-rotas">
        <legend className="campo-ds__rotulo">Qual turno muda?</legend>

        <div className="atalhos" role="group" aria-label="Turno">
          {TURNOS.filter((item) => item.valor !== 'NAO_INFORMADO').map((item) => (
            <button
              key={item.valor}
              type="button"
              className="atalho"
              aria-pressed={turno === item.valor}
              onClick={() => trocarTurno(item.valor)}
              disabled={salvando}
            >
              <Icone nome={item.icone} tamanho={16} />
              {item.rotulo}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="lote-rotas">
        <legend className="campo-ds__rotulo">Quais rotas mudam?</legend>

        {doTurno.length === 0 ? (
          <p className="campo-ds__dica">Nenhuma rota ativa tem coleta {adjetivo} nesta cidade.</p>
        ) : (
          <>
            <div className="atalhos" role="group" aria-label="Marcar várias rotas">
              <button
                type="button"
                className="atalho"
                onClick={() => {
                  setErro('')
                  setMarcadas(doTurno.map((rota) => rota.id))
                }}
                disabled={salvando}
              >
                Todas com coleta {adjetivo}
              </button>
              {marcadas.length > 0 && (
                <button type="button" className="botao-link" onClick={() => setMarcadas([])}>
                  Desmarcar
                </button>
              )}
            </div>

            <ul className="lote-rotas__lista">
              {doTurno.map((rota) => {
                const coletas = coletasDoTurno(rota.id)
                const comHorario = coletas.find((item) => item.horarioInicio)

                return (
                  <li key={rota.id}>
                    <label className="caixa-opcao lote-rotas__item">
                      <input
                        type="checkbox"
                        checked={marcadas.includes(rota.id)}
                        onChange={() => alternar(rota.id)}
                        disabled={salvando}
                      />
                      <span>
                        {nomeRotaCurto(rota.nome, cidade)}
                        <small>
                          {listarDias(
                            coletas.map((item) => item.diaSemana),
                            'curto',
                          )}{' '}
                          ·{' '}
                          {comHorario
                            ? `${comHorario.horarioInicio.slice(0, 5)}–${comHorario.horarioFim.slice(0, 5)}`
                            : 'sem horário'}
                        </small>
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </fieldset>

      <label className="caixa-opcao">
        <input
          type="checkbox"
          checked={semHorario}
          onChange={(event) => {
            setErro('')
            setSemHorario(event.target.checked)
          }}
          disabled={salvando}
        />
        <span>Mostrar só o turno (a prefeitura não informa o horário)</span>
      </label>

      {!semHorario && (
        <CamposHorario
          idBase="horario-lote"
          legenda={`Novo horário da coleta ${adjetivo}`}
          inicio={horario.inicio}
          fim={horario.fim}
          onAlterar={(novo) => {
            setErro('')
            setHorario(novo)
          }}
          disabled={salvando}
        />
      )}

      <p className="painel-form__resumo" aria-live="polite">
        {marcadasNoTurno.length === 0
          ? 'Marque as rotas para ver o resumo.'
          : semHorario
            ? `${marcadasNoTurno.length === 1 ? 'A rota marcada passa' : `As ${marcadasNoTurno.length} rotas marcadas passam`} a mostrar só o turno ${dadosTurno(turno).rotulo.toLowerCase()}, sem horário. Tudo é salvo de uma vez: se algo falhar, nada muda.`
            : horario.inicio && horario.fim
              ? `${marcadasNoTurno.length === 1 ? 'A rota marcada passa' : `As ${marcadasNoTurno.length} rotas marcadas passam`} a coletar das ${horario.inicio} às ${horario.fim} no turno ${dadosTurno(turno).rotulo.toLowerCase()}, nos mesmos dias de hoje. Tudo é salvo de uma vez: se algo falhar, nada muda.`
              : 'Informe o novo horário para ver o resumo.'}
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
          : marcadasNoTurno.length === 0
            ? 'Alterar horário'
            : `Alterar ${marcadasNoTurno.length === 1 ? '1 rota' : `${marcadasNoTurno.length} rotas`}`}
      </button>
    </form>
  )
}

export default FormHorarioLote
