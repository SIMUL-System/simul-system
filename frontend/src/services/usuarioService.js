import { apiRequest } from './api'
import { obterToken } from './authService'

/** POST /api/usuarios */
function cadastrarUsuario(dados) {
  return apiRequest('/api/usuarios', {
    method: 'POST',
    body: dados,
  })
}

/** GET /api/usuarios/me */
function obterUsuarioAtual() {
  return apiRequest('/api/usuarios/me', {
    token: obterToken(),
  })
}

/** POST /api/usuarios/verificar-email */
function verificarEmail(token) {
  return apiRequest('/api/usuarios/verificar-email', {
    method: 'POST',
    body: {
      token,
    },
  })
}

/** POST /api/usuarios/reenviar-verificacao */
function reenviarVerificacaoEmail(email) {
  return apiRequest('/api/usuarios/reenviar-verificacao', {
    method: 'POST',
    body: {
      email,
    },
  })
}

/** POST /api/usuarios/recuperar-senha */
function solicitarRecuperacaoSenha(email) {
  return apiRequest('/api/usuarios/recuperar-senha', {
    method: 'POST',
    body: {
      email,
    },
  })
}

/** POST /api/usuarios/redefinir-senha */
function redefinirSenha(dados) {
  return apiRequest('/api/usuarios/redefinir-senha', {
    method: 'POST',
    body: dados,
  })
}

export {
  cadastrarUsuario,
  obterUsuarioAtual,
  verificarEmail,
  reenviarVerificacaoEmail,
  solicitarRecuperacaoSenha,
  redefinirSenha,
}
