import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import Alerta from '../../components/Alerta'
import Icone from '../../components/Icone'
import DialogoConfirmacao from '../../components/admin/DialogoConfirmacao'
import PainelLateral from '../../components/admin/PainelLateral'
import CampoFoto from '../../components/admin/institucional/CampoFoto'
import FormIntegrante from '../../components/admin/institucional/FormIntegrante'
import FormTextos from '../../components/admin/institucional/FormTextos'

import {
  adicionarFotoInstituicao,
  atualizarFotoIntegrante,
  atualizarIntegrante,
  atualizarLegendaFoto,
  atualizarTextosInstitucionais,
  buscarInstitucional,
  cadastrarIntegrante,
  removerFotoInstituicao,
  removerFotoIntegrante,
  removerIntegrante,
  reordenarFotosInstituicao,
  reordenarIntegrantes,
  urlImagem,
} from '../../services/institucionalService'

/** Troca o item de posição com o vizinho e devolve a nova lista de ids. */
function moverId(lista, indice, direcao) {
  const ids = lista.map((item) => item.id)
  const destino = indice + direcao
  ;[ids[indice], ids[destino]] = [ids[destino], ids[indice]]
  return ids
}

/** Admin: conteúdo da página pública "Quem somos" (textos, fotos da faculdade e equipe). */
function InstitucionalAdminPage() {
  const [conteudo, setConteudo] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erroCarga, setErroCarga] = useState('')
  const [mensagem, setMensagem] = useState(null)
  const [salvando, setSalvando] = useState(null)
  const [painel, setPainel] = useState(null)
  const [confirmacao, setConfirmacao] = useState(null)

  // Nova foto da faculdade
  const [novaFoto, setNovaFoto] = useState(null)
  const [novaLegenda, setNovaLegenda] = useState('')
  const [chaveNovaFoto, setChaveNovaFoto] = useState(0)
  const [legendas, setLegendas] = useState({})

  useEffect(() => {
    let ativo = true

    buscarInstitucional()
      .then((dados) => {
        if (ativo) setConteudo(dados)
      })
      .catch((error) => {
        if (ativo) setErroCarga(error.message || 'Não foi possível carregar o conteúdo.')
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    return () => {
      ativo = false
    }
  }, [])

  async function recarregar() {
    const dados = await buscarInstitucional()
    setConteudo(dados)
    return dados
  }

  /** Executa uma ação com estado de "salvando" e mensagem de retorno. */
  async function executar(chave, acao, textoSucesso) {
    setSalvando(chave)
    setMensagem(null)

    try {
      await acao()
      await recarregar()
      if (textoSucesso) setMensagem({ tipo: 'sucesso', texto: textoSucesso })
      return true
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: error.message || 'Não foi possível salvar.' })
      return false
    } finally {
      setSalvando(null)
    }
  }

  /* ---------- textos ---------- */

  function salvarTextos(valores) {
    executar(
      'textos',
      () => atualizarTextosInstitucionais(valores),
      'Textos salvos. Já aparecem na página.',
    )
  }

  /* ---------- fotos da faculdade ---------- */

  async function enviarFoto(event) {
    event.preventDefault()

    if (!novaFoto) {
      setMensagem({ tipo: 'erro', texto: 'Escolha uma foto.' })
      return
    }

    if (!novaLegenda.trim()) {
      setMensagem({ tipo: 'erro', texto: 'Escreva a legenda da foto.' })
      return
    }

    const ok = await executar(
      'foto',
      () => adicionarFotoInstituicao(novaFoto, novaLegenda.trim()),
      'Foto adicionada à galeria.',
    )

    if (ok) {
      setNovaFoto(null)
      setNovaLegenda('')
      setChaveNovaFoto((atual) => atual + 1)
    }
  }

  function salvarLegenda(foto) {
    const legenda = (legendas[foto.id] ?? foto.legenda).trim()

    if (!legenda) {
      setMensagem({ tipo: 'erro', texto: 'A legenda não pode ficar vazia.' })
      return
    }

    executar(
      `legenda-${foto.id}`,
      () => atualizarLegendaFoto(foto.id, legenda),
      'Legenda salva.',
    ).then((ok) => {
      if (ok) {
        setLegendas((atual) => {
          const proximo = { ...atual }
          delete proximo[foto.id]
          return proximo
        })
      }
    })
  }

  function moverFoto(indice, direcao) {
    executar('ordem', () => reordenarFotosInstituicao(moverId(conteudo.fotos, indice, direcao)))
  }

  /* ---------- equipe ---------- */

  async function salvarIntegrante(dados, foto) {
    const editando = Boolean(painel?.integrante)

    const ok = await executar(
      'integrante',
      async () => {
        const salvo = editando
          ? await atualizarIntegrante(painel.integrante.id, dados)
          : await cadastrarIntegrante(dados)

        if (foto) {
          await atualizarFotoIntegrante(salvo.id, foto)
        }
      },
      editando ? `${dados.nome} atualizado.` : `${dados.nome} adicionado à equipe.`,
    )

    if (ok) setPainel(null)
  }

  async function tirarFotoIntegrante() {
    const integrante = painel.integrante
    const ok = await executar(
      'integrante',
      () => removerFotoIntegrante(integrante.id),
      'Foto removida.',
    )

    if (ok) setPainel(null)
  }

  function moverIntegrante(indice, direcao) {
    executar('ordem', () => reordenarIntegrantes(moverId(conteudo.integrantes, indice, direcao)))
  }

  /* ---------- remoções (com confirmação) ---------- */

  async function confirmarRemocao() {
    const { tipo, item } = confirmacao
    const ok = await executar(
      'remover',
      () => (tipo === 'foto' ? removerFotoInstituicao(item.id) : removerIntegrante(item.id)),
      tipo === 'foto' ? 'Foto removida.' : `${item.nome} removido da equipe.`,
    )

    setConfirmacao(null)

    return ok
  }

  /* ---------- tela ---------- */

  if (carregando) {
    return (
      <div className="carregando" role="status">
        <span className="carregando__spinner" aria-hidden="true" />
        Carregando conteúdo…
      </div>
    )
  }

  if (erroCarga) {
    return <Alerta tipo="erro">{erroCarga}</Alerta>
  }

  const ocupado = Boolean(salvando)

  return (
    <div className="admin-pagina">
      <header className="admin-pagina__cabecalho">
        <div>
          <h1 className="admin-pagina__titulo">Quem somos</h1>
          <p className="admin-pagina__texto">
            O que aparece na página pública sobre o projeto, a faculdade e a equipe. As mudanças
            entram no ar assim que você salva.
          </p>
        </div>

        <div className="admin-pagina__acoes">
          <Link to="/quem-somos" target="_blank" rel="noopener" className="botao botao--secundario">
            Ver a página
          </Link>
        </div>
      </header>

      {mensagem && <Alerta tipo={mensagem.tipo}>{mensagem.texto}</Alerta>}

      <div className={`admin-area ${painel ? 'admin-area--com-painel' : ''}`}>
        <div className="institucional-admin">
          <section className="admin-quadro bloco-rota" aria-labelledby="titulo-textos">
            <h2 id="titulo-textos" className="bloco-rota__titulo">
              <span className="bloco-rota__numero">1</span> Textos da página
            </h2>

            <FormTextos
              conteudo={conteudo}
              salvando={salvando === 'textos'}
              onSalvar={salvarTextos}
            />
          </section>

          <section className="admin-quadro bloco-rota" aria-labelledby="titulo-fotos">
            <h2 id="titulo-fotos" className="bloco-rota__titulo">
              <span className="bloco-rota__numero">2</span> Fotos da faculdade
              <span className="bloco-rota__contagem">{conteudo.fotos.length}</span>
            </h2>

            <p className="bloco-rota__dica">
              <Icone nome="info" tamanho={18} />
              Fotos na horizontal ficam melhores. A legenda aparece embaixo da foto e é lida por
              quem usa leitor de tela, então descreva o que aparece nela.
            </p>

            {conteudo.fotos.length > 0 && (
              <ul className="fotos-admin">
                {conteudo.fotos.map((foto, indice) => {
                  const legenda = legendas[foto.id] ?? foto.legenda

                  return (
                    <li key={foto.id} className="fotos-admin__item">
                      <img src={urlImagem(foto.imagemId)} alt="" loading="lazy" />

                      <div className="fotos-admin__dados">
                        <label className="campo-ds__rotulo" htmlFor={`legenda-${foto.id}`}>
                          Legenda
                        </label>
                        <input
                          id={`legenda-${foto.id}`}
                          className="campo-ds__controle"
                          maxLength={200}
                          value={legenda}
                          onChange={(event) =>
                            setLegendas((atual) => ({ ...atual, [foto.id]: event.target.value }))
                          }
                          disabled={ocupado}
                        />

                        <div className="fotos-admin__acoes">
                          {legenda !== foto.legenda && (
                            <button
                              type="button"
                              className="botao botao--primario botao--pequeno"
                              onClick={() => salvarLegenda(foto)}
                              disabled={ocupado}
                            >
                              Salvar legenda
                            </button>
                          )}
                          <button
                            type="button"
                            className="botao-icone"
                            onClick={() => moverFoto(indice, -1)}
                            disabled={ocupado || indice === 0}
                            aria-label={`Mover a foto “${foto.legenda}” para antes`}
                          >
                            <Icone nome="voltar" />
                          </button>
                          <button
                            type="button"
                            className="botao-icone fotos-admin__depois"
                            onClick={() => moverFoto(indice, 1)}
                            disabled={ocupado || indice === conteudo.fotos.length - 1}
                            aria-label={`Mover a foto “${foto.legenda}” para depois`}
                          >
                            <Icone nome="voltar" />
                          </button>
                          <button
                            type="button"
                            className="botao botao--texto-perigo botao--pequeno"
                            onClick={() => setConfirmacao({ tipo: 'foto', item: foto })}
                            disabled={ocupado}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}

            <form className="fotos-admin__nova" onSubmit={enviarFoto} noValidate>
              <CampoFoto
                key={chaveNovaFoto}
                rotulo="Nova foto"
                dica="JPG, PNG ou WebP. Fotos grandes são reduzidas automaticamente."
                onEscolher={setNovaFoto}
                disabled={ocupado}
              />

              <div className="campo-ds">
                <label className="campo-ds__rotulo" htmlFor="nova-legenda">
                  Legenda da nova foto
                </label>
                <input
                  id="nova-legenda"
                  className="campo-ds__controle"
                  maxLength={200}
                  placeholder="Ex.: Fachada da Faculdade SENAI FATESG"
                  value={novaLegenda}
                  onChange={(event) => setNovaLegenda(event.target.value)}
                  disabled={ocupado}
                />
              </div>

              <button
                type="submit"
                className="botao botao--primario bloco-rota__salvar"
                disabled={ocupado || !novaFoto}
              >
                {salvando === 'foto' ? 'Enviando…' : 'Adicionar foto'}
              </button>
            </form>
          </section>

          <section className="admin-quadro bloco-rota" aria-labelledby="titulo-equipe-admin">
            <h2 id="titulo-equipe-admin" className="bloco-rota__titulo">
              <span className="bloco-rota__numero">3</span> Equipe
              <span className="bloco-rota__contagem">{conteudo.integrantes.length}</span>
            </h2>

            <p className="bloco-rota__dica">
              <Icone nome="info" tamanho={18} />
              Foto e nome de uma pessoa são dados pessoais: publique só com a autorização de cada
              integrante. Use as setas para mudar a ordem.
            </p>

            {conteudo.integrantes.length === 0 ? (
              <p className="bloco-rota__vazio">Ninguém cadastrado ainda.</p>
            ) : (
              <ul className="equipe-admin">
                {conteudo.integrantes.map((pessoa, indice) => (
                  <li key={pessoa.id} className="equipe-admin__item">
                    {pessoa.fotoId ? (
                      <img src={urlImagem(pessoa.fotoId)} alt="" className="equipe-admin__foto" />
                    ) : (
                      <span
                        className="equipe-admin__foto equipe-admin__foto--vazia"
                        aria-hidden="true"
                      >
                        <Icone nome="usuario" />
                      </span>
                    )}

                    <div className="equipe-admin__dados">
                      <strong>{pessoa.nome}</strong>
                      <span>{pessoa.funcao}</span>
                    </div>

                    <div className="equipe-admin__acoes">
                      <button
                        type="button"
                        className="botao-icone equipe-admin__subir"
                        onClick={() => moverIntegrante(indice, -1)}
                        disabled={ocupado || indice === 0}
                        aria-label={`Subir ${pessoa.nome}`}
                      >
                        <Icone nome="voltar" />
                      </button>
                      <button
                        type="button"
                        className="botao-icone equipe-admin__descer"
                        onClick={() => moverIntegrante(indice, 1)}
                        disabled={ocupado || indice === conteudo.integrantes.length - 1}
                        aria-label={`Descer ${pessoa.nome}`}
                      >
                        <Icone nome="voltar" />
                      </button>
                      <button
                        type="button"
                        className="botao botao--secundario botao--pequeno"
                        onClick={() => {
                          setMensagem(null)
                          setPainel({ integrante: pessoa, chave: `editar-${pessoa.id}` })
                        }}
                        disabled={ocupado}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="botao botao--texto-perigo botao--pequeno"
                        onClick={() => setConfirmacao({ tipo: 'integrante', item: pessoa })}
                        disabled={ocupado}
                      >
                        Remover
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              className="botao botao--primario bloco-rota__salvar"
              onClick={() => {
                setMensagem(null)
                setPainel({ chave: `novo-${Date.now()}` })
              }}
              disabled={ocupado}
            >
              Adicionar integrante
            </button>
          </section>
        </div>

        {painel && (
          <PainelLateral
            titulo={painel.integrante ? `Editar ${painel.integrante.nome}` : 'Novo integrante'}
            chave={painel.chave}
            onFechar={() => setPainel(null)}
          >
            <FormIntegrante
              key={painel.chave}
              integrante={painel.integrante ?? null}
              salvando={salvando === 'integrante'}
              onSalvar={salvarIntegrante}
              onRemoverFoto={tirarFotoIntegrante}
            />
          </PainelLateral>
        )}
      </div>

      <DialogoConfirmacao
        aberto={Boolean(confirmacao)}
        titulo={confirmacao?.tipo === 'foto' ? 'Remover esta foto?' : 'Remover da equipe?'}
        textoConfirmar="Remover"
        textoCancelar="Manter"
        perigo
        processando={salvando === 'remover'}
        onConfirmar={confirmarRemocao}
        onCancelar={() => setConfirmacao(null)}
      >
        {confirmacao && (
          <p>
            {confirmacao.tipo === 'foto' ? (
              <>
                A foto <strong>“{confirmacao.item.legenda}”</strong> sai da página e é apagada.
              </>
            ) : (
              <>
                <strong>{confirmacao.item.nome}</strong> sai da página “Quem somos”, junto com a
                foto e a descrição.
              </>
            )}
          </p>
        )}
      </DialogoConfirmacao>
    </div>
  )
}

export default InstitucionalAdminPage
