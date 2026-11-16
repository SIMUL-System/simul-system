const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()

// No desenvolvimento local, a API usa o proxy do Vite (/api -> localhost:8080).
// Em produção, VITE_API_URL deve apontar para a URL pública do back-end.
const API_URL = (configuredApiUrl || '').replace(/\/+$/, '')

if (!API_URL && !import.meta.env.DEV) {
  throw new Error(
    'API não configurada. Defina VITE_API_URL no ambiente de build do front-end.',
  )
}

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)

    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

function obterMensagemErro(
  data,
  status,
) {
  if (
    data &&
    typeof data === 'object'
  ) {
    if (
      typeof data.detail === 'string' &&
      data.detail.trim()
    ) {
      return data.detail
    }

    if (
      typeof data.mensagem === 'string' &&
      data.mensagem.trim()
    ) {
      return data.mensagem
    }

    if (
      typeof data.message === 'string' &&
      data.message.trim()
    ) {
      return data.message
    }

    if (
      typeof data.title === 'string' &&
      data.title.trim()
    ) {
      return data.title
    }
  }

  if (
    typeof data === 'string' &&
    data.trim()
  ) {
    return data
  }

  return `Erro HTTP ${status}`
}

async function apiRequest(
  path,
  {
    method = 'GET',
    body,
    token,
    headers = {},
  } = {},
) {
  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  }

  if (body !== undefined) {
    requestHeaders['Content-Type'] =
      'application/json'
  }

  if (token) {
    requestHeaders.Authorization =
      `Bearer ${token}`
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      method,
      headers: requestHeaders,
      body:
        body !== undefined
          ? JSON.stringify(body)
          : undefined,
    },
  )

  if (response.status === 204) {
    return null
  }

  const contentType =
    response.headers.get(
      'content-type',
    )

  let data

  if (
    contentType?.includes(
      'application/json',
    ) ||
    contentType?.includes(
      'application/problem+json',
    )
  ) {
    data = await response.json()
  } else {
    const text =
      await response.text()

    data = text || null
  }

  if (!response.ok) {
    const message =
      obterMensagemErro(
        data,
        response.status,
      )

    throw new ApiError(
      message,
      response.status,
      data,
    )
  }

  return data
}

export {
  API_URL,
  ApiError,
  apiRequest,
}
