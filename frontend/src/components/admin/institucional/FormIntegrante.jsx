import { useState } from 'react'

import Alerta from '../../Alerta'
import CampoFoto from './CampoFoto'

import { urlImagem } from '../../../services/institucionalService'

/**
 * Cadastro ou edição de um integrante. A foto escolhida é enviada pela página
 * depois de salvar os dados (onSalvar recebe os dados e o arquivo, se houver).
 */
function FormIntegrante({ integrante, salvando, onSalvar, onRemoverFoto }) {
  const [nome, setNome] = useState(integrante?.nome ?? '')
  const [funcao, setFuncao] = useState(integrante?.funcao ?? '')
  const [descricao, setDescricao] = useState(integrante?.descricao ?? '')
  const [link, setLink] = useState(integrante?.link ?? '')
  const [foto, setFoto] = useState(null)
  const [erro, setErro] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    if (!nome.trim() || !funcao.trim() || !descricao.trim()) {
      setErro('Preencha nome, função e descrição.')
      return
    }

    if (link.trim() && !/^https?:\/\//i.test(link.trim())) {
      setErro('O link deve começar com https://')
      return
    }

    setErro('')
    onSalvar(
      {
        nome: nome.trim(),
        funcao: funcao.trim(),
        descricao: descricao.trim(),
        link: link.trim() || null,
      },
      foto,
    )
  }

  return (
    <form className="painel-form" onSubmit={handleSubmit} noValidate>
      <CampoFoto
        rotulo="Foto"
        dica="De preferência um retrato com o rosto centralizado. Publique só com a autorização da pessoa."
        fotoAtual={integrante?.fotoId ? urlImagem(integrante.fotoId) : ''}
        onEscolher={setFoto}
        disabled={salvando}
        redonda
      />

      {integrante?.fotoId && !foto && (
        <button type="button" className="botao-link" onClick={onRemoverFoto} disabled={salvando}>
          Tirar a foto atual
        </button>
      )}

      <div className="campo-ds">
        <label className="campo-ds__rotulo" htmlFor="integrante-nome">
          Nome
        </label>
        <input
          id="integrante-nome"
          className="campo-ds__controle"
          maxLength={120}
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          disabled={salvando}
        />
      </div>

      <div className="campo-ds">
        <label className="campo-ds__rotulo" htmlFor="integrante-funcao">
          Função na equipe
        </label>
        <input
          id="integrante-funcao"
          className="campo-ds__controle"
          maxLength={120}
          placeholder="Ex.: Desenvolvimento do back-end"
          value={funcao}
          onChange={(event) => setFuncao(event.target.value)}
          disabled={salvando}
        />
      </div>

      <div className="campo-ds">
        <label className="campo-ds__rotulo" htmlFor="integrante-descricao">
          Descrição
        </label>
        <textarea
          id="integrante-descricao"
          className="campo-ds__controle campo-ds__controle--texto"
          rows={6}
          maxLength={2000}
          value={descricao}
          onChange={(event) => setDescricao(event.target.value)}
          aria-describedby="integrante-descricao-dica"
          disabled={salvando}
        />
        <p id="integrante-descricao-dica" className="campo-ds__dica">
          Quem é, o que fez no projeto, o que gosta de estudar. {descricao.length} de 2000
          caracteres.
        </p>
      </div>

      <div className="campo-ds">
        <label className="campo-ds__rotulo" htmlFor="integrante-link">
          Link <span className="campo-ds__opcional">(opcional)</span>
        </label>
        <input
          id="integrante-link"
          type="url"
          className="campo-ds__controle"
          maxLength={255}
          placeholder="https://www.linkedin.com/in/…"
          value={link}
          onChange={(event) => setLink(event.target.value)}
          disabled={salvando}
        />
      </div>

      {erro && <Alerta tipo="erro">{erro}</Alerta>}

      <button
        type="submit"
        className="botao botao--primario painel-form__principal"
        disabled={salvando}
      >
        {salvando ? 'Salvando…' : integrante ? 'Salvar integrante' : 'Adicionar integrante'}
      </button>
    </form>
  )
}

export default FormIntegrante
