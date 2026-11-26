/**
 * Resumo da Visão geral do painel admin, calculado a partir das
 * listas de rotas, áreas e cronogramas (sem chamadas novas à API).
 */

import { DIAS_SEMANA, temHorario } from './cronogramas'
import { ordenarTexto } from './texto'

// Date.getDay(): 0 = domingo … 6 = sábado.
const DIA_POR_GETDAY = ['DOMINGO', 'SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO']

/** Chave da API para o dia de hoje (a partir de Date.getDay()). */
export function diaDeHoje(indiceGetDay) {
  return DIA_POR_GETDAY[indiceGetDay]
}

/** Indicadores, pendências, bairros por rota e coletas por dia. */
export function calcularResumo({ rotas, areas, cronogramas }) {
  const rotasAtivas = rotas.filter((rota) => rota.ativo)
  const idsAtivas = new Set(rotasAtivas.map((rota) => rota.id))

  // Horário só conta para o morador se ele e a rota estiverem ativos.
  const horariosValidos = cronogramas.filter((item) => item.ativo && idsAtivas.has(item.rotaId))

  const cidades = new Set(areas.map((area) => area.cidade?.trim()).filter(Boolean))

  const pendencias = [
    {
      id: 'sem-desenho',
      titulo: 'Áreas sem desenho no mapa',
      texto:
        'O bairro aparece na consulta, mas o mapa usa o contorno do OpenStreetMap, que pode ser impreciso.',
      quantidade: areas.filter((area) => !area.possuiGeometria).length,
      link: '/admin/areas?mapa=sem',
      acao: 'Revisar áreas',
    },
    {
      id: 'sem-horario',
      titulo: 'Rotas ativas sem dia de coleta',
      texto: 'Os bairros dessas rotas aparecem na consulta sem nenhum dia de coleta.',
      quantidade: rotasAtivas.filter(
        (rota) => !horariosValidos.some((item) => item.rotaId === rota.id),
      ).length,
      link: '/admin/cronogramas',
      acao: 'Ver quais são',
    },
    {
      id: 'sem-bairro',
      titulo: 'Rotas ativas sem bairros',
      texto: 'Ninguém encontra essas rotas pela busca de bairro.',
      quantidade: rotasAtivas.filter((rota) => !areas.some((area) => area.rotaId === rota.id))
        .length,
      link: '/admin/rotas',
      acao: 'Adicionar bairros',
    },
    {
      id: 'bairro-rota-inativa',
      titulo: 'Bairros em rotas inativas',
      texto: 'Esses bairros estão fora da consulta enquanto a rota estiver desligada.',
      quantidade: areas.filter((area) => !idsAtivas.has(area.rotaId)).length,
      link: '/admin/rotas',
      acao: 'Ver rotas',
    },
  ]

  // Avisos sobre o que a fonte da prefeitura não informa: não são erros do
  // cadastro, mas o morador vê essa limitação na consulta.
  const avisos = [
    {
      id: 'sem-horario-exato',
      titulo: 'Coletas só com o turno',
      texto:
        'A prefeitura informa diurno ou noturno, sem horário. A consulta mostra o turno e o lembrete usa o começo do turno (06:00 ou 18:00) como referência.',
      quantidade: horariosValidos.filter((item) => !temHorario(item)).length,
      link: '/admin/cronogramas',
      acao: 'Ver agenda',
    },
    {
      id: 'tipo-nao-informado',
      titulo: 'Rotas sem tipo de coleta na fonte',
      texto:
        'A fonte não diz se é a coleta seletiva. A consulta avisa o morador; altere o tipo na rota quando a prefeitura confirmar.',
      quantidade: rotasAtivas.filter((rota) => rota.tipoColeta === 'NAO_INFORMADO').length,
      link: '/admin/rotas',
      acao: 'Ver rotas',
    },
  ].filter((item) => item.quantidade > 0)

  const areasPorRota = rotasAtivas
    .map((rota) => ({
      rota,
      quantidade: areas.filter((area) => area.rotaId === rota.id).length,
    }))
    .sort((a, b) => b.quantidade - a.quantidade || ordenarTexto(a.rota.nome, b.rota.nome))

  const semana = DIAS_SEMANA.map((dia) => ({
    dia,
    rotas: new Set(
      horariosValidos.filter((item) => item.diaSemana === dia.valor).map((item) => item.rotaId),
    ).size,
  }))

  return {
    totalRotas: rotas.length,
    totalRotasAtivas: rotasAtivas.length,
    totalAreas: areas.length,
    totalCidades: cidades.size,
    unicaCidade: cidades.size === 1 ? [...cidades][0] : null,
    totalHorarios: horariosValidos.length,
    pendencias,
    avisos,
    totalPendencias: pendencias.reduce((soma, item) => soma + item.quantidade, 0),
    areasPorRota,
    semana,
  }
}
