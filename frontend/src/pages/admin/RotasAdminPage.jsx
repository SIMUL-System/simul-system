import { useEffect, useState } from 'react'

import {
  alterarStatusRota,
  atualizarRota,
  criarRota,
  listarRotas,
} from '../../services/adminRotaService'

function RotasAdminPage() {
  const [rotas, setRotas] = useState([])

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [rotaEmEdicao, setRotaEmEdicao] =
    useState(null)

  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  const [carregando, setCarregando] =
    useState(true)

  const [salvando, setSalvando] =
    useState(false)

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
    const dados = await listarRotas()

    setRotas(
      Array.isArray(dados)
        ? dados
        : [],
    )
  }

  function limparFormulario() {
    setNome('')
    setDescricao('')
    setRotaEmEdicao(null)
  }

  function iniciarEdicao(rota) {
    setErro('')
    setSucesso('')

    setRotaEmEdicao(rota)
    setNome(rota.nome ?? '')
    setDescricao(rota.descricao ?? '')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function cancelarEdicao() {
    limparFormulario()
    setErro('')
    setSucesso('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setErro('')
    setSucesso('')

    if (!nome.trim()) {
      setErro('Informe o nome da rota.')
      return
    }

    const dados = {
      nome: nome.trim(),
      descricao: descricao.trim(),
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
        await criarRota(dados)

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

  async function handleAlterarStatus(rota) {
    setErro('')
    setSucesso('')

    const novoStatus = !rota.ativo

    try {
      setAlterandoStatusId(rota.id)

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

  return (
    <>
      <header className="admin-secao__cabecalho">
        <h2>Rotas</h2>

        <p>
          Crie e mantenha as rotas de referência
          usadas para organizar as áreas e os
          cronogramas de coleta.
        </p>
      </header>

      {erro && (
        <div
          className="mensagem mensagem--erro"
          role="alert"
        >
          {erro}
        </div>
      )}

      {sucesso && (
        <div
          className="mensagem mensagem--sucesso"
          role="status"
        >
          {sucesso}
        </div>
      )}

      <section className="resultado">
        <h3>
          {rotaEmEdicao
            ? 'Editar rota'
            : 'Cadastrar nova rota'}
        </h3>

        <form
          className="consulta__formulario"
          onSubmit={handleSubmit}
        >
          <div className="campo">
            <label htmlFor="nomeRota">
              Nome da rota
            </label>

            <input
              id="nomeRota"
              type="text"
              value={nome}
              onChange={(event) =>
                setNome(event.target.value)
              }
              placeholder="Ex.: Rota Jardim Nova Goiânia"
            />
          </div>

          <div className="campo">
            <label htmlFor="descricaoRota">
              Descrição
            </label>

            <textarea
              id="descricaoRota"
              value={descricao}
              onChange={(event) =>
                setDescricao(
                  event.target.value,
                )
              }
              placeholder="Descrição opcional da rota"
              rows="4"
            />
          </div>

          <button
            type="submit"
            disabled={salvando}
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
              onClick={cancelarEdicao}
              disabled={salvando}
            >
              Cancelar edição
            </button>
          )}
        </form>
      </section>

      <section className="resultado">
        <h3>Rotas cadastradas</h3>

        {carregando ? (
          <p>Carregando rotas...</p>
        ) : rotas.length === 0 ? (
          <p>Nenhuma rota cadastrada.</p>
        ) : (
          <div className="lista-rotas">
            {rotas.map((rota) => (
              <article
                className="rota-admin"
                key={rota.id}
              >
                <div className="rota-admin__conteudo">
                  <h3>{rota.nome}</h3>

                  <p>
                    {rota.descricao ||
                      'Sem descrição.'}
                  </p>

                  <p>
                    <strong>Status:</strong>{' '}
                    {rota.ativo
                      ? 'Ativa'
                      : 'Inativa'}
                  </p>
                </div>

                <div className="rota-admin__acoes">
                  <button
                    type="button"
                    onClick={() =>
                      iniciarEdicao(rota)
                    }
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleAlterarStatus(rota)
                    }
                    disabled={
                      alterandoStatusId ===
                      rota.id
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
            ))}
          </div>
        )}
      </section>
    </>
  )
}

export default RotasAdminPage