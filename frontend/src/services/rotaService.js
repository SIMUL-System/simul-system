import {
  apiRequest,
} from './api'

function consultarColeta(
  cidade,
  bairro,
) {
  const parametros =
    new URLSearchParams({
      cidade: cidade.trim(),
      bairro: bairro.trim(),
    })

  return apiRequest(
    `/api/rotas/consulta?${parametros.toString()}`,
  )
}

export {
  consultarColeta,
}