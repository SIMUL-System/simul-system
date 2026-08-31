const NOMINATIM_URL =
  'https://nominatim.openstreetmap.org'

const cacheLocalizacoes = new Map()

async function buscarCoordenadasArea(
  cidade,
  bairro,
) {
  if (!cidade || !bairro) {
    return null
  }

  const chaveCache =
    `${cidade}|${bairro}`.toLowerCase()

  if (
    cacheLocalizacoes.has(chaveCache)
  ) {
    return cacheLocalizacoes.get(
      chaveCache,
    )
  }

  const parametros =
    new URLSearchParams({
      q: `${bairro}, ${cidade}, Goiás, Brasil`,
      format: 'jsonv2',
      limit: '1',
      countrycodes: 'br',
      polygon_geojson: '1',
      addressdetails: '1',
    })

  const resposta = await fetch(
    `${NOMINATIM_URL}/search?${parametros.toString()}`,
    {
      headers: {
        Accept: 'application/json',
      },
    },
  )

  if (!resposta.ok) {
    throw new Error(
      'Não foi possível localizar a região no mapa.',
    )
  }

  const dados =
    await resposta.json()

  if (
    !Array.isArray(dados) ||
    dados.length === 0
  ) {
    return null
  }

  const resultado = dados[0]

  const boundingBox =
    Array.isArray(
      resultado.boundingbox,
    ) &&
    resultado.boundingbox.length === 4
      ? [
          [
            Number(
              resultado.boundingbox[0],
            ),
            Number(
              resultado.boundingbox[2],
            ),
          ],
          [
            Number(
              resultado.boundingbox[1],
            ),
            Number(
              resultado.boundingbox[3],
            ),
          ],
        ]
      : null

  const localizacao = {
    latitude: Number(resultado.lat),
    longitude: Number(resultado.lon),
    nome: resultado.display_name,
    geometria:
      resultado.geojson ?? null,
    boundingBox,
  }

  cacheLocalizacoes.set(
    chaveCache,
    localizacao,
  )

  return localizacao
}

export {
  buscarCoordenadasArea,
}