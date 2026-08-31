import { apiRequest } from './api'

function listarAreasDisponiveis() {
  return apiRequest('/api/rotas/areas')
}

function consultarColeta(cidade, bairro) {
  const parametros = new URLSearchParams({
    cidade: cidade.trim(),
    bairro: bairro.trim(),
  })

  return apiRequest(
    `/api/rotas/consulta?${parametros.toString()}`,
  )
}

export {
  listarAreasDisponiveis,
  consultarColeta,
}