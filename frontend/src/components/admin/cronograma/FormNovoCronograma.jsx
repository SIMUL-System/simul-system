import { useState } from 'react'

import Icone from '../../Icone'
import CamposHorario from './CamposHorario'
import { ATALHOS_DIAS, DIAS_SEMANA, diasOcupados, listarDias } from '../../../utils/cronogramas'

/**
 * Cria horários para vários dias de uma vez. Dias em que a rota já
 * tem horário ativo ficam bloqueados (a regra do back-end é um
 * horário ativo por rota e dia).
 */
function FormNovoCronograma({ rotas, cronogramas, rotaInicial, diasIniciais, salvando, onEnviar }) {
  const [rotaId, setRotaId] = useState(rotaInicial ? String(rotaInicial) : '')
  const [dias, setDias] = useState(diasIniciais ?? [])
  const [horario, setHorario] = useState({ inicio: '06:00', fim: '18:00' })
  const [erro, setErro] = useState('')

  const ocupados = rotaId ? diasOcupados(cronogramas, Number(rotaId)) : []
  const diasValidos = dias.filter((dia) => !ocupados.includes(dia))

  function alternarDia(valor) {
    setErro('')
    setDias((atuais) =>
      atuais.includes(valor) ? atuais.filter((dia) => dia !== valor) : [...atuais, valor],
    )
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!rotaId) {
      setErro('Escolha a rota.')
      return
    }

    if (diasValidos.length === 0) {
      setErro('Escolha pelo menos um dia livre para esta rota.')
      return
    }

    if (horario.inicio === horario.fim) {
      setErro('O início e o fim da coleta não podem ser iguais.')
      return
    }

    onEnviar({
      rotaId: Number(rotaId),
      dias: DIAS_SEMANA.map((dia) => dia.valor).filter((valor) => diasValidos.includes(valor)),
      inicio: horario.inicio,
      fim: horario.fim,
    })
  }

  const quantidade = diasValidos.length

  return (
    <form className="painel-form" onSubmit={handleSubmit} noValidate>
      <div className="campo-ds">
        <label className="campo-ds__rotulo" htmlFor="novo-cronograma-rota">
          Rota
        </label>

        <select
          id="novo-cronograma-rota"
          className="campo-ds__controle"
          value={rotaId}
          onChange={(event) => {
            setErro('')
            setRotaId(event.target.value)
          }}
          disabled={salvando}
        >
          <option value="">Selecione a rota</option>
          {rotas.map((rota) => (
            <option key={rota.id} value={rota.id}>
              {rota.nome}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="seletor-dias">
        <legend className="campo-ds__rotulo">Dias da coleta</legend>

        <div className="seletor-dias__grade">
          {DIAS_SEMANA.map((dia) => {
            const ocupado = ocupados.includes(dia.valor)
            const marcado = dias.includes(dia.valor) && !ocupado

            return (
              <button
                key={dia.valor}
                type="button"
                className="seletor-dias__dia"
                aria-pressed={marcado}
                aria-label={ocupado ? `${dia.longo}: a rota já tem horário neste dia` : dia.longo}
                title={ocupado ? 'Já tem horário neste dia' : undefined}
                onClick={() => alternarDia(dia.valor)}
                disabled={ocupado || salvando}
              >
                {dia.curto}
              </button>
            )
          })}
        </div>

        <div className="atalhos" role="group" aria-label="Marcar dias">
          {ATALHOS_DIAS.map((atalho) => (
            <button
              key={atalho.rotulo}
              type="button"
              className="atalho"
              onClick={() => {
                setErro('')
                setDias(atalho.dias)
              }}
              disabled={salvando}
            >
              {atalho.rotulo}
            </button>
          ))}
        </div>

        {ocupados.length > 0 && (
          <p className="campo-ds__dica">
            Dias bloqueados já têm horário nesta rota. Para mudar um deles, toque no horário na
            grade.
          </p>
        )}
      </fieldset>

      <CamposHorario
        idBase="novo-cronograma"
        inicio={horario.inicio}
        fim={horario.fim}
        onAlterar={setHorario}
        disabled={salvando}
      />

      <p className="painel-form__resumo" aria-live="polite">
        {quantidade === 0
          ? 'Escolha os dias para ver o resumo.'
          : `${quantidade === 1 ? 'Será criado 1 horário' : `Serão criados ${quantidade} horários`}: ${listarDias(diasValidos)}, das ${horario.inicio} às ${horario.fim}.`}
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
        {salvando ? 'Salvando…' : quantidade > 1 ? `Criar ${quantidade} horários` : 'Criar horário'}
      </button>
    </form>
  )
}

export default FormNovoCronograma
