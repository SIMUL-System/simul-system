import {
  apiRequest,
} from './api'

import {
  obterToken,
} from './authService'

function converterBase64UrlParaUint8Array(
  base64String,
) {
  const padding =
    '='.repeat(
      (4 -
        (base64String.length %
          4)) %
        4,
    )

  const base64 =
    (
      base64String +
      padding
    )
      .replace(/-/g, '+')
      .replace(/_/g, '/')

  const dadosBrutos =
    window.atob(base64)

  return Uint8Array.from(
    [...dadosBrutos].map(
      (caractere) =>
        caractere.charCodeAt(0),
    ),
  )
}

function webPushSuportado() {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

async function obterChavePublicaVapid() {
  const resposta =
    await apiRequest(
      '/api/notificacoes/push/public-key',
    )

  if (!resposta?.publicKey) {
    throw new Error(
      'O servidor não retornou a chave pública VAPID.',
    )
  }

  return resposta.publicKey
}

async function registrarServiceWorker() {
  if (
    !('serviceWorker' in navigator)
  ) {
    throw new Error(
      'Este navegador não oferece suporte a Service Worker.',
    )
  }

  const registroExistente =
    await navigator.serviceWorker
      .getRegistration('/')

  if (registroExistente) {
    return registroExistente
  }

  return navigator.serviceWorker.register(
    '/sw.js',
    {
      scope: '/',
    },
  )
}

async function obterSubscriptionAtual() {
  if (!webPushSuportado()) {
    return null
  }

  const registro =
    await navigator.serviceWorker
      .getRegistration('/')

  if (!registro) {
    return null
  }

  return registro.pushManager
    .getSubscription()
}

async function solicitarPermissaoNotificacao() {
  if (
    !('Notification' in window)
  ) {
    throw new Error(
      'Este navegador não oferece suporte a notificações.',
    )
  }

  if (
    Notification.permission ===
    'granted'
  ) {
    return 'granted'
  }

  if (
    Notification.permission ===
    'denied'
  ) {
    throw new Error(
      'As notificações estão bloqueadas neste navegador. Libere a permissão nas configurações do site para ativar o Web Push.',
    )
  }

  const permissao =
    await Notification.requestPermission()

  if (
    permissao !== 'granted'
  ) {
    throw new Error(
      'A permissão para notificações não foi concedida.',
    )
  }

  return permissao
}

async function criarSubscription() {
  if (!webPushSuportado()) {
    throw new Error(
      'Web Push não é suportado neste navegador.',
    )
  }

  const registro =
    await registrarServiceWorker()

  await solicitarPermissaoNotificacao()

  const subscriptionExistente =
    await registro.pushManager
      .getSubscription()

  if (subscriptionExistente) {
    return subscriptionExistente
  }

  const chavePublica =
    await obterChavePublicaVapid()

  return registro.pushManager.subscribe({
    userVisibleOnly: true,

    applicationServerKey:
      converterBase64UrlParaUint8Array(
        chavePublica,
      ),
  })
}

function extrairDadosSubscription(
  subscription,
) {
  const dados =
    subscription.toJSON()

  if (
    !dados.endpoint ||
    !dados.keys?.p256dh ||
    !dados.keys?.auth
  ) {
    throw new Error(
      'A subscription do navegador está incompleta.',
    )
  }

  return {
    endpoint:
      dados.endpoint,

    p256dh:
      dados.keys.p256dh,

    auth:
      dados.keys.auth,
  }
}

async function salvarSubscriptionBackend(
  subscription,
) {
  const dados =
    extrairDadosSubscription(
      subscription,
    )

  return apiRequest(
    '/api/notificacoes/push/subscriptions',
    {
      method: 'POST',

      token:
        obterToken(),

      body:
        dados,
    },
  )
}

async function ativarWebPush() {
  const token =
    obterToken()

  if (!token) {
    throw new Error(
      'Faça login para ativar as notificações.',
    )
  }

  const subscription =
    await criarSubscription()

  await salvarSubscriptionBackend(
    subscription,
  )

  return subscription
}

async function desativarWebPush() {
  const subscription =
    await obterSubscriptionAtual()

  if (!subscription) {
    return
  }

  const endpoint =
    subscription.endpoint

  await apiRequest(
    `/api/notificacoes/push/subscriptions?endpoint=${encodeURIComponent(
      endpoint,
    )}`,
    {
      method: 'DELETE',

      token:
        obterToken(),
    },
  )

  await subscription.unsubscribe()
}

export {
  ativarWebPush,
  desativarWebPush,
  obterSubscriptionAtual,
  registrarServiceWorker,
  webPushSuportado,
}