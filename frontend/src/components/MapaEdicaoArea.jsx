import {
  useEffect,
  useRef,
} from 'react'

import L from 'leaflet'

import {
  MapContainer,
  TileLayer,
  useMap,
} from 'react-leaflet'

import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'

function ControlarCentro({
  latitude,
  longitude,
}) {
  const map = useMap()

  useEffect(() => {
    if (
      latitude == null ||
      longitude == null
    ) {
      return
    }

    map.setView(
      [latitude, longitude],
      15,
      {
        animate: true,
      },
    )
  }, [
    latitude,
    longitude,
    map,
  ])

  return null
}

function ArrastarMapaComBotaoDireito() {
  const map = useMap()

  useEffect(() => {
    const container =
      map.getContainer()

    let arrastando = false

    let ultimaPosicao = null

    function impedirMenuContexto(
      event,
    ) {
      event.preventDefault()
    }

    function iniciarArraste(
      event,
    ) {
      if (event.button !== 2) {
        return
      }

      event.preventDefault()
      event.stopPropagation()

      arrastando = true

      ultimaPosicao = {
        x: event.clientX,
        y: event.clientY,
      }

      container.style.cursor =
        'grabbing'
    }

    function moverMapa(
      event,
    ) {
      if (
        !arrastando ||
        !ultimaPosicao
      ) {
        return
      }

      event.preventDefault()

      const deslocamentoX =
        event.clientX -
        ultimaPosicao.x

      const deslocamentoY =
        event.clientY -
        ultimaPosicao.y

      map.panBy(
        [
          -deslocamentoX,
          -deslocamentoY,
        ],
        {
          animate: false,
        },
      )

      ultimaPosicao = {
        x: event.clientX,
        y: event.clientY,
      }
    }

    function finalizarArraste(
      event,
    ) {
      if (!arrastando) {
        return
      }

      if (
        event &&
        event.button !== 2
      ) {
        return
      }

      arrastando = false
      ultimaPosicao = null

      container.style.cursor = ''
    }

    container.addEventListener(
      'contextmenu',
      impedirMenuContexto,
    )

    container.addEventListener(
      'mousedown',
      iniciarArraste,
    )

    window.addEventListener(
      'mousemove',
      moverMapa,
    )

    window.addEventListener(
      'mouseup',
      finalizarArraste,
    )

    window.addEventListener(
      'blur',
      finalizarArraste,
    )

    return () => {
      container.removeEventListener(
        'contextmenu',
        impedirMenuContexto,
      )

      container.removeEventListener(
        'mousedown',
        iniciarArraste,
      )

      window.removeEventListener(
        'mousemove',
        moverMapa,
      )

      window.removeEventListener(
        'mouseup',
        finalizarArraste,
      )

      window.removeEventListener(
        'blur',
        finalizarArraste,
      )

      container.style.cursor = ''
    }
  }, [map])

  return null
}

function EditorGeometria({
  geometriaInicial,
  aoAlterarGeometria,
}) {
  const map = useMap()

  const camadaRef = useRef(null)

  const callbackRef =
    useRef(aoAlterarGeometria)

  useEffect(() => {
    callbackRef.current =
      aoAlterarGeometria
  }, [aoAlterarGeometria])

  useEffect(() => {
    function informarGeometria(
      layer,
    ) {
      if (!layer) {
        callbackRef.current(null)

        return
      }

      const geoJson =
        layer.toGeoJSON()

      callbackRef.current(
        geoJson.geometry,
      )
    }

    function removerCamadaAtual() {
      if (
        camadaRef.current &&
        map.hasLayer(
          camadaRef.current,
        )
      ) {
        map.removeLayer(
          camadaRef.current,
        )
      }

      camadaRef.current = null
    }

    function configurarEventosCamada(
      layer,
    ) {
      layer.on(
        'pm:edit',
        () => {
          informarGeometria(
            layer,
          )
        },
      )

      layer.on(
        'pm:dragend',
        () => {
          informarGeometria(
            layer,
          )
        },
      )

      layer.on(
        'pm:update',
        () => {
          informarGeometria(
            layer,
          )
        },
      )
    }

    function configurarCamada(
      layer,
    ) {
      removerCamadaAtual()

      camadaRef.current =
        layer

      layer.addTo(map)

      configurarEventosCamada(
        layer,
      )

      informarGeometria(
        layer,
      )
    }

    map.pm.addControls({
      position: 'topleft',

      drawMarker: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawCircle: false,
      drawRectangle: false,
      drawText: false,

      drawPolygon: true,

      editMode: true,
      dragMode: true,
      removalMode: true,

      cutPolygon: false,
      rotateMode: false,
    })

    map.pm.setGlobalOptions({
      snappable: true,
      snapDistance: 20,
      allowSelfIntersection: false,
    })

    function handleCreate(
      event,
    ) {
      const layer =
        event.layer

      if (
        camadaRef.current &&
        camadaRef.current !== layer &&
        map.hasLayer(
          camadaRef.current,
        )
      ) {
        map.removeLayer(
          camadaRef.current,
        )
      }

      camadaRef.current =
        layer

      configurarEventosCamada(
        layer,
      )

      informarGeometria(
        layer,
      )
    }

    function handleRemove(
      event,
    ) {
      if (
        event.layer ===
        camadaRef.current
      ) {
        camadaRef.current =
          null

        callbackRef.current(
          null,
        )
      }
    }

    map.on(
      'pm:create',
      handleCreate,
    )

    map.on(
      'pm:remove',
      handleRemove,
    )

    if (
      geometriaInicial &&
      (
        geometriaInicial.type ===
          'Polygon' ||
        geometriaInicial.type ===
          'MultiPolygon'
      )
    ) {
      const geoJsonLayer =
        L.geoJSON(
          geometriaInicial,
        )

      const layers =
        geoJsonLayer.getLayers()

      if (
        layers.length === 1
      ) {
        configurarCamada(
          layers[0],
        )
      } else if (
        layers.length > 1
      ) {
        geoJsonLayer.addTo(map)

        camadaRef.current =
          geoJsonLayer

        informarGeometria(
          geoJsonLayer,
        )
      }

      try {
        const bounds =
          geoJsonLayer.getBounds()

        if (bounds.isValid()) {
          map.fitBounds(
            bounds,
            {
              padding: [
                30,
                30,
              ],
              maxZoom: 17,
            },
          )
        }
      } catch {
        // Mantém a visualização atual.
      }
    }

    return () => {
      map.off(
        'pm:create',
        handleCreate,
      )

      map.off(
        'pm:remove',
        handleRemove,
      )

      map.pm.removeControls()

      removerCamadaAtual()
    }
  }, [
    geometriaInicial,
    map,
  ])

  return null
}

function MapaEdicaoArea({
  latitude,
  longitude,
  geometriaInicial,
  aoAlterarGeometria,
}) {
  const centroInicial = [
    latitude ?? -16.708,
    longitude ?? -49.093,
  ]

  return (
    <div className="mapa-edicao-area">
      <MapContainer
        center={centroInicial}
        zoom={14}
        className="mapa-coleta"
        scrollWheelZoom
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ControlarCentro
          latitude={latitude}
          longitude={longitude}
        />

        <ArrastarMapaComBotaoDireito />

        <EditorGeometria
          geometriaInicial={
            geometriaInicial
          }
          aoAlterarGeometria={
            aoAlterarGeometria
          }
        />
      </MapContainer>
    </div>
  )
}

export default MapaEdicaoArea