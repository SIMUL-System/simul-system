import { apiRequest } from './api'

/** GET /api/rotas/areas (público): cidades e bairros de rotas ativas */
function listarAreasDisponiveis() {
  return apiRequest('/api/rotas/areas')
}

/** GET /api/rotas/consulta (público): rota, contorno e horários do bairro */
function consultarColeta(cidade, bairro) {
  const parametros = new URLSearchParams({
    cidade: cidade.trim(),
    bairro: bairro.trim(),
  })

  return apiRequest(`/api/rotas/consulta?${parametros.toString()}`)
}

export { listarAreasDisponiveis, consultarColeta }
