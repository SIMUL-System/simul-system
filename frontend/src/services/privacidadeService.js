import { apiRequest } from './api'
import { obterToken } from './authService'

/** GET /api/usuarios/me/dados: cópia dos dados pessoais (LGPD). */
function baixarMeusDados() {
  return apiRequest('/api/usuarios/me/dados', { token: obterToken() })
}

/** DELETE /api/usuarios/me: exclui a conta (pede a senha). */
function excluirMinhaConta(senha) {
  return apiRequest('/api/usuarios/me', { method: 'DELETE', token: obterToken(), body: { senha } })
}

/** PUT /api/usuarios/me/termos: aceite da versão atual dos termos. */
function aceitarTermos(versao) {
  return apiRequest('/api/usuarios/me/termos', {
    method: 'PUT',
    token: obterToken(),
    body: { versao },
  })
}

export { baixarMeusDados, excluirMinhaConta, aceitarTermos }
