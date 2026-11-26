import { useEffect, useState } from 'react'

import { Link } from 'react-router-dom'

import { obterUsuarioAtual } from '../services/usuarioService'

import { obterPreferencia } from '../services/notificacaoService'

import '../App.css'
import '../styles/conta.css'

import Alerta from '../components/Alerta'
import Icone from '../components/Icone'
import SecaoPrivacidade from '../components/conta/SecaoPrivacidade'
import { descreverAntecedencia } from '../utils/coleta'

/** Lista legível dos canais ligados ("e-mail e navegador"). */
function descreverCanais(preferencia) {
  const canais = []

  if (preferencia.emailAtivo) {
    canais.push('e-mail')
  }

  if (preferencia.webPushAtivo) {
    canais.push('navegador')
  }

  return canais.join(' e ')
}

/** Minha conta: dados do usuário e resumo do lembrete. */
function PerfilPage() {
  const [usuario, setUsuario] = useState(null)
  const [preferencia, setPreferencia] = useState(null)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let componenteAtivo = true

    async function carregarDados() {
      try {
        const [dadosUsuario, dadosPreferencia] = await Promise.all([
          obterUsuarioAtual(),

          // Sem preferência cadastrada a API responde 404.
          obterPreferencia().catch((error) => {
            if (error?.status === 404) {
              return null
            }

            throw error
          }),
        ])

        if (componenteAtivo) {
          setUsuario(dadosUsuario)
          setPreferencia(dadosPreferencia)
        }
      } catch (error) {
        if (componenteAtivo) {
          setErro(error.message || 'Não foi possível carregar seus dados.')
        }
      } finally {
        if (componenteAtivo) {
          setCarregando(false)
        }
      }
    }

    carregarDados()

    return () => {
      componenteAtivo = false
    }
  }, [])

  const admin = usuario?.perfil === 'ADMIN'

  const lembreteAtivo = preferencia && (preferencia.emailAtivo || preferencia.webPushAtivo)

  return (
    <main className="conta-pagina" aria-labelledby="titulo-minha-conta" aria-busy={carregando}>
      <header className="conta-cabecalho">
        <p className="sobretitulo">Conta</p>

        <h1 id="titulo-minha-conta" className="conta-cabecalho__titulo">
          Minha conta
        </h1>
      </header>

      {carregando && (
        <p className="carregando" role="status">
          <span className="carregando__spinner" aria-hidden="true" />
          Carregando seus dados…
        </p>
      )}

      {!carregando && erro && (
        <Alerta tipo="erro" titulo="Não foi possível carregar">
          {erro}
        </Alerta>
      )}

      {!carregando && usuario && (
        <>
          <section className="cartao perfil" aria-labelledby="titulo-resumo-conta">
            <span className="perfil__avatar" aria-hidden="true">
              {usuario.nome?.charAt(0)?.toUpperCase() || 'U'}
            </span>

            <div className="perfil__dados">
              <h2 id="titulo-resumo-conta" className="perfil__nome">
                {usuario.nome}
              </h2>

              <p className="perfil__email">{usuario.email}</p>
            </div>

            <span className={admin ? 'selo selo--info' : 'selo selo--ativo'}>
              {admin ? 'Administrador' : 'Morador'}
            </span>
          </section>

          <section
            className={
              lembreteAtivo
                ? 'cartao lembrete-cartao lembrete-cartao--ativo'
                : 'cartao lembrete-cartao'
            }
            aria-labelledby="titulo-lembrete-conta"
          >
            <div className="lembrete-cartao__texto">
              <p className="sobretitulo">Seu lembrete</p>

              <h2 id="titulo-lembrete-conta" className="titulo-cartao">
                {!preferencia
                  ? 'Nenhum lembrete configurado'
                  : lembreteAtivo
                    ? `Ativo por ${descreverCanais(preferencia)}`
                    : 'Lembrete pausado'}
              </h2>

              {preferencia ? (
                <p>
                  {preferencia.nomeRota}
                  {' · '}
                  {descreverAntecedencia(preferencia.antecedenciaHoras)}
                </p>
              ) : (
                <p>Escolha seu bairro e receba um aviso antes de cada coleta.</p>
              )}
            </div>

            <Link
              to="/preferencias"
              className={preferencia ? 'botao botao--secundario' : 'botao botao--primario'}
            >
              {preferencia ? 'Alterar lembrete' : 'Ativar lembrete'}
            </Link>
          </section>

          <nav className="atalhos-conta" aria-label="Atalhos da conta">
            <Link to="/" className="atalho-conta">
              <span className="atalho-conta__icone" aria-hidden="true">
                <Icone nome="busca" />
              </span>

              <span className="atalho-conta__texto">
                <strong>Consultar coleta</strong>
                Dias e horários de qualquer bairro.
              </span>

              <Icone nome="seta" className="atalho-conta__seta" />
            </Link>

            {admin && (
              <Link to="/admin" className="atalho-conta">
                <span className="atalho-conta__icone" aria-hidden="true">
                  <Icone nome="painel" />
                </span>

                <span className="atalho-conta__texto">
                  <strong>Painel administrativo</strong>
                  Rotas, bairros e cronogramas.
                </span>

                <Icone nome="seta" className="atalho-conta__seta" />
              </Link>
            )}
          </nav>

          <SecaoPrivacidade usuario={usuario} />
        </>
      )}
    </main>
  )
}

export default PerfilPage
