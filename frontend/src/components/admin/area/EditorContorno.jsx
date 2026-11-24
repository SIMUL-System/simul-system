import {
  lazy,
  Suspense,
  useEffect,
  useState,
} from 'react'

import Alerta from '../../Alerta'
import { atualizarGeometriaArea } from '../../../services/adminAreaService'
import { buscarCoordenadasArea } from '../../../services/geocodingService'
import { consultarColeta } from '../../../services/rotaService'
import {
  converterGeoJson,
  validarGeometria,
} from '../../../utils/areas'

const MapaEdicaoArea = lazy(() => import('../../MapaEdicaoArea'))

/**
 * Editor do contorno do bairro, com o mesmo comportamento de antes:
 * parte do contorno salvo no SIMUL; se não houver, do contorno que o
 * OpenStreetMap encontrar; se nada for achado, o mapa abre vazio.
 */
function EditorContorno({
  area,
  onSalvo,
  onCancelar,
}) {
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [origem, setOrigem] = useState(null)
  const [centro, setCentro] = useState({ latitude: null, longitude: null })
  const [geometriaInicial, setGeometriaInicial] = useState(null)
  const [geometriaAtual, setGeometriaAtual] = useState(null)

  useEffect(() => {
    let ativo = true

    Promise.all([
      buscarCoordenadasArea(area.cidade, area.bairro),
      consultarColeta(area.cidade, area.bairro),
    ])
      .then(([localizacao, coleta]) => {
        if (!ativo) return

        if (localizacao) {
          setCentro({
            latitude: localizacao.latitude,
            longitude: localizacao.longitude,
          })
        }

        const doSimul = converterGeoJson(coleta?.geometriaGeoJson)
        const doMapa = validarGeometria(localizacao?.geometria)
        const inicial = doSimul ?? doMapa

        setOrigem(doSimul ? 'simul' : doMapa ? 'osm' : 'vazio')
        setGeometriaInicial(inicial)
        setGeometriaAtual(inicial)
      })
      .catch((error) => {
        if (ativo) {
          setErro(error.message || 'Não foi possível preparar o mapa da área.')
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    return () => {
      ativo = false
    }
  }, [area.cidade, area.bairro])

  async function salvar() {
    const geometria = validarGeometria(geometriaAtual)

    if (!geometria) {
      setErro('Desenhe o contorno do bairro no mapa antes de salvar.')
      return
    }

    setErro('')
    setSalvando(true)

    try {
      await atualizarGeometriaArea(area.id, JSON.stringify(geometria))
      onSalvo(area)
    } catch (error) {
      setErro(error.message || 'Não foi possível salvar o contorno.')
      setSalvando(false)
    }
  }

  const textoOrigem = {
    simul: 'Este é o contorno salvo no SIMUL. Ajuste os pontos e salve.',
    osm: 'Contorno sugerido pelo OpenStreetMap. Confira se cobre o bairro e salve.',
    vazio: 'Nenhum contorno encontrado. Use a ferramenta de polígono do mapa para desenhar.',
  }[origem]

  return (
    <div
      className="editor-contorno"
      aria-busy={carregando || salvando}
    >
      <p
        id="editor-contorno-instrucoes"
        className="editor-contorno__instrucoes"
      >
        Use as ferramentas no canto do mapa para desenhar, mover os pontos
        ou apagar o contorno. Para mover o mapa enquanto desenha, arraste
        com o botão direito.
      </p>

      {carregando ? (
        <div
          className="carregando"
          role="status"
        >
          <span
            className="carregando__spinner"
            aria-hidden="true"
          />
          Preparando o mapa de {area.bairro}…
        </div>
      ) : (
        <>
          {textoOrigem && <Alerta tipo="info">{textoOrigem}</Alerta>}

          <div aria-describedby="editor-contorno-instrucoes">
            <Suspense
              fallback={
                <div
                  className="carregando"
                  role="status"
                >
                  <span
                    className="carregando__spinner"
                    aria-hidden="true"
                  />
                  Carregando o editor do mapa…
                </div>
              }
            >
              <MapaEdicaoArea
                latitude={centro.latitude}
                longitude={centro.longitude}
                geometriaInicial={geometriaInicial}
                aoAlterarGeometria={setGeometriaAtual}
              />
            </Suspense>
          </div>
        </>
      )}

      {erro && <Alerta tipo="erro">{erro}</Alerta>}

      <div className="painel-form__acoes">
        <button
          type="button"
          className="botao botao--primario painel-form__principal"
          onClick={salvar}
          disabled={carregando || salvando || !geometriaAtual}
        >
          {salvando ? 'Salvando contorno…' : 'Salvar contorno'}
        </button>

        <button
          type="button"
          className="botao botao--secundario"
          onClick={onCancelar}
          disabled={salvando}
        >
          Voltar
        </button>
      </div>
    </div>
  )
}

export default EditorContorno
