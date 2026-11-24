/**
 * Conteúdo do Guia de descarte consciente (RF08).
 * Texto em linguagem simples, revisável pela equipe sem mexer nos
 * componentes. Fontes: Resolução CONAMA nº 275/2001 (cores),
 * listas de materiais não recicláveis de órgãos públicos e dados
 * da Associação Brasileira do Alumínio (ABAL).
 */

export const LIXEIRAS = [
  {
    id: 'papel',
    nome: 'Papel',
    cor: 'recycle-paper',
    textoCor: 'on-brand',
  },
  {
    id: 'plastico',
    nome: 'Plástico',
    cor: 'recycle-plastic',
    textoCor: 'on-brand',
  },
  {
    id: 'vidro',
    nome: 'Vidro',
    cor: 'recycle-glass',
    textoCor: 'on-brand',
  },
  {
    id: 'metal',
    nome: 'Metal',
    cor: 'recycle-metal',
    textoCor: 'on-accent',
  },
  {
    id: 'organico',
    nome: 'Orgânico',
    cor: 'recycle-organic',
    textoCor: 'on-brand',
  },
  {
    id: 'rejeito',
    nome: 'Não reciclável',
    cor: 'recycle-rejeito',
    textoCor: 'on-brand',
  },
  {
    id: 'entrega',
    nome: 'Ponto de entrega',
    cor: 'recycle-especial',
    textoCor: 'on-brand',
  },
]

/** Itens do jogo "Para onde vai?". */
export const ITENS_JOGO = [
  {
    nome: 'Garrafa PET',
    destino: 'plastico',
    explicacao: 'Plástico! Esvazie, tampe e amasse para ocupar menos espaço.',
  },
  {
    nome: 'Caixa de papelão',
    destino: 'papel',
    explicacao: 'Papel! Desmonte a caixa antes de guardar.',
  },
  {
    nome: 'Lata de refrigerante',
    destino: 'metal',
    explicacao: 'Metal! O alumínio pode ser reciclado de novo e de novo, sem perder qualidade.',
  },
  {
    nome: 'Pote de geleia de vidro',
    destino: 'vidro',
    explicacao: 'Vidro! Tire os restos e separe a tampa, que é de metal.',
  },
  {
    nome: 'Casca de banana',
    destino: 'organico',
    explicacao: 'Orgânico! Restos de comida podem virar adubo na compostagem.',
  },
  {
    nome: 'Guardanapo sujo de gordura',
    destino: 'rejeito',
    explicacao: 'Não reciclável. A gordura estraga a reciclagem do papel.',
  },
  {
    nome: 'Espelho quebrado',
    destino: 'rejeito',
    explicacao: 'Não reciclável. Espelho não é reciclado como vidro comum. Embrulhe em jornal para ninguém se cortar.',
  },
  {
    nome: 'Jornal velho',
    destino: 'papel',
    explicacao: 'Papel! Jornais e revistas secos vão para a reciclagem.',
  },
  {
    nome: 'Pacote de salgadinho',
    destino: 'rejeito',
    explicacao: 'Não reciclável na coleta comum. A embalagem é metalizada (plástico com alumínio).',
  },
  {
    nome: 'Pilha usada',
    destino: 'entrega',
    explicacao: 'Ponto de entrega! Pilhas têm substâncias tóxicas e vão para coletores em lojas e supermercados.',
  },
  {
    nome: 'Pote de iogurte',
    destino: 'plastico',
    explicacao: 'Plástico! Tire os restos com uma colher e dê um enxágue rápido.',
  },
  {
    nome: 'Lata de sardinha',
    destino: 'metal',
    explicacao: 'Metal! Latas de aço também são recicladas.',
  },
  {
    nome: 'Garrafa de vidro',
    destino: 'vidro',
    explicacao: 'Vidro! Garrafas inteiras são recicladas muitas vezes.',
  },
  {
    nome: 'Borra de café',
    destino: 'organico',
    explicacao: 'Orgânico! A borra de café é ótima para adubar plantas.',
  },
  {
    nome: 'Lâmpada fluorescente',
    destino: 'entrega',
    explicacao: 'Ponto de entrega! Lâmpadas têm mercúrio e não vão no lixo comum.',
  },
  {
    nome: 'Esponja de aço',
    destino: 'rejeito',
    explicacao: 'Não reciclável. Mesmo sendo metal, a esponja usada não é aproveitada.',
  },
]

export const ITENS_POR_RODADA = 8

/** Níveis do placar final, do menor para o maior. */
export const NIVEIS = [
  {
    minimo: 0,
    titulo: 'Aprendiz da reciclagem',
    texto: 'Todo mundo começa assim. Jogue de novo: cada acerto é um item a menos no aterro.',
  },
  {
    minimo: 5,
    titulo: 'Guardião da coleta',
    texto: 'Muito bem! Você já separa quase tudo no lugar certo.',
  },
  {
    minimo: 8,
    titulo: 'Herói do bairro',
    texto: 'Perfeito! Com gente como você, a coleta seletiva funciona de verdade.',
  },
]

export const PASSOS = [
  {
    titulo: 'Separe',
    texto: 'Recicláveis de um lado; restos de comida e lixo comum do outro.',
  },
  {
    titulo: 'Esvazie',
    texto: 'Tire os restos e dê um enxágue rápido, sem desperdiçar água.',
  },
  {
    titulo: 'Amasse',
    texto: 'Latas, garrafas e caixas amassadas ocupam bem menos espaço.',
  },
  {
    titulo: 'No horário',
    texto: 'Coloque na calçada no dia da coleta, perto do horário de início.',
  },
]

/** Cartões de material: o que vai e o que não vai. */
export const MATERIAIS = [
  {
    id: 'papel',
    nome: 'Papel e papelão',
    cor: 'recycle-paper',
    vai: ['Caixas de papelão', 'Jornais e revistas', 'Folhas e cadernos', 'Caixas de leite (longa vida)'],
    naoVai: ['Guardanapo e papel engordurado', 'Papel higiênico', 'Fotografias', 'Etiquetas adesivas'],
    dica: 'Mantenha o papel seco. Papel molhado ou com gordura não é reciclado.',
  },
  {
    id: 'plastico',
    nome: 'Plástico',
    cor: 'recycle-plastic',
    vai: ['Garrafas PET', 'Potes e tampas', 'Embalagens de produtos de limpeza', 'Sacolas limpas'],
    naoVai: ['Embalagens metalizadas (salgadinho, café)', 'Cabos de panela', 'Isopor sujo'],
    dica: 'Isopor limpo é reciclável, mas nem toda cidade recolhe. Confira as regras da sua cidade.',
  },
  {
    id: 'vidro',
    nome: 'Vidro',
    cor: 'recycle-glass',
    vai: ['Garrafas', 'Potes de conserva e geleia', 'Frascos'],
    naoVai: ['Espelhos', 'Cerâmica e porcelana', 'Vidro temperado e pirex', 'Lâmpadas'],
    dica: 'Vidro quebrado deve ir embrulhado em jornal ou numa caixa, para proteger quem recolhe.',
  },
  {
    id: 'metal',
    nome: 'Metal',
    cor: 'recycle-metal',
    vai: ['Latas de alumínio', 'Latas de conserva (aço)', 'Tampas de metal', 'Panelas sem cabo'],
    naoVai: ['Esponja de aço', 'Clipes e grampos', 'Latas de tinta ou veneno', 'Pilhas'],
    dica: 'Reciclar alumínio gasta cerca de 95% menos energia do que produzir alumínio novo.',
  },
  {
    id: 'organico',
    nome: 'Orgânico',
    cor: 'recycle-organic',
    vai: ['Cascas de frutas e legumes', 'Borra de café', 'Restos de comida'],
    naoVai: ['Embalagens', 'Papel com plástico'],
    dica: 'O orgânico não vai na coleta seletiva: vai no lixo comum ou na compostagem.',
  },
]

export const MITOS = [
  {
    frase: 'Preciso lavar muito bem as embalagens antes de separar.',
    verdade: false,
    resposta: 'Mito. Basta tirar os restos e dar um enxágue rápido. Não precisa gastar muita água.',
  },
  {
    frase: 'Lata de alumínio pode ser reciclada várias vezes.',
    verdade: true,
    resposta: 'Verdade! O alumínio pode ser reciclado de novo e de novo, sem perder qualidade.',
  },
  {
    frase: 'Espelho é vidro, então vai junto com as garrafas.',
    verdade: false,
    resposta: 'Mito. Espelho tem outra composição e não é reciclado com o vidro comum.',
  },
  {
    frase: 'O Brasil é um dos países que mais reciclam latinhas.',
    verdade: true,
    resposta: 'Verdade! Mais de 97% das latas de alumínio vendidas no Brasil voltam para a reciclagem.',
  },
  {
    frase: 'Pilha pode ir no lixo comum se for pequena.',
    verdade: false,
    resposta: 'Mito. Toda pilha tem substâncias tóxicas e deve ir para um ponto de entrega.',
  },
]

export const MISSOES = [
  'Separei os recicláveis do lixo comum',
  'Tirei os restos de comida das embalagens',
  'Amassei latas, garrafas e caixas',
  'Coloquei os recicláveis na calçada no dia certo',
  'Ensinei alguém da minha casa a separar',
]
