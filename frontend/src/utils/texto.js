/**
 * Funções de texto e dados usadas em várias telas.
 */

/** Ordena em ordem alfabética do português, sem diferenciar maiúsculas e acentos. */
export function ordenarTexto(a, b) {
  return a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })
}

/** Tira espaços das pontas e junta espaços repetidos. */
export function normalizarTexto(valor) {
  return valor.trim().replace(/\s+/g, ' ')
}

/** Minúsculas e sem acento, para comparar e buscar ("São" encontra "sao"). */
export function semAcento(valor) {
  return (valor ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('pt-BR')
}

/** Formato básico de e-mail (a validação definitiva é do back-end). */
export function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)
}

/** Garante uma lista, mesmo quando a API devolve algo inesperado. */
export function comoLista(dados) {
  return Array.isArray(dados) ? dados : []
}
