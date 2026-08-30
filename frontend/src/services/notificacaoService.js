import { apiRequest } from './api'
import { obterToken } from './authService'

function obterPreferencia() {
  return apiRequest(
    '/api/notificacoes/preferencias',
    {
      token: obterToken(),
    },
  )
}

function criarPreferencia(dados) {
  return apiRequest(
    '/api/notificacoes/preferencias',
    {
      method: 'POST',
      token: obterToken(),
      body: dados,
    },
  )
}

function atualizarPreferencia(dados) {
  return apiRequest(
    '/api/notificacoes/preferencias',
    {
      method: 'PUT',
      token: obterToken(),
      body: dados,
    },
  )
}

export {
  obterPreferencia,
  criarPreferencia,
  atualizarPreferencia,
}