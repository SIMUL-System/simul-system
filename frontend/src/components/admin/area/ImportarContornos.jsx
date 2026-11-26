import { useEffect, useRef, useState } from 'react'

import Alerta from '../../Alerta'

import { atualizarGeometriaArea } from '../../../services/adminAreaService'
import { buscarCoordenadasArea } from '../../../services/geocodingService'

import { validarGeometria } from '../../../utils/areas'
import { semAcento } from '../../../utils/texto'

// O OpenStreetMap (Nominatim) pede no máximo uma busca por segundo.
const INTERVALO_MS = 1100

const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms))

/**
 * Busca no OpenStreetMap o contorno dos bairros que ainda não têm desenho
 * e salva os que encontrar. São os mesmos contornos que a consulta pública
 * já mostrava ao vivo; salvos no SIMUL, passam a aparecer no painel e a
 * carregar mais rápido para o morador.
 */
function ImportarContornos({ areas, onConcluido }) {
  const [rodando, setRodando] = useState(false)
  const [progresso, setProgresso] = useState({ feitos: 0, salvos: [], semContorno: [], erros: [] })
  const [terminou, setTerminou] = useState(false)
  const [total, setTotal] = useState(0)
  const cancelarRef = useRef(false)

  const pendentes = areas.filter((area) => !area.possuiGeometria)

  // Se o painel fechar no meio, a importação para.
  useEffect(
    () => () => {
      cancelarRef.current = true
    },
    [],
  )

  async function importar() {
    cancelarRef.current = false
    setRodando(true)
    setTerminou(false)

    const resultado = { feitos: 0, salvos: [], semContorno: [], erros: [] }
    const fila = [...pendentes]
    setProgresso({ ...resultado })
    setTotal(fila.length)

    for (const area of fila) {
      if (cancelarRef.current) break

      try {
        const local = await buscarCoordenadasArea(area.cidade, area.bairro)
        const geometria = validarGeometria(local?.geometria)
        const mesmaCidade =
          !local?.cidadeEncontrada || semAcento(local.cidadeEncontrada) === semAcento(area.cidade)

        if (geometria && mesmaCidade) {
          await atualizarGeometriaArea(area.id, JSON.stringify(geometria))
          resultado.salvos.push(area.bairro)
        } else {
          resultado.semContorno.push(area.bairro)
        }
      } catch {
        resultado.erros.push(area.bairro)
      }

      resultado.feitos += 1
      setProgresso({ ...resultado })

      await esperar(INTERVALO_MS)
    }

    setRodando(false)
    setTerminou(true)

    if (resultado.salvos.length > 0) {
      onConcluido()
    }
  }

  const percentual = total ? Math.round((progresso.feitos / total) * 100) : 0
  const minutos = Math.max(1, Math.ceil((pendentes.length * INTERVALO_MS) / 60000))

  return (
    <div className="painel-form importar-contornos">
      <p className="campo-ds__dica">
        O SIMUL procura o limite oficial de cada bairro no OpenStreetMap, o mapa aberto usado na
        consulta. O que for encontrado é salvo como contorno; o que não existir lá continua{' '}
        <strong>sem desenho</strong> e pode ser desenhado à mão.
      </p>

      {!rodando && !terminou && (
        <>
          <p>
            <strong>{pendentes.length}</strong>{' '}
            {pendentes.length === 1 ? 'bairro está' : 'bairros estão'} sem desenho. A busca leva
            cerca de {minutos} {minutos === 1 ? 'minuto' : 'minutos'} (uma consulta por segundo,
            regra do OpenStreetMap). Deixe esta tela aberta até o fim.
          </p>

          <button
            type="button"
            className="botao botao--primario painel-form__principal"
            onClick={importar}
            disabled={pendentes.length === 0}
          >
            Buscar e salvar contornos
          </button>
        </>
      )}

      {(rodando || terminou) && (
        <div className="importar-contornos__progresso" aria-live="polite">
          <div
            className="barra-progresso"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentual}
            aria-label="Andamento da busca"
          >
            <span style={{ width: `${percentual}%` }} />
          </div>

          <p>
            {progresso.feitos} de {total} verificados · <strong>{progresso.salvos.length}</strong>{' '}
            contornos salvos
          </p>
        </div>
      )}

      {rodando && (
        <button
          type="button"
          className="botao botao--secundario"
          onClick={() => {
            cancelarRef.current = true
          }}
        >
          Parar
        </button>
      )}

      {terminou && (
        <>
          <Alerta tipo={progresso.salvos.length > 0 ? 'sucesso' : 'info'}>
            {progresso.salvos.length > 0
              ? `${progresso.salvos.length} contornos salvos. Eles já aparecem no mapa da consulta e nesta lista como “Desenhada”.`
              : 'Nenhum contorno novo foi encontrado no OpenStreetMap.'}
          </Alerta>

          {progresso.semContorno.length > 0 && (
            <details className="importar-contornos__detalhes">
              <summary>
                {progresso.semContorno.length} sem contorno no OpenStreetMap (desenhe à mão)
              </summary>
              <p>{progresso.semContorno.join(', ')}</p>
            </details>
          )}

          {progresso.erros.length > 0 && (
            <details className="importar-contornos__detalhes">
              <summary>{progresso.erros.length} não puderam ser verificados agora</summary>
              <p>{progresso.erros.join(', ')}. Tente de novo mais tarde.</p>
            </details>
          )}
        </>
      )}
    </div>
  )
}

export default ImportarContornos
