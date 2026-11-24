import { useState } from 'react'

import Icone from '../../Icone'
import CamposHorario from './CamposHorario'

/**
 * Muda início e fim de todos os horários ativos das rotas marcadas,
 * de uma vez só (o back-end aplica tudo ou nada).
 */
function FormHorarioLote({
  rotasSelecionadas,
  quantidade,
  salvando,
  onEnviar,
}) {
  const [horario, setHorario] = useState({ inicio: '', fim: '' })
  const [erro, setErro] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    if (!horario.inicio || !horario.fim) {
      setErro('Informe o novo início e o novo fim.')
      return
    }

    if (horario.inicio === horario.fim) {
      setErro('O início e o fim da coleta não podem ser iguais.')
      return
    }

    onEnviar(horario)
  }

  return (
    <form
      className="painel-form"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="painel-form__selecao">
        <strong>
          {quantidade === 1
            ? '1 horário selecionado'
            : `${quantidade} horários selecionados`}
        </strong>

        <ul>
          {rotasSelecionadas.map((rota) => (
            <li key={rota.id}>{rota.nome}</li>
          ))}
        </ul>

        <span>O dia de cada horário não muda; só o início e o fim.</span>
      </div>

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

      <p
        className="painel-form__resumo"
        aria-live="polite"
      >
        {horario.inicio && horario.fim
          ? `Os ${quantidade} horários passam a ser das ${horario.inicio} às ${horario.fim}. Tudo é salvo de uma vez: se algo falhar, nada muda.`
          : 'Informe o novo horário para ver o resumo.'}
      </p>

      {erro && (
        <p
          className="campo-ds__erro"
          role="alert"
        >
          <Icone
            nome="erro"
            tamanho={16}
          />
          {erro}
        </p>
      )}

      <button
        type="submit"
        className="botao botao--primario painel-form__principal"
        disabled={salvando}
      >
        {salvando ? 'Salvando…' : `Alterar ${quantidade} horários`}
      </button>
    </form>
  )
}

export default FormHorarioLote
