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

function ControlarVisualizacaoMapa({
  latitude,
  longitude,
  geometriaArea,
  limitesArea,
}) {
  const map = useMap()

  useEffect(() => {
    if (geometriaArea) {
      const camada =
        L.geoJSON(geometriaArea)

      const limites =
        camada.getBounds()

      if (limites.isValid()) {
        map.fitBounds(
          limites,
          {
            padding: [30, 30],
            maxZoom: 16,
            animate: true,
          },
        )

        return
      }
    }

    if (
      Array.isArray(limitesArea) &&
      limitesArea.length === 2
    ) {
      map.fitBounds(
        limitesArea,
        {
          padding: [30, 30],
          maxZoom: 16,
          animate: true,
        },
      )

      return
    }

    if (
      latitude != null &&
      longitude != null
    ) {
      map.setView(
        [latitude, longitude],
        15,
        {
          animate: true,
        },
      )
    }
  }, [
    latitude,
    longitude,
    geometriaArea,
    limitesArea,
    map,
  ])

  return null
}

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
}) {
  const centroInicial = [
    -16.708,
    -49.093,
  ]

  const possuiLocalizacaoUsuario =
    latitudeUsuario != null &&
    longitudeUsuario != null

  const possuiAreaSelecionada =
    latitude != null &&
    longitude != null

  const latitudeCentral =
    possuiAreaSelecionada
      ? latitude
      : latitudeUsuario

  const longitudeCentral =
    possuiAreaSelecionada
      ? longitude
      : longitudeUsuario

  return (
    <section className="mapa-coleta__secao">
      <div className="mapa-coleta__cabecalho">
        <h2>Mapa da região</h2>

        {carregandoLocalizacao ? (
          <p>
            Localizando a região
            selecionada...
          </p>
        ) : nomeArea ? (
          <p>
            Área selecionada: {nomeArea}
          </p>
        ) : possuiLocalizacaoUsuario ? (
          <p>
            Sua localização foi encontrada.
          </p>
        ) : (
          <p>
            Selecione uma cidade e um
            bairro para visualizar a
            região.
          </p>
        )}
      </div>

      <MapContainer
        center={centroInicial}
        zoom={13}
        scrollWheelZoom
        className="mapa-coleta"
      >
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
            key={JSON.stringify(
              geometriaArea,
            )}
            data={geometriaArea}
            style={{
              weight: 3,
              fillOpacity: 0.12,
            }}
          >
            {nomeArea && (
              <Popup>
                <strong>
                  Área consultada
                </strong>

                <br />

                {nomeArea}
              </Popup>
            )}
          </GeoJSON>
        )}

        {possuiLocalizacaoUsuario && (
          <>
            {precisaoUsuario > 0 && (
              <Circle
                center={[
                  latitudeUsuario,
                  longitudeUsuario,
                ]}
                radius={precisaoUsuario}
                pathOptions={{
                  fillOpacity: 0.08,
                  weight: 1,
                }}
              />
            )}

            <CircleMarker
              center={[
                latitudeUsuario,
                longitudeUsuario,
              ]}
              radius={8}
            >
              <Popup>
                <strong>
                  Você está aqui
                </strong>

                {precisaoUsuario > 0 && (
                  <>
                    <br />

                    Precisão aproximada:{' '}
                    {Math.round(
                      precisaoUsuario,
                    )}{' '}
                    metros
                  </>
                )}
              </Popup>
            </CircleMarker>
          </>
        )}
      </MapContainer>
    </section>
  )
}

export default MapaColeta