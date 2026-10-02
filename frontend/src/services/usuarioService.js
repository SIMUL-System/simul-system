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

function verificarEmail(token) {
  return apiRequest(
    '/api/usuarios/verificar-email',
    {
      method: 'POST',
      body: {
        token,
      },
    },
  )
}

function reenviarVerificacaoEmail(
  email,
) {
  return apiRequest(
    '/api/usuarios/reenviar-verificacao',
    {
      method: 'POST',
      body: {
        email,
      },
    },
  )
}

function solicitarRecuperacaoSenha(email) {
  return apiRequest('/api/usuarios/recuperar-senha', {
    method: 'POST',
    body: {
      email,
    },
  })
}

function redefinirSenha(dados) {
  return apiRequest(
    '/api/usuarios/redefinir-senha',
    {
      method: 'POST',
      body: dados,
    },
  )
}

export {
  cadastrarUsuario,
  obterUsuarioAtual,
  verificarEmail,
  reenviarVerificacaoEmail,
  solicitarRecuperacaoSenha,
  redefinirSenha,
}