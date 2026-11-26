import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Alerta from '../Alerta'
import Icone from '../Icone'
import DialogoConfirmacao from '../admin/DialogoConfirmacao'
import CampoSenha from '../form/CampoSenha'

import { logout } from '../../services/authService'
import { baixarMeusDados, excluirMinhaConta } from '../../services/privacidadeService'

/** "26/11/2026" a partir de "2026-11-26T10:00:00". */
function formatarData(dataHora) {
  if (!dataHora) return ''
  const [ano, mes, dia] = String(dataHora).slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

/**
 * Privacidade na Minha conta: o que foi aceito, baixar uma cópia dos dados
 * e excluir a conta (direitos do titular, LGPD art. 18).
 */
function SecaoPrivacidade({ usuario }) {
  const navigate = useNavigate()
  const [baixando, setBaixando] = useState(false)
  const [mensagem, setMensagem] = useState(null)
  const [confirmando, setConfirmando] = useState(false)
  const [senha, setSenha] = useState('')
  const [erroSenha, setErroSenha] = useState('')
  const [excluindo, setExcluindo] = useState(false)

  const admin = usuario.perfil === 'ADMIN'

  async function baixar() {
    setBaixando(true)
    setMensagem(null)

    try {
      const dados = await baixarMeusDados()
      const arquivo = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' })
      const endereco = URL.createObjectURL(arquivo)
      const link = document.createElement('a')

      link.href = endereco
      link.download = 'simul-meus-dados.json'
      document.body.append(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(endereco)

      setMensagem({ tipo: 'sucesso', texto: 'Arquivo “simul-meus-dados.json” baixado.' })
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: error.message || 'Não foi possível gerar o arquivo.' })
    } finally {
      setBaixando(false)
    }
  }

  async function excluir() {
    if (!senha) {
      setErroSenha('Digite sua senha para confirmar.')
      return
    }

    setExcluindo(true)
    setErroSenha('')

    try {
      await excluirMinhaConta(senha)
      logout()
      navigate('/login', { replace: true, state: { contaExcluida: true } })
    } catch (error) {
      setErroSenha(error.message || 'Não foi possível excluir a conta.')
      setExcluindo(false)
    }
  }

  function fecharConfirmacao() {
    setConfirmando(false)
    setSenha('')
    setErroSenha('')
  }

  return (
    <section className="cartao privacidade-conta" aria-labelledby="titulo-privacidade-conta">
      <div>
        <p className="sobretitulo">Privacidade</p>
        <h2 id="titulo-privacidade-conta" className="titulo-cartao">
          Seus dados
        </h2>
        <p className="privacidade-conta__texto">
          Seu e-mail fica criptografado e sua senha não é guardada, só um resumo dela.{' '}
          {usuario.termosAceitosEm
            ? `Você aceitou os termos em ${formatarData(usuario.termosAceitosEm)}.`
            : ''}{' '}
          Leia os <Link to="/termos">Termos de Uso</Link> e a{' '}
          <Link to="/privacidade">Política de Privacidade</Link>.
        </p>
      </div>

      {mensagem && <Alerta tipo={mensagem.tipo}>{mensagem.texto}</Alerta>}

      <div className="privacidade-conta__acoes">
        <button
          type="button"
          className="botao botao--secundario"
          onClick={baixar}
          disabled={baixando}
        >
          <Icone nome="baixar" tamanho={18} />
          {baixando ? 'Gerando arquivo…' : 'Baixar meus dados'}
        </button>

        {admin ? (
          <p className="campo-ds__dica">
            A conta de administrador do sistema não pode ser excluída por aqui.
          </p>
        ) : (
          <button
            type="button"
            className="botao botao--texto-perigo"
            onClick={() => setConfirmando(true)}
          >
            Excluir minha conta
          </button>
        )}
      </div>

      <DialogoConfirmacao
        aberto={confirmando}
        titulo="Excluir sua conta?"
        textoConfirmar="Excluir conta"
        textoCancelar="Manter conta"
        perigo
        processando={excluindo}
        confirmarDesabilitado={!senha}
        onConfirmar={excluir}
        onCancelar={fecharConfirmacao}
      >
        <p>
          Isso apaga <strong>na hora e de vez</strong> sua conta, seu lembrete e o histórico de
          avisos. Não dá para desfazer. Se quiser, baixe seus dados antes.
        </p>

        <CampoSenha
          id="senha-exclusao"
          rotulo="Sua senha"
          value={senha}
          onChange={(event) => {
            setSenha(event.target.value)
            setErroSenha('')
          }}
          autoComplete="current-password"
          maxLength={72}
          erro={erroSenha}
          disabled={excluindo}
        />
      </DialogoConfirmacao>
    </section>
  )
}

export default SecaoPrivacidade
