/**
 * Cidade escolhida no painel admin, guardada no navegador para continuar
 * a mesma ao trocar de página ou recarregar. O armazenamento pode falhar
 * (modo privado, bloqueio): nesse caso o painel só não lembra a escolha.
 */

const CHAVE = 'simul.admin.cidade'

export function lerCidadeSalva() {
  try {
    const valor = Number(window.localStorage.getItem(CHAVE))
    return Number.isInteger(valor) && valor > 0 ? valor : null
  } catch {
    return null
  }
}

export function salvarCidade(id) {
  try {
    window.localStorage.setItem(CHAVE, String(id))
  } catch {
    // Sem armazenamento: a escolha vale só enquanto a página estiver aberta.
  }
}

/** Cidade inicial: a salva, se ainda existir; senão a com mais bairros. */
export function escolherCidadeInicial(cidades, idSalvo) {
  if (cidades.length === 0) return null

  return (
    cidades.find((cidade) => cidade.id === idSalvo) ??
    [...cidades].sort((a, b) => b.bairros - a.bairros || a.nome.localeCompare(b.nome, 'pt-BR'))[0]
  )
}
