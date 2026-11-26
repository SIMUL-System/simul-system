import { useState } from 'react'

import Alerta from '../../Alerta'

const CAMPOS = [
  {
    chave: 'sobreProjeto',
    rotulo: 'Sobre o projeto',
    dica: 'Aparece no topo da página. Deixe uma linha em branco para começar outro parágrafo.',
    limite: 4000,
    linhas: 5,
  },
  { chave: 'instituicaoNome', rotulo: 'Nome da instituição', limite: 150 },
  { chave: 'curso', rotulo: 'Curso', limite: 150 },
  {
    chave: 'instituicaoTexto',
    rotulo: 'Sobre a instituição',
    dica: 'Onde fica, o que a turma estuda, como o projeto nasceu.',
    limite: 4000,
    linhas: 5,
  },
]

/** Textos da página "Quem somos". */
function FormTextos({ conteudo, salvando, onSalvar }) {
  const [valores, setValores] = useState(() =>
    Object.fromEntries(CAMPOS.map((campo) => [campo.chave, conteudo[campo.chave] ?? ''])),
  )
  const [erro, setErro] = useState('')

  const alterado = CAMPOS.some((campo) => valores[campo.chave] !== (conteudo[campo.chave] ?? ''))

  function handleSubmit(event) {
    event.preventDefault()

    const vazio = CAMPOS.find((campo) => !valores[campo.chave].trim())

    if (vazio) {
      setErro(`Preencha o campo “${vazio.rotulo}”.`)
      return
    }

    setErro('')
    onSalvar(valores)
  }

  return (
    <form className="painel-form" onSubmit={handleSubmit} noValidate>
      {CAMPOS.map((campo) => (
        <div key={campo.chave} className="campo-ds">
          <label className="campo-ds__rotulo" htmlFor={`inst-${campo.chave}`}>
            {campo.rotulo}
          </label>

          {campo.linhas ? (
            <textarea
              id={`inst-${campo.chave}`}
              className="campo-ds__controle campo-ds__controle--texto"
              rows={campo.linhas}
              maxLength={campo.limite}
              value={valores[campo.chave]}
              onChange={(event) =>
                setValores((atual) => ({ ...atual, [campo.chave]: event.target.value }))
              }
              disabled={salvando}
            />
          ) : (
            <input
              id={`inst-${campo.chave}`}
              className="campo-ds__controle"
              maxLength={campo.limite}
              value={valores[campo.chave]}
              onChange={(event) =>
                setValores((atual) => ({ ...atual, [campo.chave]: event.target.value }))
              }
              disabled={salvando}
            />
          )}

          <p className="campo-ds__dica">
            {campo.dica ? `${campo.dica} ` : ''}
            {valores[campo.chave].length} de {campo.limite} caracteres.
          </p>
        </div>
      ))}

      {erro && <Alerta tipo="erro">{erro}</Alerta>}

      <button
        type="submit"
        className="botao botao--primario painel-form__principal"
        disabled={salvando || !alterado}
      >
        {salvando ? 'Salvando…' : 'Salvar textos'}
      </button>
    </form>
  )
}

export default FormTextos
