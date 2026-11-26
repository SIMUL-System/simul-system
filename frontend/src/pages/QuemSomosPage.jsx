import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import '../App.css'
import '../styles/institucional.css'

import Alerta from '../components/Alerta'
import Icone from '../components/Icone'

import { obterToken } from '../services/authService'
import { buscarInstitucional, urlImagem } from '../services/institucionalService'
import { obterUsuarioAtual } from '../services/usuarioService'

/** Quebra o texto em parágrafos nas linhas em branco. */
function Paragrafos({ texto, className }) {
  return String(texto ?? '')
    .split(/\n\s*\n/)
    .map((paragrafo) => paragrafo.trim())
    .filter(Boolean)
    .map((paragrafo, indice) => (
      <p key={indice} className={className}>
        {paragrafo}
      </p>
    ))
}

/** Iniciais para quem ainda não tem foto ("Ana Souza" → "AS"). */
function iniciais(nome) {
  const partes = String(nome ?? '')
    .trim()
    .split(/\s+/)
  return `${partes[0]?.[0] ?? ''}${partes.length > 1 ? partes.at(-1)[0] : ''}`.toUpperCase()
}

/** Página pública "Quem somos": o projeto, onde estudamos e a equipe (editável no painel). */
function QuemSomosPage() {
  const [conteudo, setConteudo] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [admin, setAdmin] = useState(false)

  // A edição desta página fica fora do menu do painel: só o administrador
  // logado vê o atalho "Editar esta página".
  useEffect(() => {
    let ativo = true

    if (obterToken()) {
      obterUsuarioAtual()
        .then((usuario) => {
          if (ativo) setAdmin(usuario?.perfil === 'ADMIN')
        })
        .catch(() => {})
    }

    return () => {
      ativo = false
    }
  }, [])

  useEffect(() => {
    let ativo = true

    buscarInstitucional()
      .then((dados) => {
        if (ativo) setConteudo(dados)
      })
      .catch((error) => {
        if (ativo) setErro(error.message || 'Não foi possível carregar esta página.')
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    return () => {
      ativo = false
    }
  }, [])

  return (
    <main className="quem-somos" aria-labelledby="titulo-quem-somos" aria-busy={carregando}>
      <header className="quem-somos__topo">
        <p className="sobretitulo">Quem somos</p>
        {admin && (
          <Link to="/admin/quem-somos" className="botao botao--secundario quem-somos__editar">
            <Icone nome="painel" tamanho={18} />
            Editar esta página
          </Link>
        )}
        <h1 id="titulo-quem-somos">Coleta seletiva na hora certa</h1>
        {conteudo && <Paragrafos texto={conteudo.sobreProjeto} className="quem-somos__lead" />}
      </header>

      {carregando && (
        <p className="carregando" role="status">
          <span className="carregando__spinner" aria-hidden="true" />
          Carregando…
        </p>
      )}

      {erro && <Alerta tipo="erro">{erro}</Alerta>}

      {conteudo && (
        <>
          <section className="quem-somos__secao" aria-labelledby="titulo-onde-estudamos">
            <div className="quem-somos__instituicao">
              <div>
                <p className="sobretitulo">Onde estudamos</p>
                <h2 id="titulo-onde-estudamos">{conteudo.instituicaoNome}</h2>
                <p className="quem-somos__curso">
                  <Icone nome="info" tamanho={18} />
                  {conteudo.curso}
                </p>
              </div>
              <div className="quem-somos__texto">
                <Paragrafos texto={conteudo.instituicaoTexto} />
              </div>
            </div>

            {conteudo.fotos.length > 0 && (
              <ul className="galeria" aria-label={`Fotos da ${conteudo.instituicaoNome}`}>
                {conteudo.fotos.map((foto) => (
                  <li key={foto.id}>
                    <figure className="galeria__item">
                      <img
                        src={urlImagem(foto.imagemId)}
                        alt={foto.legenda}
                        loading="lazy"
                        decoding="async"
                      />
                      <figcaption>{foto.legenda}</figcaption>
                    </figure>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="quem-somos__secao" aria-labelledby="titulo-equipe">
            <div>
              <p className="sobretitulo">Nossa equipe</p>
              <h2 id="titulo-equipe">Quem fez o SIMUL</h2>
            </div>

            {conteudo.integrantes.length === 0 ? (
              <p className="quem-somos__vazio">A equipe será apresentada aqui em breve.</p>
            ) : (
              <ul className="equipe">
                {conteudo.integrantes.map((pessoa) => (
                  <li key={pessoa.id} className="pessoa">
                    {pessoa.fotoId ? (
                      <img
                        className="pessoa__foto"
                        src={urlImagem(pessoa.fotoId)}
                        alt={`Foto de ${pessoa.nome}`}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className="pessoa__foto pessoa__foto--iniciais" aria-hidden="true">
                        {iniciais(pessoa.nome)}
                      </span>
                    )}

                    <div className="pessoa__dados">
                      <h3 className="pessoa__nome">{pessoa.nome}</h3>
                      <p className="pessoa__funcao">{pessoa.funcao}</p>
                      <Paragrafos texto={pessoa.descricao} className="pessoa__descricao" />

                      {pessoa.link && (
                        <a
                          className="pessoa__link"
                          href={pessoa.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Ver perfil de {pessoa.nome.split(' ')[0]}
                          <span className="visualmente-oculto"> (abre em outra aba)</span>
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <aside className="quem-somos__chamada">
        <p>
          Quer saber quando o caminhão passa no seu bairro? <Link to="/">Consultar a coleta</Link>
        </p>
      </aside>
    </main>
  )
}

export default QuemSomosPage
