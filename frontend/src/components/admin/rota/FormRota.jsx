import { useState } from 'react'

import Icone from '../../Icone'
import { normalizarTexto } from '../../../utils/areas'

const LIMITE_NOME = 120
const LIMITE_DESCRICAO = 255

/**
 * Cria ou edita o nome e a descrição de uma rota.
 */
function FormRota({
  rota,
  rotas,
  salvando,
  onEnviar,
}) {
  const [nome, setNome] = useState(rota?.nome ?? '')
  const [descricao, setDescricao] = useState(rota?.descricao ?? '')
  const [erro, setErro] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    const dados = {
      nome: normalizarTexto(nome),
      descricao: descricao.trim() || null,
    }

    if (!dados.nome) {
      setErro('Informe o nome da rota.')
      return
    }

    const repetida = rotas.find((item) =>
      item.id !== rota?.id
      && item.nome.trim().toLocaleLowerCase('pt-BR') === dados.nome.toLocaleLowerCase('pt-BR'),
    )

    if (repetida) {
      setErro('Já existe uma rota com esse nome.')
      return
    }

    setErro('')
    onEnviar(dados)
  }

  return (
    <form
      className="painel-form"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="campo-ds">
        <label
          className="campo-ds__rotulo"
          htmlFor="rota-nome"
        >
          Nome da rota
        </label>
        <input
          id="rota-nome"
          className="campo-ds__controle"
          value={nome}
          maxLength={LIMITE_NOME}
          onChange={(event) => setNome(event.target.value)}
          aria-invalid={Boolean(erro)}
          aria-describedby={erro ? 'rota-nome-erro' : 'rota-nome-dica'}
          disabled={salvando}
        />
        {erro ? (
          <p
            id="rota-nome-erro"
            className="campo-ds__erro"
            role="alert"
          >
            <Icone
              nome="erro"
              tamanho={16}
            />
            {erro}
          </p>
        ) : (
          <p
            id="rota-nome-dica"
            className="campo-ds__dica"
          >
            Dica: cidade, período e dias, como “Senador Canedo - Diurna (seg, qua e sex)”.
          </p>
        )}
      </div>

      <div className="campo-ds">
        <label
          className="campo-ds__rotulo"
          htmlFor="rota-descricao"
        >
          Descrição <span className="campo-ds__opcional">(opcional)</span>
        </label>
        <textarea
          id="rota-descricao"
          className="campo-ds__controle campo-ds__controle--texto"
          rows={3}
          value={descricao}
          maxLength={LIMITE_DESCRICAO}
          onChange={(event) => setDescricao(event.target.value)}
          aria-describedby="rota-descricao-contador"
          disabled={salvando}
        />
        <p
          id="rota-descricao-contador"
          className="campo-ds__dica"
        >
          {descricao.length} de {LIMITE_DESCRICAO} caracteres
        </p>
      </div>

      <button
        type="submit"
        className="botao botao--primario painel-form__principal"
        disabled={salvando}
      >
        {salvando ? 'Salvando…' : rota ? 'Salvar rota' : 'Cadastrar rota'}
      </button>

      {!rota && (
        <p className="campo-ds__dica">
          Depois de cadastrar, crie os horários em Cronogramas e ligue os
          bairros em Áreas atendidas.
        </p>
      )}
    </form>
  )
}

export default FormRota
