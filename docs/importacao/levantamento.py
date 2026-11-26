# -*- coding: utf-8 -*-
"""Lê as quatro fontes, normaliza e gera o levantamento + dados para a migration."""
import json
import re
import unicodedata
from collections import OrderedDict, defaultdict
from difflib import SequenceMatcher

from dados_fontes import APARECIDA, DIARIO, SENADOR_CANEDO

ORDEM_DIAS = ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO']
CURTO = dict(zip(ORDEM_DIAS, ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom']))


def chave(nome):
    s = unicodedata.normalize('NFD', nome)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'\s+', ' ', s).strip().lower()


ROMANOS = {'I', 'II', 'III', 'IV', 'V', 'VI'}
CONECTORES = {'de', 'da', 'do', 'das', 'dos', 'e'}


def titulo(nome):
    """MAIÚSCULAS da fonte -> iniciais maiúsculas, mantendo acentos, romanos e abreviações."""
    palavras = nome.split(' ')
    saida = []
    for i, p in enumerate(palavras):
        prefixo = ''
        while p and p[0] in '(':
            prefixo += p[0]
            p = p[1:]
        base = p.rstrip(',).')
        sufixo = p[len(base):]
        if base.upper() in ROMANOS and i > 0:
            nova = base.upper()
        elif base.lower() in CONECTORES and i > 0 and i < len(palavras) - 1:
            nova = base.lower()
        elif base.lower() == 'e' and i == len(palavras) - 1:
            nova = 'E'  # "Setor Garavelo E" (letra do setor)
        elif base == '-':
            nova = '-'
        else:
            nova = base[:1].upper() + base[1:].lower()
        saida.append(prefixo + nova + sufixo)
    return ' '.join(saida)


def dividir_trindade(texto):
    itens = [i.strip() for i in texto.strip().rstrip('.').split(', ')]
    ultimo = itens.pop()
    m = re.match(r'^(.*) e (.+)$', ultimo)
    if m and not re.fullmatch(r'(I|II|III|IV)', m.group(2)):
        itens += [m.group(1), m.group(2)]
    else:
        itens.append(ultimo)
    return itens


def ler_trindade():
    dias = {'Segunda-feira': 'SEGUNDA', 'Terça-feira': 'TERCA', 'Quarta-feira': 'QUARTA',
            'Quinta-feira': 'QUINTA', 'Sexta-feira': 'SEXTA', 'Sábado-feira': 'SABADO'}
    grupos = []
    dia = turno = None
    for linha in open('Trindade/Trindade.txt', encoding='utf-8'):
        linha = linha.strip()
        if not linha:
            continue
        if linha in dias:
            dia = dias[linha]
        elif 'diurna' in linha:
            turno = 'DIURNO'
        elif 'noturna' in linha:
            turno = 'NOTURNO'
        else:
            grupos.append(([dia], turno, dividir_trindade(linha)))
    return grupos


def ler_goiania():
    freq = {'Segunda- Feira': ['SEGUNDA'], 'Terça- Feira': ['TERCA'], 'Quarta- Feira': ['QUARTA'],
            'Quinta- Feira': ['QUINTA'], 'Sexta- Feira': ['SEXTA'], 'Sábado': ['SABADO'],
            'Domingo': ['DOMINGO'], 'Segunda, Quarta e Sexta': ['SEGUNDA', 'QUARTA', 'SEXTA'],
            'Terça, Quinta e Sábado': ['TERCA', 'QUINTA', 'SABADO'], 'Diário': DIARIO}
    turnos = {'Diurno': 'DIURNO', 'Noturno': 'NOTURNO', '': 'NAO_INFORMADO'}
    grupos = []
    for nome, _fo, _to, fs, ts, _pag, _y in json.load(open('Goiania/goiania.json')):
        grupos.append((freq[fs], turnos[ts], [nome], fs, ts))
    return grupos


def consolidar(grupos, renomear=lambda n: n):
    """bairro -> {nome, ocorrencias:[(dias, turno, rotulo_grupo)], agenda:set((dia,turno))}"""
    bairros = OrderedDict()
    repetidos_no_grupo = []
    for indice, grupo in enumerate(grupos):
        dias, turno, nomes = grupo[0], grupo[1], grupo[2]
        rotulo = f"{turno.lower()} {'/'.join(CURTO[d] for d in dias)}"
        vistos = set()
        for bruto in nomes:
            nome = renomear(bruto)
            k = chave(nome)
            if k in vistos:
                repetidos_no_grupo.append((nome, rotulo))
                continue
            vistos.add(k)
            b = bairros.setdefault(k, {'nome': nome, 'grafias': [], 'ocorrencias': [], 'agenda': set()})
            if nome not in b['grafias']:
                b['grafias'].append(nome)
            b['ocorrencias'].append(rotulo)
            for d in dias:
                b['agenda'].add((d, turno))
    return bairros, repetidos_no_grupo


def nomes_parecidos(bairros):
    lista = list(bairros.values())
    pares = []
    for i in range(len(lista)):
        for j in range(i + 1, len(lista)):
            a, b = chave(lista[i]['nome']), chave(lista[j]['nome'])
            r = SequenceMatcher(None, a, b).ratio()
            if r >= 0.9 and a.rstrip('s') != b.rstrip('s') or (a.rstrip('s') == b.rstrip('s') and a != b):
                pares.append((lista[i]['nome'], lista[j]['nome'], round(r, 2)))
    return pares


def padrao(agenda):
    return tuple(sorted(agenda, key=lambda x: (ORDEM_DIAS.index(x[0]), x[1])))


def analisar(cidade, grupos, renomear=lambda n: n):
    bairros, repetidos = consolidar(grupos, renomear)
    padroes = defaultdict(list)
    varios_grupos = []
    dois_turnos = []
    for b in bairros.values():
        padroes[padrao(b['agenda'])].append(b['nome'])
        if len(b['ocorrencias']) > 1 and cidade != 'Trindade':
            varios_grupos.append((b['nome'], b['ocorrencias']))
        dias_turno = defaultdict(set)
        for d, t in b['agenda']:
            dias_turno[d].add(t)
        mesmos = [d for d, ts in dias_turno.items() if len(ts) > 1]
        if mesmos:
            dois_turnos.append((b['nome'], [CURTO[d] for d in sorted(mesmos, key=ORDEM_DIAS.index)]))
    return {
        'cidade': cidade,
        'bairros': bairros,
        'padroes': padroes,
        'repetidos_no_grupo': repetidos,
        'varios_grupos': varios_grupos,
        'dois_turnos': dois_turnos,
        'parecidos': nomes_parecidos(bairros),
    }


if __name__ == '__main__':
    resultados = [
        analisar('Goiânia', ler_goiania()),
        analisar('Aparecida de Goiânia', APARECIDA, titulo),
        analisar('Trindade', ler_trindade()),
        analisar('Senador Canedo', SENADOR_CANEDO),
    ]
    for r in resultados:
        print('=' * 70)
        print(r['cidade'], '| bairros:', len(r['bairros']), '| padrões distintos:', len(r['padroes']))
        print(' repetidos dentro do mesmo grupo:', r['repetidos_no_grupo'])
        print(' em mais de um grupo:', len(r['varios_grupos']))
        for n, o in r['varios_grupos'][:60]:
            print('   -', n, o)
        print(' mesmo dia nos dois turnos:', len(r['dois_turnos']))
        for n, d in r['dois_turnos'][:60]:
            print('   -', n, d)
        print(' nomes parecidos:', r['parecidos'])
    json.dump(
        [{'cidade': r['cidade'],
          'bairros': [{'nome': b['nome'], 'grafias': b['grafias'], 'ocorrencias': b['ocorrencias'],
                       'agenda': sorted(b['agenda'], key=lambda x: (ORDEM_DIAS.index(x[0]), x[1]))}
                      for b in r['bairros'].values()]}
         for r in resultados],
        open('consolidado.json', 'w'), ensure_ascii=False, indent=1)
