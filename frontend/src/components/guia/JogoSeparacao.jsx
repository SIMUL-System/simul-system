import {
  useEffect,
  useRef,
  useState,
} from 'react'

import { Link } from 'react-router-dom'

import Icone from '../Icone'
import Lixeira from './Lixeira'

import {
  ITENS_JOGO,
  ITENS_POR_RODADA,
  LIXEIRAS,
  NIVEIS,
} from '../../utils/guiaConteudo'

function sortearRodada() {
  const copia = [...ITENS_JOGO]

  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))

    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }

  return copia.slice(0, ITENS_POR_RODADA)
}

function nomeLixeira(id) {
  return LIXEIRAS.find((l) => l.id === id)?.nome || id
}

/**
 * Jogo "Para onde vai?": um item por vez, o morador escolhe a lixeira.
 * Funciona por toque, mouse e teclado (botões nativos); o retorno é
 * anunciado por aria-live.
 */
function JogoSeparacao() {
  const [fase, setFase] = useState('inicio')
  const [rodada, setRodada] = useState([])
  const [indice, setIndice] = useState(0)
  const [acertos, setAcertos] = useState(0)
  const [resposta, setResposta] = useState(null)

  const retornoRef = useRef(null)
  const itemRef = useRef(null)
  const fimRef = useRef(null)

  const item = rodada[indice]

  // Leva o foco para o próximo conteúdo relevante.
  useEffect(() => {
    if (fase === 'fim') {
      fimRef.current?.focus()
    } else if (fase === 'jogando' && resposta) {
      retornoRef.current?.focus()
    } else if (fase === 'jogando') {
      itemRef.current?.focus()
    }
  }, [fase, resposta, indice])

  function comecar() {
    setRodada(sortearRodada())
    setIndice(0)
    setAcertos(0)
    setResposta(null)
    setFase('jogando')
  }

  function escolher(idLixeira) {
    if (resposta) {
      return
    }

    const acertou = idLixeira === item.destino

    if (acertou) {
      setAcertos((total) => total + 1)
    }

    setResposta({
      escolhida: idLixeira,
      acertou,
    })
  }

  function proximo() {
    if (indice + 1 >= rodada.length) {
      setFase('fim')
      return
    }

    setIndice((atual) => atual + 1)
    setResposta(null)
  }

  if (fase === 'inicio') {
    return (
      <div className="jogo jogo--inicio">
        <div
          className="jogo__turma"
          aria-hidden="true"
        >
          {LIXEIRAS.slice(0, 5).map((l, i) => (
            <Lixeira
              key={l.id}
              cor={l.cor}
              humor={i % 2 === 0 ? 'feliz' : 'neutro'}
              tamanho={56}
            />
          ))}
        </div>

        <p className="jogo__convite">
          As lixeiras estão com fome, mas cada uma só come
          um tipo de coisa. Ajude a turma a separar{' '}
          {ITENS_POR_RODADA} itens!
        </p>

        <button
          type="button"
          className="botao botao--primario botao--grande"
          onClick={comecar}
        >
          Começar o jogo
        </button>
      </div>
    )
  }

  if (fase === 'fim') {
    const nivel = [...NIVEIS]
      .reverse()
      .find((n) => acertos >= n.minimo)

    const porcentagem = Math.round(
      (acertos / rodada.length) * 100,
    )

    return (
      <div
        className="jogo jogo--fim"
        ref={fimRef}
        tabIndex="-1"
        aria-labelledby="titulo-fim-jogo"
      >
        <div
          className="jogo__placar"
          style={{ '--porcentagem': `${porcentagem}%` }}
          aria-hidden="true"
        >
          <span>
            {acertos}/{rodada.length}
          </span>
        </div>

        <h3
          id="titulo-fim-jogo"
          className="jogo__nivel"
        >
          {nivel.titulo}
        </h3>

        <p>
          Você acertou {acertos} de {rodada.length}.{' '}
          {nivel.texto}
        </p>

        <p className="jogo__impacto">
          <Icone
            nome="sucesso"
            tamanho={20}
          />
          {acertos === 1
            ? '1 item foi para o lugar certo em vez do aterro.'
            : `${acertos} itens foram para o lugar certo em vez do aterro.`}
        </p>

        <div className="jogo__acoes">
          <button
            type="button"
            className="botao botao--primario"
            onClick={comecar}
          >
            Jogar de novo
          </button>

          <Link
            to="/"
            className="botao botao--secundario"
          >
            Ver a coleta do meu bairro
          </Link>
        </div>
      </div>
    )
  }

  const destinoCorreto = item.destino

  return (
    <div className="jogo">
      <div className="jogo__barra">
        <span>
          Item {indice + 1} de {rodada.length}
        </span>

        <span className="jogo__acertos">
          <Icone
            nome="sucesso"
            tamanho={18}
          />
          {acertos} {acertos === 1 ? 'acerto' : 'acertos'}
        </span>
      </div>

      <div
        className="jogo__progresso"
        aria-hidden="true"
      >
        <span
          style={{
            width: `${((indice + (resposta ? 1 : 0)) / rodada.length) * 100}%`,
          }}
        />
      </div>

      <div
        className={
          resposta
            ? resposta.acertou
              ? 'jogo__item jogo__item--certo'
              : 'jogo__item jogo__item--errado'
            : 'jogo__item'
        }
        ref={itemRef}
        tabIndex="-1"
      >
        <p className="jogo__pergunta">
          Para onde vai…
        </p>

        <p className="jogo__nome-item">
          {item.nome}?
        </p>
      </div>

      <div
        className="jogo__lixeiras"
        role="group"
        aria-label="Escolha a lixeira"
      >
        {LIXEIRAS.map((lixeira) => {
          let humor = 'neutro'

          if (resposta) {
            if (lixeira.id === destinoCorreto) {
              humor = 'feliz'
            } else if (lixeira.id === resposta.escolhida) {
              humor = 'triste'
            }
          }

          const classes = [
            'jogo__lixeira',
            resposta && lixeira.id === destinoCorreto && 'jogo__lixeira--certa',
            resposta &&
              lixeira.id === resposta.escolhida &&
              !resposta.acertou &&
              'jogo__lixeira--errada',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <button
              key={lixeira.id}
              type="button"
              className={classes}
              onClick={() => escolher(lixeira.id)}
              disabled={Boolean(resposta)}
              aria-label={`Lixeira ${lixeira.nome}`}
            >
              <Lixeira
                cor={lixeira.cor}
                humor={humor}
                tamanho={56}
              />

              <span className="jogo__lixeira-nome">
                {lixeira.nome}
              </span>
            </button>
          )
        })}
      </div>

      <div
        className="jogo__retorno-area"
        aria-live="polite"
      >
        {resposta && (
          <div
            className={
              resposta.acertou
                ? 'jogo__retorno jogo__retorno--certo'
                : 'jogo__retorno jogo__retorno--errado'
            }
            ref={retornoRef}
            tabIndex="-1"
          >
            <p className="jogo__veredito">
              <Icone
                nome={resposta.acertou ? 'sucesso' : 'erro'}
              />
              {resposta.acertou
                ? 'Acertou! +1 item salvo do aterro'
                : `Quase! O certo é: ${nomeLixeira(destinoCorreto)}`}
            </p>

            <p>{item.explicacao}</p>

            <button
              type="button"
              className="botao botao--primario"
              onClick={proximo}
            >
              {indice + 1 >= rodada.length
                ? 'Ver meu resultado'
                : 'Próximo item'}
              <Icone
                nome="seta"
                tamanho={18}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default JogoSeparacao
