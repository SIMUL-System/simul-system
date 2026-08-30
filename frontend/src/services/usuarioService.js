import { apiRequest } from './api'
import { obterToken } from './authService'

function cadastrarUsuario(dados) {
  return apiRequest('/api/usuarios', {
    method: 'POST',
    body: dados,
  })
}

function obterUsuarioAtual() {
  return apiRequest('/api/usuarios/me', {
    token: obterToken(),
  })
}

export {
  cadastrarUsuario,
  obterUsuarioAtual,
}