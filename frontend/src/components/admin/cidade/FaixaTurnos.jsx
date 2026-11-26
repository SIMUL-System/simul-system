import { useState } from 'react'

import Alerta from '../../Alerta'
import Icone from '../../Icone'
import CamposHorario from '../cronograma/CamposHorario'

import { atualizarTurnosCidade } from '../../../services/adminCidadeService'
import { horaCurta, horaParaApi } from '../../../utils/cronogramas'

const TURNOS = [
  { chave: 'diurno', rotulo: 'Diurno', icone: 'sol' },
  { chave: 'noturno', rotulo: 'Noturno', icone: 'lua' },
]

/** Faixa salva → valores do formulário ("19:00"). */
function paraFormulario(turnos) {
  return {
    diurnoInicio: horaCurta(turnos?.diurnoInicio),
    diurnoFim: horaCurta(turnos?.diurnoFim),
    noturnoInicio: horaCurta(turnos?.noturnoInicio),
    noturnoFim: horaCurta(turnos?.noturnoFim),
    fonte: turnos?.fonte ?? '',
  }
}

/**
 * Faixa média do turno diurno e do noturno na cidade, informada pela
 * operadora da coleta. A consulta mostra essa faixa como horário aproximado
 * das coletas que só têm o turno, e o lembrete conta a partir do início do
 * turno. Não substitui o horário exato de uma rota.
 */
function FaixaTurnos({ cidade, onSalva }) {
  const [editando, setEditando] = useState(false)
  const [valores, setValores] = useState(() => paraFormulario(cidade.turnos))
  const [salvando, setSalvando] = useState(false)
  const [retorno, setRetorno] = useState(null)

  const turnos = cidade.turnos ?? {}

  function erroDoFormulario() {
    for (const turno of TURNOS) {
      const inicio = valores[`${turno.chave}Inicio`]
      const fim = valores[`${turno.chave}Fim`]

      if (Boolean(inicio) !== Boolean(fim)) {
        return `Preencha o início e o fim do turno ${turno.rotulo.toLowerCase()}, ou deixe os dois em branco.`
      }

      if (inicio && inicio === fim) {
        return `O início e o fim do turno ${turno.rotulo.toLowerCase()} não podem ser iguais.`
      }
    }

    return ''
  }

  async function salvar(event) {
    event.preventDefault()

    const erro = erroDoFormulario()
    if (erro) {
      setRetorno({ tipo: 'erro', texto: erro })
      return
    }

    setSalvando(true)
    setRetorno(null)

    try {
      await atualizarTurnosCidade(cidade.id, {
        diurnoInicio: horaParaApi(valores.diurnoInicio),
        diurnoFim: horaParaApi(valores.diurnoFim),
        noturnoInicio: horaParaApi(valores.noturnoInicio),
        noturnoFim: horaParaApi(valores.noturnoFim),
        fonte: valores.fonte.trim() || null,
      })
      await onSalva()
      setEditando(false)
      setRetorno({
        tipo: 'sucesso',
        texto: 'Faixa dos turnos salva. A consulta e os lembretes já usam os novos horários.',
      })
    } catch (error) {
      setRetorno({ tipo: 'erro', texto: error.message || 'Não foi possível salvar a faixa.' })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <section className="admin-quadro painel-bloco" aria-labelledby="titulo-faixa-turnos">
      <div className="painel-bloco__topo">
        <h2 id="titulo-faixa-turnos" className="painel-bloco__titulo">
          Faixa dos turnos
        </h2>

        {!editando && (
          <button
            type="button"
            className="botao botao--pequeno botao--secundario"
            onClick={() => {
              setValores(paraFormulario(cidade.turnos))
              setRetorno(null)
              setEditando(true)
            }}
          >
            Editar faixa
          </button>
        )}
      </div>

      <p className="admin-pagina__texto">
        Horário aproximado de cada turno em {cidade.nome}. A consulta mostra essa faixa quando a
        prefeitura informa só o turno, e o lembrete conta a partir do início do turno.
      </p>

      {retorno && <Alerta tipo={retorno.tipo}>{retorno.texto}</Alerta>}

      {!editando ? (
        <>
          <ul className="faixa-turnos">
            {TURNOS.map((turno) => {
              const inicio = horaCurta(turnos[`${turno.chave}Inicio`])
              const fim = horaCurta(turnos[`${turno.chave}Fim`])

              return (
                <li
                  key={turno.chave}
                  className={`faixa-turnos__item faixa-turnos__item--${turno.chave}`}
                >
                  <Icone nome={turno.icone} tamanho={20} />
                  <span className="faixa-turnos__rotulo">{turno.rotulo}</span>
                  <strong className="faixa-turnos__horario">
                    {inicio && fim ? `${inicio} – ${fim}` : 'Não informado'}
                  </strong>
                </li>
              )
            })}
          </ul>

          <p className="campo-ds__dica">
            {turnos.fonte ? `Fonte: ${turnos.fonte}` : 'Fonte não informada.'}
          </p>
        </>
      ) : (
        <form className="faixa-turnos__form" onSubmit={salvar} noValidate>
          {TURNOS.map((turno) => (
            <CamposHorario
              key={turno.chave}
              idBase={`faixa-${turno.chave}`}
              legenda={`Turno ${turno.rotulo.toLowerCase()}`}
              inicio={valores[`${turno.chave}Inicio`]}
              fim={valores[`${turno.chave}Fim`]}
              onAlterar={({ inicio, fim }) =>
                setValores((atual) => ({
                  ...atual,
                  [`${turno.chave}Inicio`]: inicio,
                  [`${turno.chave}Fim`]: fim,
                }))
              }
              disabled={salvando}
            />
          ))}

          <div className="campo-ds">
            <label className="campo-ds__rotulo" htmlFor="faixa-fonte">
              Fonte <span className="campo-ds__opcional">(opcional)</span>
            </label>
            <input
              id="faixa-fonte"
              className="campo-ds__controle"
              value={valores.fonte}
              maxLength={255}
              onChange={(event) => setValores((atual) => ({ ...atual, fonte: event.target.value }))}
              disabled={salvando}
            />
            <p className="campo-ds__dica">
              <Icone nome="info" tamanho={16} /> Fim menor que o início vale para turno que passa da
              meia-noite (19:00 – 04:00).
            </p>
          </div>

          <div className="faixa-turnos__acoes">
            <button type="submit" className="botao botao--primario" disabled={salvando}>
              {salvando ? 'Salvando…' : 'Salvar faixa'}
            </button>
            <button
              type="button"
              className="botao botao--secundario"
              onClick={() => setEditando(false)}
              disabled={salvando}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </section>
  )
}

export default FaixaTurnos
