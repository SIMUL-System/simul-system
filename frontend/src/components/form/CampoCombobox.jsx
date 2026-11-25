import { useCallback, useEffect, useId, useRef, useState } from 'react'

import Icone from '../Icone'

import { semAcento } from '../../utils/texto'

// Altura máxima da lista; diminui quando falta espaço na tela.
const ALTURA_MAXIMA_LISTA = 320
const ALTURA_MINIMA_LISTA = 160
const MARGEM_TELA = 16

/** Destaca, em negrito, o trecho do nome que combina com o que foi digitado. */
function TextoDestacado({ texto, busca }) {
  const termo = semAcento(busca.trim())

  if (!termo) {
    return texto
  }

  // semAcento mantém o tamanho do texto, então o índice vale para o original.
  const inicio = semAcento(texto).indexOf(termo)

  if (inicio < 0) {
    return texto
  }

  return (
    <>
      {texto.slice(0, inicio)}
      <mark className="combobox__destaque">{texto.slice(inicio, inicio + termo.length)}</mark>
      {texto.slice(inicio + termo.length)}
    </>
  )
}

/**
 * Campo de escolha com pesquisa (padrão ARIA "combobox" com lista).
 * Digitar filtra as opções sem diferenciar acentos; setas, Enter, Esc, Home e End
 * navegam pela lista. Só valores da lista podem ser escolhidos.
 */
function CampoCombobox({
  id,
  rotulo,
  opcoes,
  valor,
  aoEscolher,
  desabilitado = false,
  placeholder = 'Digite para pesquisar',
  dica,
  idDica,
  mensagemVazia = 'Nenhum resultado encontrado.',
}) {
  const idLista = useId()
  const [busca, setBusca] = useState(valor)
  const [aberto, setAberto] = useState(false)
  const [ativo, setAtivo] = useState(-1)
  const [abrirParaCima, setAbrirParaCima] = useState(false)
  const [alturaLista, setAlturaLista] = useState(ALTURA_MAXIMA_LISTA)

  const campoRef = useRef(null)
  const inputRef = useRef(null)
  const listaRef = useRef(null)

  // Quando o valor muda por fora (troca de cidade, preferência carregada), o texto acompanha.
  const [valorAnterior, setValorAnterior] = useState(valor)

  if (valor !== valorAnterior) {
    setValorAnterior(valor)
    setBusca(valor)
  }

  // Com o valor escolhido no campo, a lista mostra tudo; ao digitar, filtra.
  const filtrando = busca !== valor
  const termo = semAcento(busca.trim())
  const filtradas =
    filtrando && termo ? opcoes.filter((opcao) => semAcento(opcao).includes(termo)) : opcoes

  const posicionarLista = useCallback(() => {
    const caixa = campoRef.current?.getBoundingClientRect()

    if (!caixa) {
      return
    }

    const espacoAbaixo = window.innerHeight - caixa.bottom - MARGEM_TELA
    const espacoAcima = caixa.top - MARGEM_TELA
    const paraCima = espacoAbaixo < ALTURA_MINIMA_LISTA && espacoAcima > espacoAbaixo

    setAbrirParaCima(paraCima)
    setAlturaLista(
      Math.max(
        ALTURA_MINIMA_LISTA,
        Math.min(ALTURA_MAXIMA_LISTA, paraCima ? espacoAcima : espacoAbaixo),
      ),
    )
  }, [])

  function abrir(indiceInicial) {
    if (desabilitado) {
      return
    }

    posicionarLista()
    setAberto(true)
    setAtivo(indiceInicial ?? Math.max(0, opcoes.indexOf(valor)))
  }

  function fechar() {
    setAberto(false)
    setAtivo(-1)
  }

  function escolher(opcao) {
    setBusca(opcao)
    fechar()

    if (opcao !== valor) {
      aoEscolher(opcao)
    }
  }

  function limpar() {
    setBusca('')
    aoEscolher('')
    inputRef.current?.focus()
    abrir(0)
  }

  // Mantém a opção ativa visível ao navegar pelo teclado.
  useEffect(() => {
    if (!aberto || ativo < 0) {
      return
    }

    listaRef.current?.children[ativo]?.scrollIntoView({ block: 'nearest' })
  }, [aberto, ativo])

  // Reposiciona a lista se a janela mudar de tamanho ou rolar com ela aberta.
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

  function handleKeyDown(event) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()

        if (!aberto) {
          abrir()
        } else {
          setAtivo((atual) => Math.min(filtradas.length - 1, atual + 1))
        }

        break
      case 'ArrowUp':
        event.preventDefault()

        if (!aberto) {
          abrir(filtradas.length - 1)
        } else {
          setAtivo((atual) => Math.max(0, atual - 1))
        }

        break
      case 'Home':
      case 'End':
        if (aberto && filtradas.length > 0) {
          event.preventDefault()
          setAtivo(event.key === 'Home' ? 0 : filtradas.length - 1)
        }

        break
      case 'Enter':
        if (aberto && filtradas[ativo]) {
          event.preventDefault()
          escolher(filtradas[ativo])
        }

        break
      case 'Escape':
        if (aberto) {
          event.preventDefault()
          fechar()
        } else if (busca !== valor) {
          setBusca(valor)
        }

        break
      default:
        break
    }
  }

  function handleChange(event) {
    setBusca(event.target.value)

    if (!aberto) {
      posicionarLista()
      setAberto(true)
    }

    setAtivo(0)
  }

  // Ao sair do campo, o texto volta para o valor escolhido (não fica texto solto).
  function handleBlur(event) {
    if (campoRef.current?.contains(event.relatedTarget)) {
      return
    }

    fechar()
    setBusca(valor)
  }

  const idOpcaoAtiva = aberto && filtradas[ativo] ? `${idLista}-${ativo}` : undefined

  return (
    <div className="campo-ds">
      <label className="campo-ds__rotulo" htmlFor={id}>
        {rotulo}
      </label>

      <div
        ref={campoRef}
        className={`combobox${aberto ? ' combobox--aberto' : ''}${abrirParaCima ? ' combobox--acima' : ''}`}
        onBlur={handleBlur}
      >
        <span className="combobox__icone" aria-hidden="true">
          <Icone nome="busca" tamanho={18} />
        </span>

        <input
          ref={inputRef}
          id={id}
          type="text"
          className="campo-ds__controle combobox__entrada"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={aberto}
          aria-controls={idLista}
          aria-activedescendant={idOpcaoAtiva}
          aria-describedby={idDica}
          autoComplete="off"
          spellCheck="false"
          placeholder={placeholder}
          value={busca}
          disabled={desabilitado}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onClick={() => (aberto ? fechar() : abrir())}
        />

        {valor && !desabilitado ? (
          <button
            type="button"
            className="combobox__botao"
            onClick={limpar}
            aria-label={`Limpar ${rotulo.toLowerCase()}`}
          >
            <Icone nome="fechar" tamanho={18} />
          </button>
        ) : (
          <span className="combobox__seta" aria-hidden="true" />
        )}

        <ul
          ref={listaRef}
          id={idLista}
          role="listbox"
          aria-label={rotulo}
          className="combobox__lista"
          style={{ maxHeight: alturaLista }}
          hidden={!aberto}
        >
          {filtradas.length === 0 ? (
            <li className="combobox__vazio" role="presentation">
              {mensagemVazia}
            </li>
          ) : (
            filtradas.map((opcao, indice) => (
              <li
                key={opcao}
                id={`${idLista}-${indice}`}
                role="option"
                aria-selected={opcao === valor}
                className={`combobox__opcao${indice === ativo ? ' combobox__opcao--ativa' : ''}`}
                // mousedown evita que o campo perca o foco antes da escolha.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => escolher(opcao)}
                onMouseMove={() => indice !== ativo && setAtivo(indice)}
              >
                <span className="combobox__texto">
                  <TextoDestacado texto={opcao} busca={filtrando ? busca : ''} />
                </span>

                {opcao === valor && <Icone nome="sucesso" tamanho={16} />}
              </li>
            ))
          )}
        </ul>
      </div>

      {dica && (
        <p id={idDica} className="campo-ds__dica">
          {dica}
        </p>
      )}

      <p className="visualmente-oculto" role="status" aria-live="polite">
        {aberto && filtrando && termo
          ? filtradas.length === 0
            ? mensagemVazia
            : `${filtradas.length} ${filtradas.length === 1 ? 'opção encontrada' : 'opções encontradas'}.`
          : ''}
      </p>
    </div>
  )
}

export default CampoCombobox
