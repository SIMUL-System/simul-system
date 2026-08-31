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
  statusLocalizacaoUsuario,
}) {
  const centroInicial = [
    -16.708,
    -49.093,
  ]

  const possuiCoordenadasUsuario =
    latitudeUsuario != null &&
    longitudeUsuario != null

  const localizacaoConfiavel =
    statusLocalizacaoUsuario ===
      'precisa' ||
    statusLocalizacaoUsuario ===
      'aproximada'

  const localizacaoImprecisa =
    statusLocalizacaoUsuario ===
      'imprecisa'

  const mostrarPinUsuario =
    possuiCoordenadasUsuario &&
    localizacaoConfiavel

  const mostrarMargemImprecisa =
    possuiCoordenadasUsuario &&
    localizacaoImprecisa

  const possuiAreaSelecionada =
    latitude != null &&
    longitude != null

  const latitudeCentral =
    possuiAreaSelecionada
      ? latitude
      : mostrarPinUsuario
        ? latitudeUsuario
        : null

  const longitudeCentral =
    possuiAreaSelecionada
      ? longitude
      : mostrarPinUsuario
        ? longitudeUsuario
        : null

  return (
    <section className="mapa-coleta__secao mapa-coleta__card">
      <div className="mapa-coleta__cabecalho">
        <div>
          <span className="consulta-publica__etapa">
            MAPA
          </span>

          <h2>
            Mapa da região
          </h2>
        </div>

        {carregandoLocalizacao ? (
          <p>
            Localizando a região
            selecionada...
          </p>
        ) : nomeArea ? (
          <p>
            Área selecionada:{' '}
            <strong>
              {nomeArea}
            </strong>
          </p>
        ) : mostrarPinUsuario ? (
          <p>
            Sua localização foi encontrada.
          </p>
        ) : localizacaoImprecisa ? (
          <p>
            A localização disponível está
            muito imprecisa para indicar
            onde você está com segurança.
          </p>
        ) : (
          <p>
            Selecione uma cidade e um
            bairro para visualizar a
            região atendida.
          </p>
        )}

        {mostrarMargemImprecisa && (
          <div className="mapa-coleta__aviso">
            O dispositivo informou uma
            margem de erro de aproximadamente{' '}
            <strong>
              {Math.round(
                precisaoUsuario,
              )}{' '}
              metros
            </strong>
            . Por isso o SIMUL não mostra
            essa coordenada como “Você está
            aqui”.
          </div>
        )}
      </div>

      <div className="mapa-coleta__container">
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
                color: '#075fd8',
                fillColor: '#20c745',
                weight: 3,
                fillOpacity: 0.18,
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

          {mostrarPinUsuario && (
            <>
              {precisaoUsuario > 0 && (
                <Circle
                  center={[
                    latitudeUsuario,
                    longitudeUsuario,
                  ]}
                  radius={precisaoUsuario}
                  pathOptions={{
                    color: '#00a9f4',
                    fillColor: '#00a9f4',
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
                pathOptions={{
                  color: '#ffffff',
                  fillColor: '#075fd8',
                  fillOpacity: 1,
                  weight: 3,
                }}
              >
                <Popup>
                  <strong>
                    {statusLocalizacaoUsuario ===
                    'precisa'
                      ? 'Você está aqui'
                      : 'Localização aproximada'}
                  </strong>

                  {precisaoUsuario > 0 && (
                    <>
                      <br />

                      Precisão estimada:{' '}
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

          {mostrarMargemImprecisa &&
            precisaoUsuario > 0 && (
              <Circle
                center={[
                  latitudeUsuario,
                  longitudeUsuario,
                ]}
                radius={precisaoUsuario}
                pathOptions={{
                  color: '#075fd8',
                  fillColor: '#00a9f4',
                  fillOpacity: 0.04,
                  weight: 1,
                }}
              >
                <Popup>
                  <strong>
                    Localização imprecisa
                  </strong>

                  <br />

                  Margem de erro estimada:{' '}
                  {Math.round(
                    precisaoUsuario,
                  )}{' '}
                  metros.

                  <br />

                  Selecione sua cidade e
                  bairro manualmente para
                  consultar a coleta.
                </Popup>
              </Circle>
            )}
        </MapContainer>
      </div>
    </section>
  )
}

export default MapaColeta