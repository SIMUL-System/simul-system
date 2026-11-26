/**
 * Reduz uma foto no próprio navegador antes de enviar: no máximo 1600 px no
 * lado maior, em JPEG. Uma foto de celular (5 MB ou mais) cai para algumas
 * centenas de KB, fica dentro do limite do servidor e carrega rápido para quem
 * visita o site. Também descarta os metadados da câmera (local, aparelho).
 */
export async function prepararFoto(arquivo, ladoMaximo = 1600) {
  if (!arquivo || !arquivo.type.startsWith('image/')) {
    throw new Error('Escolha um arquivo de imagem (JPG, PNG ou WebP).')
  }

  const bitmap = await createImageBitmap(arquivo)
  const escala = Math.min(1, ladoMaximo / Math.max(bitmap.width, bitmap.height))
  const largura = Math.round(bitmap.width * escala)
  const altura = Math.round(bitmap.height * escala)

  const canvas = document.createElement('canvas')
  canvas.width = largura
  canvas.height = altura

  const contexto = canvas.getContext('2d')
  // Fundo branco para PNG com transparência (o JPEG não tem transparência).
  contexto.fillStyle = '#ffffff'
  contexto.fillRect(0, 0, largura, altura)
  contexto.drawImage(bitmap, 0, 0, largura, altura)
  bitmap.close?.()

  return new Promise((resolver, rejeitar) => {
    canvas.toBlob(
      (blob) => (blob ? resolver(blob) : rejeitar(new Error('Não foi possível preparar a foto.'))),
      'image/jpeg',
      0.85,
    )
  })
}
