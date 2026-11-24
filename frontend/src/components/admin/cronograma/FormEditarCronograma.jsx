import { useState } from 'react'

import Icone from '../../Icone'
import CamposHorario from './CamposHorario'
import { DIAS_SEMANA, horaCurta, nomeDia } from '../../../utils/cronogramas'

/**
 * Edita um horário existente e liga/desliga o seu status.
 */
function FormEditarCronograma({
  cronograma,
  rotas,
  cronogramas,
  salvando,
  onSalvar,
  onAlterarStatus,
}) {
  const [rotaId, setRotaId] = useState(String(cronograma.rotaId))
  const [diaSemana, setDiaSemana] = useState(cronograma.diaSemana)
  const [horario, setHorario] = useState({
    inicio: horaCurta(cronograma.horarioInicio),
    fim: horaCurta(cronograma.horarioFim),
  })
  const [erro, setErro] = useState('')

  // Outro horário ativo no mesmo dia e rota impede salvar ou reativar.
  const conflito = cronogramas.find(
    (item) =>
      item.id !== cronograma.id &&
      item.ativo &&
      item.rotaId === Number(rotaId) &&
      item.diaSemana === diaSemana,
  )

  function handleSubmit(event) {
    event.preventDefault()

    if (horario.inicio === horario.fim) {
      setErro('O início e o fim da coleta não podem ser iguais.')
      return
    }

    if (conflito && cronograma.ativo) {
      setErro(`Esta rota já tem horário ativo na ${nomeDia(diaSemana)}.`)
      return
    }

    onSalvar({
      rotaId: Number(rotaId),
      diaSemana,
      inicio: horario.inicio,
      fim: horario.fim,
    })
  }

  return (
    <form className="painel-form" onSubmit={handleSubmit} noValidate>
      <p className="painel-form__situacao">
        <span className={`selo ${cronograma.ativo ? 'selo--ativo' : 'selo--inativo'}`}>
          {cronograma.ativo ? 'Ativo' : 'Inativo'}
        </span>
        {cronograma.ativo
          ? 'Aparece na consulta e gera lembretes.'
          : 'Não aparece na consulta nem gera lembretes.'}
      </p>

      <div className="campo-ds">
        <label className="campo-ds__rotulo" htmlFor="editar-cronograma-rota">
          Rota
        </label>

        <select
          id="editar-cronograma-rota"
          className="campo-ds__controle"
          value={rotaId}
          onChange={(event) => {
            setErro('')
            setRotaId(event.target.value)
          }}
          disabled={salvando}
        >
          {rotas.map((rota) => (
            <option key={rota.id} value={rota.id}>
              {rota.nome}
              {rota.ativo ? '' : ' (inativa)'}
            </option>
          ))}
        </select>
      </div>

      <div className="campo-ds">
        <label className="campo-ds__rotulo" htmlFor="editar-cronograma-dia">
          Dia da semana
        </label>

        <select
          id="editar-cronograma-dia"
          className="campo-ds__controle"
          value={diaSemana}
          onChange={(event) => {
            setErro('')
            setDiaSemana(event.target.value)
          }}
          disabled={salvando}
        >
          {DIAS_SEMANA.map((dia) => (
            <option key={dia.valor} value={dia.valor}>
              {dia.longo}
            </option>
          ))}
        </select>
      </div>

      <CamposHorario
        idBase="editar-cronograma"
        inicio={horario.inicio}
        fim={horario.fim}
        onAlterar={(novo) => {
          setErro('')
          setHorario(novo)
        }}
        disabled={salvando}
      />

      {erro && (
        <p className="campo-ds__erro" role="alert">
          <Icone nome="erro" tamanho={16} />
          {erro}
        </p>
      )}

      <div className="painel-form__acoes">
        <button
          type="submit"
          className="botao botao--primario painel-form__principal"
          disabled={salvando}
        >
          {salvando ? 'Salvando…' : 'Salvar alteração'}
        </button>

        {cronograma.ativo ? (
          <button
            type="button"
            className="botao botao--secundario botao--texto-perigo"
            onClick={() => onAlterarStatus(cronograma, false)}
            disabled={salvando}
          >
            Desativar
          </button>
        ) : (
          <button
            type="button"
            className="botao botao--secundario"
            onClick={() => onAlterarStatus(cronograma, true)}
            disabled={salvando || Boolean(conflito)}
          >
            Reativar
          </button>
        )}
      </div>

      {!cronograma.ativo && conflito && (
        <p className="campo-ds__dica">
          Para reativar, desative antes o horário ativo da mesma rota neste dia.
        </p>
      )}
    </form>
  )
}

export default FormEditarCronograma
