import { apiRequest } from './api'

const TOKEN_KEY = 'simul_token'

/** Faz login e guarda o JWT na sessionStorage (some ao fechar a aba). */
async function login(email, senha) {
  const resposta = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: {
      email: email.trim(),
      senha,
    },
  })

  if (!resposta?.token) {
    throw new Error('O servidor não retornou um token de autenticação.')
  }

  sessionStorage.setItem(TOKEN_KEY, resposta.token)

  return resposta
}

/** JWT da sessão atual, se houver. */
function obterToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

/** Apaga o JWT da sessão. */
function logout() {
  sessionStorage.removeItem(TOKEN_KEY)
}

export { login, obterToken, logout }
