import {
  useEffect,
  useState,
} from 'react'

import {
  alterarStatusRota,
  atualizarRota,
  criarRota,
  listarRotas,
} from '../../services/adminRotaService'

function RotasAdminPage() {
  const [rotas, setRotas] =
    useState([])

  const [nome, setNome] =
    useState('')

  const [
    descricao,
    setDescricao,
  ] = useState('')

  const [
    rotaEmEdicao,
    setRotaEmEdicao,
  ] = useState(null)

  const [erro, setErro] =
    useState('')

  const [sucesso, setSucesso] =
    useState('')

  const [
    carregando,
    setCarregando,
  ] = useState(true)

  const [
    salvando,
    setSalvando,
  ] = useState(false)

  const [
    alterandoStatusId,
    setAlterandoStatusId,
  ] = useState(null)

  useEffect(() => {
    let componenteAtivo = true

    listarRotas()
      .then((dados) => {
        if (!componenteAtivo) {
          return
        }

        setRotas(
          Array.isArray(dados)
            ? dados
            : [],
        )
      })
      .catch((error) => {
        if (!componenteAtivo) {
          return
        }

        setErro(
          error.message ||
            'Não foi possível carregar as rotas.',
        )
      })
      .finally(() => {
        if (componenteAtivo) {
          setCarregando(false)
        }
      })

    return () => {
      componenteAtivo = false
    }
  }, [])

  async function recarregarRotas() {
    const dados =
      await listarRotas()

    setRotas(
      Array.isArray(dados)
        ? dados
        : [],
    )
  }

  function limparMensagens() {
    setErro('')
    setSucesso('')
  }

  function limparFormulario() {
    setNome('')
    setDescricao('')
    setRotaEmEdicao(null)
  }

  function iniciarEdicao(rota) {
    limparMensagens()

    setRotaEmEdicao(rota)

    setNome(
      rota.nome ?? '',
    )

    setDescricao(
      rota.descricao ?? '',
    )

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function cancelarEdicao() {
    limparFormulario()
    limparMensagens()
  }

  async function handleSubmit(
    event,
  ) {
    event.preventDefault()

    limparMensagens()

    const nomeNormalizado =
      nome
        .trim()
        .replace(/\s+/g, ' ')

    const descricaoNormalizada =
      descricao
        .trim()
        .replace(/\s+/g, ' ')

    if (!nomeNormalizado) {
      setErro(
        'Informe o nome da rota.',
      )

      return
    }

    const rotaDuplicada =
      rotas.find(
        (rota) =>
          rota.id !==
            rotaEmEdicao?.id &&
          rota.nome
            ?.trim()
            .toLocaleLowerCase(
              'pt-BR',
            ) ===
            nomeNormalizado.toLocaleLowerCase(
              'pt-BR',
            ),
      )

    if (rotaDuplicada) {
      setErro(
        'Já existe uma rota cadastrada com esse nome.',
      )

      return
    }

    const dados = {
      nome:
        nomeNormalizado,

      descricao:
        descricaoNormalizada,
    }

    try {
      setSalvando(true)

      if (rotaEmEdicao) {
        await atualizarRota(
          rotaEmEdicao.id,
          dados,
        )

        setSucesso(
          'Rota atualizada com sucesso.',
        )
      } else {
        await criarRota(
          dados,
        )

        setSucesso(
          'Rota cadastrada com sucesso.',
        )
      }

      limparFormulario()

      await recarregarRotas()
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível salvar a rota.',
      )
    } finally {
      setSalvando(false)
    }
  }

  async function handleAlterarStatus(
    rota,
  ) {
    limparMensagens()

    const novoStatus =
      !rota.ativo

    if (!novoStatus) {
      const confirmou =
        window.confirm(
          `Deseja realmente desativar a rota "${rota.nome}"? Áreas e cronogramas relacionados continuarão cadastrados, mas a rota ficará inativa.`,
        )

      if (!confirmou) {
        return
      }
    }

    try {
      setAlterandoStatusId(
        rota.id,
      )

      await alterarStatusRota(
        rota.id,
        novoStatus,
      )

      await recarregarRotas()

      setSucesso(
        novoStatus
          ? 'Rota ativada com sucesso.'
          : 'Rota desativada com sucesso.',
      )
    } catch (error) {
      setErro(
        error.message ||
          'Não foi possível alterar o status da rota.',
      )
    } finally {
      setAlterandoStatusId(null)
    }
  }

  const operacaoEmAndamento =
    salvando ||
    alterandoStatusId !== null

  const totalAtivas =
    rotas.filter(
      (rota) =>
        rota.ativo,
    ).length

  const totalInativas =
    rotas.length -
    totalAtivas

  return (
    <>
      <header
        className="admin-secao__cabecalho"
        aria-labelledby="titulo-rotas-admin"
      >
        <h2 id="titulo-rotas-admin">
          Rotas
        </h2>

        <p>
          Crie e mantenha as rotas de
          referência usadas para
          organizar as áreas e os
          cronogramas de coleta.
        </p>
      </header>

      {erro && (
        <div
          className="mensagem mensagem--erro"
          role="alert"
          aria-live="assertive"
        >
          {erro}
        </div>
      )}

      {sucesso && (
        <div
          className="mensagem mensagem--sucesso"
          role="status"
          aria-live="polite"
        >
          {sucesso}
        </div>
      )}

      <section
        className="resultado"
        aria-labelledby="titulo-formulario-rota"
        aria-busy={salvando}
      >
        <h3 id="titulo-formulario-rota">
          {rotaEmEdicao
            ? 'Editar rota'
            : 'Cadastrar nova rota'}
        </h3>

        <form
          className="consulta__formulario"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="campo">
            <label htmlFor="nomeRota">
              Nome da rota
            </label>

            <input
              id="nomeRota"
              type="text"
              value={nome}
              onChange={(event) => {
                setNome(
                  event.target.value,
                )

                limparMensagens()
              }}
              placeholder="Ex.: Rota Jardim Nova Goiânia"
              autoComplete="off"
              disabled={
                operacaoEmAndamento
              }
              aria-describedby="ajuda-nome-rota"
            />

            <small id="ajuda-nome-rota">
              Use um nome que permita
              identificar facilmente a
              região ou operação da rota.
            </small>
          </div>

          <div className="campo">
            <label htmlFor="descricaoRota">
              Descrição
            </label>

            <textarea
              id="descricaoRota"
              value={descricao}
              onChange={(event) => {
                setDescricao(
                  event.target.value,
                )

                limparMensagens()
              }}
              placeholder="Descrição opcional da rota"
              rows="4"
              disabled={
                operacaoEmAndamento
              }
              aria-describedby="ajuda-descricao-rota"
            />

            <small id="ajuda-descricao-rota">
              Campo opcional para
              observações administrativas
              sobre a rota.
            </small>
          </div>

          <button
            type="submit"
            disabled={
              operacaoEmAndamento
            }
          >
            {salvando
              ? 'Salvando...'
              : rotaEmEdicao
                ? 'Salvar alterações'
                : 'Cadastrar rota'}
          </button>

          {rotaEmEdicao && (
            <button
              type="button"
              onClick={
                cancelarEdicao
              }
              disabled={
                operacaoEmAndamento
              }
            >
              Cancelar edição
            </button>
          )}
        </form>
      </section>

      <section
        className="resultado"
        aria-labelledby="titulo-lista-rotas"
        aria-busy={carregando}
      >
        <h3 id="titulo-lista-rotas">
          Rotas cadastradas
        </h3>

        {!carregando && (
          <div className="resultado__informacoes">
            <p>
              <strong>
                Total:
              </strong>{' '}
              {rotas.length}
            </p>

            <p>
              <strong>
                Ativas:
              </strong>{' '}
              {totalAtivas}
            </p>

            <p>
              <strong>
                Inativas:
              </strong>{' '}
              {totalInativas}
            </p>
          </div>
        )}

        {carregando ? (
          <p
            role="status"
            aria-live="polite"
          >
            Carregando rotas...
          </p>
        ) : rotas.length === 0 ? (
          <p>
            Nenhuma rota cadastrada.
          </p>
        ) : (
          <div className="lista-rotas">
            {rotas.map(
              (rota) => (
                <article
                  className="rota-admin"
                  key={rota.id}
                  aria-labelledby={
                    `rota-${rota.id}`
                  }
                >
                  <div className="rota-admin__conteudo">
                    <h3
                      id={
                        `rota-${rota.id}`
                      }
                    >
                      {rota.nome}
                    </h3>

                    <p>
                      {rota.descricao ||
                        'Sem descrição.'}
                    </p>

                    <p>
                      <strong>
                        Status:
                      </strong>{' '}

                      <span
                        className={
                          rota.ativo
                            ? 'status-admin status-admin--ativo'
                            : 'status-admin status-admin--inativo'
                        }
                      >
                        {rota.ativo
                          ? 'Ativa'
                          : 'Inativa'}
                      </span>
                    </p>
                  </div>

                  <div
                    className="rota-admin__acoes"
                    aria-label={
                      `Ações da rota ${rota.nome}`
                    }
                  >
                    <button
                      type="button"
                      onClick={() =>
                        iniciarEdicao(
                          rota,
                        )
                      }
                      disabled={
                        operacaoEmAndamento
                      }
                      aria-label={
                        `Editar rota ${rota.nome}`
                      }
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleAlterarStatus(
                          rota,
                        )
                      }
                      disabled={
                        operacaoEmAndamento
                      }
                      aria-label={
                        rota.ativo
                          ? `Desativar rota ${rota.nome}`
                          : `Ativar rota ${rota.nome}`
                      }
                    >
                      {alterandoStatusId ===
                      rota.id
                        ? 'Alterando...'
                        : rota.ativo
                          ? 'Desativar'
                          : 'Ativar'}
                    </button>
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </section>
    </>
  )
}

export default RotasAdminPage