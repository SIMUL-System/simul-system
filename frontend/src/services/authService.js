import { apiRequest } from './api'

const TOKEN_KEY = 'simul_token'

async function login(email, senha) {
  const resposta = await apiRequest(
    '/api/auth/login',
    {
      method: 'POST',
      body: {
        email: email.trim(),
        senha,
      },
    },
  )

  if (!resposta?.token) {
    throw new Error(
      'O servidor não retornou um token de autenticação.',
    )
  }

  sessionStorage.setItem(
    TOKEN_KEY,
    resposta.token,
  )

  return resposta
}

function obterToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

function logout() {
  sessionStorage.removeItem(TOKEN_KEY)
}

export {
  login,
  obterToken,
  logout,
}