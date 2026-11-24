const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()

// No desenvolvimento local, a API usa o proxy do Vite (/api -> localhost:8080).
// Em produção, VITE_API_URL deve apontar para a URL pública do back-end.
const API_URL = (configuredApiUrl || '').replace(/\/+$/, '')

if (!API_URL && !import.meta.env.DEV) {
  throw new Error('API não configurada. Defina VITE_API_URL no ambiente de build do front-end.')
}

// Tempo máximo de espera. A Render gratuita "dorme" após 15 min sem uso e
// a primeira resposta pode levar perto de 1 minuto, por isso o limite é alto.
const TEMPO_LIMITE_MS = 75000

// A partir deste tempo a tela avisa que o servidor pode estar acordando.
const AVISO_LENTO_MS = 6000

/** Evento disparado quando uma chamada autenticada recebe 401. */
const EVENTO_SESSAO_EXPIRADA = 'simul:sessao-expirada'

let requisicoesLentas = 0
const ouvintesLentidao = new Set()

/** Informa os inscritos se há requisição demorando. */
function avisarLentidao() {
  const ativo = requisicoesLentas > 0
  ouvintesLentidao.forEach((ouvinte) => ouvinte(ativo))
}

/**
 * Permite a um componente saber se há requisição demorando.
 * Retorna a função que cancela a inscrição.
 */
function inscreverServidorLento(ouvinte) {
  ouvintesLentidao.add(ouvinte)
  ouvinte(requisicoesLentas > 0)

  return () => {
    ouvintesLentidao.delete(ouvinte)
  }
}

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)

    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

/** Mensagem legível de um erro da API (ProblemDetail "detail" primeiro). */
function obterMensagemErro(data, status) {
  if (data && typeof data === 'object') {
    if (typeof data.detail === 'string' && data.detail.trim()) {
      return data.detail
    }

    if (typeof data.mensagem === 'string' && data.mensagem.trim()) {
      return data.mensagem
    }

    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message
    }

    if (typeof data.title === 'string' && data.title.trim()) {
      return data.title
    }
  }

  if (typeof data === 'string' && data.trim()) {
    return data
  }

  return `Erro HTTP ${status}`
}

/** Única porta de saída para a API: JSON, token, tempo-limite, aviso de lentidão e sessão expirada. */
async function apiRequest(path, { method = 'GET', body, token, headers = {} } = {}) {
  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  }

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json'
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`
  }

  const controlador = new AbortController()
  const limite = setTimeout(() => controlador.abort(), TEMPO_LIMITE_MS)

  let marcadaComoLenta = false
  const aviso = setTimeout(() => {
    marcadaComoLenta = true
    requisicoesLentas += 1
    avisarLentidao()
  }, AVISO_LENTO_MS)

  let response

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controlador.signal,
    })
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new ApiError(
        'O servidor demorou demais para responder. Na hospedagem gratuita ele pode levar até 1 minuto para iniciar. Tente de novo.',
        0,
        null,
      )
    }

    throw new ApiError(
      'Não foi possível conectar ao servidor. Verifique sua internet e tente de novo.',
      0,
      null,
    )
  } finally {
    clearTimeout(limite)
    clearTimeout(aviso)

    if (marcadaComoLenta) {
      requisicoesLentas -= 1
      avisarLentidao()
    }
  }

  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type')

  let data

  if (
    contentType?.includes('application/json') ||
    contentType?.includes('application/problem+json')
  ) {
    data = await response.json()
  } else {
    const text = await response.text()

    data = text || null
  }

  // Token vencido ou inválido: avisa o App, que encerra a sessão e leva ao login.
  if (response.status === 401 && token) {
    window.dispatchEvent(new Event(EVENTO_SESSAO_EXPIRADA))
  }

  if (!response.ok) {
    const message = obterMensagemErro(data, response.status)

    throw new ApiError(message, response.status, data)
  }

  return data
}

export { EVENTO_SESSAO_EXPIRADA, inscreverServidorLento, ApiError, apiRequest }
