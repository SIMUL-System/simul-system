import {
  useEffect,
  useState,
} from 'react'

import Icone from '../Icone'

import { MISSOES } from '../../utils/guiaConteudo'

const CHAVE = 'simul-missao-semana'

/** "2026-W48": a missão recomeça toda segunda-feira. */
function semanaAtual() {
  const hoje = new Date()
  const data = new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()))
  const dia = data.getUTCDay() || 7

  data.setUTCDate(data.getUTCDate() + 4 - dia)

  const inicioAno = new Date(Date.UTC(data.getUTCFullYear(), 0, 1))
  const semana = Math.ceil(((data - inicioAno) / 86400000 + 1) / 7)

  return `${data.getUTCFullYear()}-W${semana}`
}

function lerMissao() {
  const semana = semanaAtual()

  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) || 'null')

    if (salvo?.semana === semana && Array.isArray(salvo.feitas)) {
      return {
        semana,
        feitas: salvo.feitas,
      }
    }
  } catch {
    // Armazenamento indisponível: a missão vale só nesta visita.
  }

  return {
    semana,
    feitas: [],
  }
}

/**
 * Missão da semana: hábitos que o morador marca. Fica salva neste
 * navegador (localStorage) e recomeça a cada semana.
 */
function MissaoSemana() {
  const [missao, setMissao] = useState(lerMissao)

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(missao))
    } catch {
      // Sem armazenamento: segue funcionando sem salvar.
    }
  }, [missao])

  function alternar(indice) {
    setMissao((atual) => ({
      ...atual,
      feitas: atual.feitas.includes(indice)
        ? atual.feitas.filter((i) => i !== indice)
        : [...atual.feitas, indice],
    }))
  }

  const total = MISSOES.length
  const concluidas = missao.feitas.length
  const completa = concluidas === total

  return (
    <div className="missao">
      <div className="missao__topo">
        <p
          className="missao__contagem"
          aria-live="polite"
        >
          <strong>
            {concluidas} de {total}
          </strong>{' '}
          hábitos nesta semana
        </p>

        <div
          className="missao__barra"
          role="progressbar"
          aria-label="Progresso da missão da semana"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={concluidas}
        >
          <span style={{ width: `${(concluidas / total) * 100}%` }} />
        </div>
      </div>

      <ul className="missao__lista">
        {MISSOES.map((texto, indice) => {
          const id = `missao-${indice}`
          const feita = missao.feitas.includes(indice)

          return (
            <li
              key={texto}
              className={
                feita
                  ? 'missao__item missao__item--feita'
                  : 'missao__item'
              }
            >
              <input
                id={id}
                type="checkbox"
                checked={feita}
                onChange={() => alternar(indice)}
              />

              <label htmlFor={id}>
                {texto}
              </label>
            </li>
          )
        })}
      </ul>

      {completa && (
        <p
          className="missao__parabens"
          role="status"
        >
          <Icone nome="sucesso" />
          Missão cumprida! Sua casa fez a coleta seletiva
          funcionar nesta semana.
        </p>
      )}

      <p className="missao__nota">
        Suas marcações ficam salvas só neste navegador e
        recomeçam toda segunda-feira.
      </p>
    </div>
  )
}

export default MissaoSemana
