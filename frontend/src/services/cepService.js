const VIA_CEP_URL =
  'https://viacep.com.br/ws'

function somenteNumeros(valor) {
  return valor.replace(/\D/g, '')
}

function formatarCep(valor) {
  const numeros =
    somenteNumeros(valor).slice(0, 8)

  if (numeros.length <= 5) {
    return numeros
  }

  return `${numeros.slice(0, 5)}-${numeros.slice(5)}`
}

async function buscarEnderecoPorCep(
  cepInformado,
) {
  const cep =
    somenteNumeros(cepInformado)

  if (!/^\d{8}$/.test(cep)) {
    throw new Error(
      'Informe um CEP válido com 8 números.',
    )
  }

  let response

  try {
    response = await fetch(
      `${VIA_CEP_URL}/${cep}/json/`,
      {
        headers: {
          Accept: 'application/json',
        },
      },
    )
  } catch {
    throw new Error(
      'Não foi possível consultar o CEP. Verifique sua conexão e tente novamente.',
    )
  }

  if (!response.ok) {
    throw new Error(
      'Não foi possível consultar o CEP.',
    )
  }

  const dados =
    await response.json()

  if (dados?.erro) {
    throw new Error(
      'CEP não encontrado.',
    )
  }

  return {
    cep: dados.cep ?? '',
    logradouro:
      dados.logradouro ?? '',
    bairro:
      dados.bairro ?? '',
    cidade:
      dados.localidade ?? '',
    uf:
      dados.uf ?? '',
  }
}

export {
  buscarEnderecoPorCep,
  formatarCep,
  somenteNumeros,
}