import { useCallback, useEffect, useId, useRef, useState } from 'react'

import Icone from '../../Icone'
import { normalizarTexto, semAcento } from '../../../utils/texto'

const ALTURA_MAXIMA_LISTA = 300
const ALTURA_MINIMA_LISTA = 160
const MARGEM_TELA = 16

// Colar "Bairro A, Bairro B" ou uma lista com um bairro por linha adiciona todos.
const SEPARADORES = /[,;\n]+/

/**
 * Seleção múltipla de bairros com pesquisa.
 * - Mostra os bairros da cidade que estão em outras rotas (serão movidos).
 * - Permite cadastrar um bairro novo digitando o nome.
 * - Aceita colar vários nomes de uma vez.
 * Componente controlado: `selecionados` é uma lista de { bairro, novo, rotaOrigem }.
 */
function SeletorBairros({ id, opcoes, naRota, selecionados, onAlterar, disabled }) {
  const idLista = useId()
  const idDica = useId()
  const [busca, setBusca] = useState('')
  const [aberto, setAberto] = useState(false)
  const [ativo, setAtivo] = useState(0)
  const [abrirParaCima, setAbrirParaCima] = useState(false)
  const [alturaLista, setAlturaLista] = useState(ALTURA_MAXIMA_LISTA)
  // Pedido para devolver o foco ao campo depois de adicionar ou remover um bairro.
  // O foco é feito num efeito: as funções chamadas pela lista não leem refs.
  const [pedidoFoco, setPedidoFoco] = useState(0)

  const caixaRef = useRef(null)
  const inputRef = useRef(null)
  const listaRef = useRef(null)

  const chave = (texto) => semAcento(normalizarTexto(texto))
  const jaSelecionados = new Set(selecionados.map((item) => chave(item.bairro)))
  const daRota = new Set(naRota.map(chave))

  const termo = chave(busca)
  const disponiveis = opcoes.filter((opcao) => !jaSelecionados.has(chave(opcao.bairro)))
  const filtradas = termo
    ? disponiveis.filter((opcao) => chave(opcao.bairro).includes(termo))
    : disponiveis

  // Itens da lista: pode começar com "cadastrar novo" e terminar com avisos.
  const nomeDigitado = normalizarTexto(busca)
  const existeIgual =
    opcoes.some((opcao) => chave(opcao.bairro) === termo) ||
    daRota.has(termo) ||
    jaSelecionados.has(termo)
  const itens = []

  filtradas.forEach((opcao) => itens.push({ tipo: 'existente', ...opcao }))

  // "Cadastrar novo" vem por último: primeiro o que já existe, para evitar bairro repetido.
  if (nomeDigitado && !existeIgual) {
    itens.push({ tipo: 'novo', bairro: nomeDigitado })
  }

  const avisoNaRota = termo && daRota.has(termo) ? nomeDigitado : ''

  const posicionarLista = useCallback(() => {
    const caixa = caixaRef.current?.getBoundingClientRect()

    if (!caixa) {
      return
    }

    const abaixo = window.innerHeight - caixa.bottom - MARGEM_TELA
    const acima = caixa.top - MARGEM_TELA
    const paraCima = abaixo < ALTURA_MINIMA_LISTA && acima > abaixo

    setAbrirParaCima(paraCima)
    setAlturaLista(
      Math.max(ALTURA_MINIMA_LISTA, Math.min(ALTURA_MAXIMA_LISTA, paraCima ? acima : abaixo)),
    )
  }, [])

  useEffect(() => {
    if (!aberto) {
      return undefined
    }

    window.addEventListener('resize', posicionarLista)
    window.addEventListener('scroll', posicionarLista, true)

    return () => {
      window.removeEventListener('resize', posicionarLista)
      window.removeEventListener('scroll', posicionarLista, true)
    }
  }, [aberto, posicionarLista])

  useEffect(() => {
    if (aberto) {
      listaRef.current?.children[ativo]?.scrollIntoView({ block: 'nearest' })
    }
  }, [aberto, ativo])

  useEffect(() => {
    if (pedidoFoco > 0) {
      inputRef.current?.focus()
    }
  }, [pedidoFoco])

  function abrir() {
    if (disabled) return
    posicionarLista()
    setAberto(true)
  }

  function adicionar(item) {
    onAlterar([
      ...selecionados,
      item.tipo === 'novo'
        ? { bairro: item.bairro, novo: true, rotaOrigem: null }
        : { bairro: item.bairro, novo: false, rotaOrigem: item.rotaNome },
    ])
    setBusca('')
    setAtivo(0)
    setPedidoFoco((atual) => atual + 1)
  }

  function remover(bairro) {
    onAlterar(selecionados.filter((item) => item.bairro !== bairro))
    setPedidoFoco((atual) => atual + 1)
  }

  /** Transforma nomes soltos em itens: existentes viram "mover", o resto vira "novo". */
  function adicionarVarios(nomes) {
    const novos = []
    const vistos = new Set(jaSelecionados)

    nomes.map(normalizarTexto).forEach((nome) => {
      const k = chave(nome)

      if (!nome || vistos.has(k) || daRota.has(k)) return
      vistos.add(k)

      const existente = opcoes.find((opcao) => chave(opcao.bairro) === k)

      novos.push(
        existente
          ? { bairro: existente.bairro, novo: false, rotaOrigem: existente.rotaNome }
          : { bairro: nome, novo: true, rotaOrigem: null },
      )
    })

    if (novos.length > 0) {
      onAlterar([...selecionados, ...novos])
    }
  }

  function handlePaste(event) {
    const texto = event.clipboardData?.getData('text') ?? ''

    if (SEPARADORES.test(texto)) {
      event.preventDefault()
      adicionarVarios(texto.split(SEPARADORES))
      setBusca('')
    }
  }

  function handleKeyDown(event) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (!aberto) abrir()
        else setAtivo((atual) => Math.min(itens.length - 1, atual + 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setAtivo((atual) => Math.max(0, atual - 1))
        break
      case 'Enter':
        if (aberto && itens[ativo]) {
          event.preventDefault()
          adicionar(itens[ativo])
        }
        break
      case 'Escape':
        if (aberto) {
          event.preventDefault()
          setAberto(false)
        }
        break
      case 'Backspace':
        if (!busca && selecionados.length > 0) {
          remover(selecionados.at(-1).bairro)
        }
        break
      default:
        break
    }
  }

  function handleBlur(event) {
    if (!caixaRef.current?.contains(event.relatedTarget)) {
      setAberto(false)
    }
  }

  const idAtivo = aberto && itens[ativo] ? `${idLista}-${ativo}` : undefined

  return (
    <div className="seletor-bairros">
      <label className="campo-ds__rotulo" htmlFor={id}>
        Adicionar bairros
      </label>

      <div
        ref={caixaRef}
        className={`seletor-bairros__caixa${aberto ? ' combobox--aberto' : ''}${
          abrirParaCima ? ' combobox--acima' : ''
        }${disabled ? ' seletor-bairros__caixa--desabilitada' : ''}`}
        onBlur={handleBlur}
        onClick={() => inputRef.current?.focus()}
      >
        {selecionados.length > 0 && (
          <ul className="seletor-bairros__chips" aria-label="Bairros escolhidos">
            {selecionados.map((item) => (
              <li
                key={item.bairro}
                className={`chip-bairro ${item.novo ? 'chip-bairro--novo' : 'chip-bairro--mover'}`}
              >
                <span className="chip-bairro__nome">{item.bairro}</span>
                <span className="chip-bairro__tipo">{item.novo ? 'novo' : 'mover'}</span>
                <button
                  type="button"
                  className="chip-bairro__remover"
                  onClick={(event) => {
                    event.stopPropagation()
                    remover(item.bairro)
                  }}
                  aria-label={`Tirar ${item.bairro} da seleção`}
                  disabled={disabled}
                >
                  <Icone nome="fechar" tamanho={14} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <input
          ref={inputRef}
          id={id}
          type="text"
          className="seletor-bairros__entrada"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={aberto}
          aria-controls={idLista}
          aria-activedescendant={idAtivo}
          aria-describedby={idDica}
          autoComplete="off"
          spellCheck="false"
          placeholder={
            selecionados.length > 0 ? 'Mais um bairro…' : 'Pesquise ou digite o nome de um bairro'
          }
          value={busca}
          disabled={disabled}
          onChange={(event) => {
            setBusca(event.target.value)
            setAtivo(0)
            if (!aberto) abrir()
          }}
          onFocus={abrir}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />

        <ul
          ref={listaRef}
          id={idLista}
          role="listbox"
          aria-label="Bairros que podem ser adicionados"
          aria-multiselectable="true"
          className="combobox__lista"
          style={{ maxHeight: alturaLista }}
          hidden={!aberto}
        >
          {itens.length === 0 ? (
            <li className="combobox__vazio" role="presentation">
              {avisoNaRota
                ? `“${avisoNaRota}” já está nesta rota.`
                : disponiveis.length === 0
                  ? 'Todos os bairros da cidade já estão nesta rota ou na seleção. Digite um nome para cadastrar um bairro novo.'
                  : 'Nenhum bairro encontrado.'}
            </li>
          ) : (
            itens.map((item, indice) => (
              <li
                key={`${item.tipo}-${item.bairro}`}
                id={`${idLista}-${indice}`}
                role="option"
                aria-selected={false}
                className={`combobox__opcao${indice === ativo ? ' combobox__opcao--ativa' : ''}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => adicionar(item)}
                onMouseMove={() => indice !== ativo && setAtivo(indice)}
              >
                {item.tipo === 'novo' ? (
                  <span className="seletor-bairros__novo">
                    <Icone nome="mais" tamanho={16} />
                    Cadastrar bairro novo: <strong>{item.bairro}</strong>
                  </span>
                ) : (
                  <>
                    <span className="combobox__texto">{item.bairro}</span>
                    <span className="seletor-bairros__origem">{item.rotaNome}</span>
                  </>
                )}
              </li>
            ))
          )}
        </ul>
      </div>

      <p id={idDica} className="campo-ds__dica">
        Enter adiciona. Para vários bairros novos de uma vez, cole os nomes separados por vírgula ou
        um por linha.
      </p>

      <p className="visualmente-oculto" role="status" aria-live="polite">
        {selecionados.length > 0
          ? `${selecionados.length} ${selecionados.length === 1 ? 'bairro escolhido' : 'bairros escolhidos'}.`
          : ''}
      </p>
    </div>
  )
}

export default SeletorBairros
