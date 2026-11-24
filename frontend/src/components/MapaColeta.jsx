import { useEffect } from 'react'
import L from 'leaflet'

import {
  Circle,
  CircleMarker,
  GeoJSON,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet'

import 'leaflet/dist/leaflet.css'

import { useCoresTema } from '../hooks/useCoresTema'

const TOKENS_MAPA = ['brand-blue', 'brand-green', 'surface-raised']

/** Enquadra o mapa no contorno do bairro ou, sem contorno, no ponto encontrado. */
function ControlarVisualizacaoMapa({ latitude, longitude, geometriaArea, limitesArea }) {
  const map = useMap()

  useEffect(() => {
    if (geometriaArea) {
      const camada = L.geoJSON(geometriaArea)

      const limites = camada.getBounds()

      if (limites.isValid()) {
        map.fitBounds(limites, {
          padding: [30, 30],
          maxZoom: 16,
          animate: true,
        })

        return
      }
    }

    if (Array.isArray(limitesArea) && limitesArea.length === 2) {
      map.fitBounds(limitesArea, {
        padding: [30, 30],
        maxZoom: 16,
        animate: true,
      })

      return
    }

    if (latitude != null && longitude != null) {
      map.setView([latitude, longitude], 15, {
        animate: true,
      })
    }
  }, [latitude, longitude, geometriaArea, limitesArea, map])

  return null
}

/** Mapa OpenStreetMap da consulta, com o contorno do bairro e a localização do morador. */
function MapaColeta({
  latitude,
  longitude,
  nomeArea,
  carregandoLocalizacao = false,

  geometriaArea,
  limitesArea,

  latitudeUsuario,
  longitudeUsuario,
  precisaoUsuario,
  statusLocalizacaoUsuario,
}) {
  const cores = useCoresTema(TOKENS_MAPA)

  const centroInicial = [-16.708, -49.093]

  const possuiCoordenadasUsuario = latitudeUsuario != null && longitudeUsuario != null

  const localizacaoConfiavel =
    statusLocalizacaoUsuario === 'precisa' || statusLocalizacaoUsuario === 'aproximada'

  const localizacaoImprecisa = statusLocalizacaoUsuario === 'imprecisa'

  const mostrarPinUsuario = possuiCoordenadasUsuario && localizacaoConfiavel

  const mostrarMargemImprecisa = possuiCoordenadasUsuario && localizacaoImprecisa

  const possuiAreaSelecionada = latitude != null && longitude != null

  const latitudeCentral = possuiAreaSelecionada
    ? latitude
    : mostrarPinUsuario
      ? latitudeUsuario
      : null

  const longitudeCentral = possuiAreaSelecionada
    ? longitude
    : mostrarPinUsuario
      ? longitudeUsuario
      : null

  return (
    <section className="mapa" aria-labelledby="titulo-mapa">
      <div className="mapa__cabecalho">
        <h2 id="titulo-mapa" className="titulo-cartao">
          Mapa da área atendida
        </h2>

        <p className="mapa__status" role="status" aria-live="polite">
          {carregandoLocalizacao ? (
            'Localizando a região selecionada…'
          ) : nomeArea ? (
            <>
              Mostrando <strong>{nomeArea}</strong>
            </>
          ) : mostrarPinUsuario ? (
            'Sua localização aparece no mapa. Escolha o bairro para ver a área.'
          ) : localizacaoImprecisa ? (
            'Sua localização está imprecisa demais para ser mostrada.'
          ) : (
            'Escolha uma cidade e um bairro para ver a área atendida.'
          )}
        </p>

        {mostrarMargemImprecisa && (
          <p className="mapa__aviso">
            O dispositivo informou uma margem de erro de cerca de{' '}
            <strong>{Math.round(precisaoUsuario)} metros</strong>, então o SIMUL não marca esse
            ponto como “Você está aqui”.
          </p>
        )}
      </div>

      <div className="mapa__container">
        <MapContainer center={centroInicial} zoom={13} scrollWheelZoom className="mapa__leaflet">
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ControlarVisualizacaoMapa
            latitude={latitudeCentral}
            longitude={longitudeCentral}
            geometriaArea={geometriaArea}
            limitesArea={limitesArea}
          />

          {geometriaArea && (
            <GeoJSON
              key={JSON.stringify(geometriaArea) + cores['brand-blue']}
              data={geometriaArea}
              style={{
                color: cores['brand-blue'],
                fillColor: cores['brand-green'],
                weight: 3,
                fillOpacity: 0.18,
              }}
            >
              {nomeArea && (
                <Popup>
                  <strong>Área consultada</strong>

                  <br />

                  {nomeArea}
                </Popup>
              )}
            </GeoJSON>
          )}

          {mostrarPinUsuario && (
            <>
              {precisaoUsuario > 0 && (
                <Circle
                  center={[latitudeUsuario, longitudeUsuario]}
                  radius={precisaoUsuario}
                  pathOptions={{
                    color: cores['brand-blue'],
                    fillColor: cores['brand-blue'],
                    fillOpacity: 0.08,
                    weight: 1,
                  }}
                />
              )}

              <CircleMarker
                center={[latitudeUsuario, longitudeUsuario]}
                radius={8}
                pathOptions={{
                  color: cores['surface-raised'],
                  fillColor: cores['brand-blue'],
                  fillOpacity: 1,
                  weight: 3,
                }}
              >
                <Popup>
                  <strong>
                    {statusLocalizacaoUsuario === 'precisa'
                      ? 'Você está aqui'
                      : 'Localização aproximada'}
                  </strong>

                  {precisaoUsuario > 0 && (
                    <>
                      <br />
                      Precisão estimada: {Math.round(precisaoUsuario)} metros
                    </>
                  )}
                </Popup>
              </CircleMarker>
            </>
          )}

          {mostrarMargemImprecisa && precisaoUsuario > 0 && (
            <Circle
              center={[latitudeUsuario, longitudeUsuario]}
              radius={precisaoUsuario}
              pathOptions={{
                color: cores['brand-blue'],
                fillColor: cores['brand-blue'],
                fillOpacity: 0.04,
                weight: 1,
              }}
            >
              <Popup>
                <strong>Localização imprecisa</strong>
                <br />
                Margem de erro estimada: {Math.round(precisaoUsuario)} metros.
                <br />
                Selecione sua cidade e bairro manualmente para consultar a coleta.
              </Popup>
            </Circle>
          )}
        </MapContainer>
      </div>
    </section>
  )
}

export default MapaColeta
