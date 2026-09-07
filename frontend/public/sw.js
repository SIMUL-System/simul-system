self.addEventListener(
  'push',
  (event) => {
    let dados = {
      title: 'SIMUL',
      body:
        'Voc\u00ea recebeu uma nova notifica\u00e7\u00e3o.',
    }

    try {
      if (event.data) {
        dados = event.data.json()
      }
    } catch {
      if (event.data) {
        dados.body =
          event.data.text()
      }
    }

    const opcoes = {
      body:
        dados.body ||
        'Voc\u00ea recebeu uma nova notifica\u00e7\u00e3o.',
      icon:
        dados.icon ||
        '/favicon.svg',
      badge:
        dados.badge ||
        '/favicon.svg',
      data: {
        url:
          dados.url ||
          '/',
      },
    }

    event.waitUntil(
      self.registration.showNotification(
        dados.title || 'SIMUL',
        opcoes,
      ),
    )
  },
)

self.addEventListener(
  'notificationclick',
  (event) => {
    event.notification.close()

    const destino =
      event.notification.data?.url ||
      '/'

    event.waitUntil(
      self.clients
        .matchAll({
          type: 'window',
          includeUncontrolled: true,
        })
        .then(
          (janelas) => {
            for (
              const janela
              of janelas
            ) {
              if (
                'focus' in janela
              ) {
                janela.navigate(
                  destino,
                )

                return janela.focus()
              }
            }

            if (
              self.clients.openWindow
            ) {
              return self.clients.openWindow(
                destino,
              )
            }

            return null
          },
        ),
    )
  },
)