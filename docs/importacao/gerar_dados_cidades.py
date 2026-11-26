# -*- coding: utf-8 -*-
"""Gera a V5 (dados das cidades) e o relatório de levantamento a partir das fontes."""
import sys
from collections import defaultdict

import os
import re

# Uso: python3 gerar_dados_cidades.py <pasta com o zip extraído> <raiz do repositório>
# A pasta deve conter Goiania/goiania.json (extraído do PDF), Trindade/Trindade.txt;
# Aparecida e Senador Canedo estão transcritos em dados_fontes.py.
AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
FONTES = sys.argv[1] if len(sys.argv) > 1 else AQUI
os.chdir(FONTES)

from levantamento import (CURTO, ORDEM_DIAS, analisar, chave, ler_goiania, ler_trindade, padrao, titulo)
from dados_fontes import APARECIDA, SENADOR_CANEDO

REPO = sys.argv[2] if len(sys.argv) > 2 else os.path.join(AQUI, '..', '..')
SAIDA_SQL = REPO + '/backend/src/main/resources/db/migration/V5__dados_das_cidades.sql'
SAIDA_MD = REPO + '/docs/levantamento-dados-municipais.md'

# Grafias já corretas no banco (V15) que a imagem de Senador Canedo traz com erro.
CORRECOES_SC = {
    'Bairro São Fransciso II': 'Bairro São Francisco II',
    'Bairro das Industrias': 'Bairro das Indústrias',
    'Sitio Mansões Retiro': 'Sítio Mansões Retiro',
}


def ajustar_trindade(nome):
    # Só a inicial: "trecho da GO-469" está em minúscula porque fecha a frase da fonte.
    return nome[:1].upper() + nome[1:]


CIDADES = [
    {
        'nome': 'Goiânia', 'tipo': 'SELETIVA',
        'turnos': ('07:00', '16:00', '19:00', '04:00', 'Consórcio LimpaGyn'),
        'fonte': 'Comurg - Frequência dos serviços de coleta (orgânica e seletiva), arquivo '
                 'FREQUENCIA-COLETA-ORGANICA-E-SELETIVA-B.pdf. Importadas só as colunas da coleta seletiva.',
        'fonte_rota': 'Comurg - FREQUENCIA-COLETA-ORGANICA-E-SELETIVA-B.pdf (coleta seletiva)',
        'grupos': ler_goiania(), 'renomear': lambda n: n,
    },
    {
        'nome': 'Aparecida de Goiânia', 'tipo': 'CONVENCIONAL',
        'turnos': ('06:00', '16:00', '18:00', '03:00', 'Consórcio Aparecida Limpa'),
        'fonte': 'Cinco imagens de cronograma de coleta (whatsapp-image-2025-06-03-*.jpeg), '
                 'com dias e turno. Cadastrada como coleta convencional.',
        'fonte_rota': 'Imagens whatsapp-image-2025-06-03 (dias e turno; coleta convencional)',
        'grupos': APARECIDA, 'renomear': titulo,
    },
    {
        'nome': 'Trindade', 'tipo': 'CONVENCIONAL',
        'turnos': ('07:00', '16:00', '18:00', '03:00', 'Quebec Ambiental'),
        'fonte': 'Arquivo Trindade.txt (coleta diurna e noturna por dia da semana). '
                 'Cadastrada como coleta convencional.',
        'fonte_rota': 'Trindade.txt (dias e turno; coleta convencional)',
        'grupos': ler_trindade(), 'renomear': ajustar_trindade,
    },
    {
        'nome': 'Senador Canedo', 'tipo': 'CONVENCIONAL',
        'turnos': ('06:00', '16:00', '18:00', '03:00', 'Prefeitura de Senador Canedo'),
        'fonte': 'Imagem de cronograma de coleta (3EB074F6F680C914B599-723x1024.jpeg), '
                 'com dias e turno. Cadastrada como coleta convencional.',
        'fonte_rota': 'Imagem 3EB074F6F680C914B599 (dias e turno; coleta convencional)',
        'grupos': SENADOR_CANEDO, 'renomear': lambda n: CORRECOES_SC.get(n, n),
    },
]

ROTULO_TURNO = {'DIURNO': 'Diurna', 'NOTURNO': 'Noturna', 'NAO_INFORMADO': 'Turno não informado'}


def texto_dias(dias):
    dias = sorted(dias, key=ORDEM_DIAS.index)
    if len(dias) == 7:
        return 'todos os dias'
    if dias == ORDEM_DIAS[:6]:
        return 'seg a sáb'
    curtos = [CURTO[d] for d in dias]
    return curtos[0] if len(curtos) == 1 else ', '.join(curtos[:-1]) + ' e ' + curtos[-1]


def nome_rota(cidade, agenda):
    por_turno = defaultdict(list)
    for dia, turno in agenda:
        por_turno[turno].append(dia)
    partes = [f'{ROTULO_TURNO[t]} ({texto_dias(por_turno[t])})'
              for t in ('DIURNO', 'NOTURNO', 'NAO_INFORMADO') if t in por_turno]
    nome = f'{cidade} - ' + ' + '.join(partes)
    assert len(nome) <= 120, nome
    return nome


def so_subdivisao(a, b):
    """Nomes que só diferem por numeração (I, II, 1, 3, 1° Etapa…) ou Leste/Oeste: subdivisões."""
    padrao = r'(?i)\b([ivx]+|\d+°?|leste|oeste|e)\b'
    limpa = lambda n: re.sub(r'\s+', ' ', re.sub(padrao, '', chave(n))).strip()
    return limpa(a) == limpa(b)


def q(texto):
    return "'" + texto.replace("'", "''") + "'"


def main():
    analises = []
    for c in CIDADES:
        r = analisar(c['nome'], c['grupos'], c['renomear'])
        r['config'] = c
        rotas = {}
        for b in r['bairros'].values():
            p = padrao(b['agenda'])
            nome = nome_rota(c['nome'], p)
            rotas.setdefault(nome, {'agenda': p, 'bairros': []})['bairros'].append(b['nome'])
            b['rota'] = nome
        r['rotas'] = rotas
        analises.append(r)

    linhas_cidade, linhas_rota, linhas_agenda, linhas_bairro = [], [], [], []
    for r in analises:
        c = r['config']
        di, df, ni, nf, operadora = c['turnos']
        fonte_turnos = f'{operadora}: faixa média dos turnos; o horário exato varia por rota.'
        linhas_cidade.append(
            f"    ({q(c['nome'])}, {q(c['fonte'])}, TIME {q(di)}, TIME {q(df)}, TIME {q(ni)}, TIME {q(nf)}, "
            f"{q(fonte_turnos)})")
        for nome, rota in sorted(r['rotas'].items()):
            n = len(rota['bairros'])
            sufixo = {'SELETIVA': 'Coleta seletiva.', 'CONVENCIONAL': 'Coleta convencional.'}[c['tipo']]
            desc = f'Reúne {n} bairro(s). Dias e turno da fonte oficial; horário exato não informado. {sufixo}'
            linhas_rota.append(f"    ({q(c['nome'])}, {q(nome)}, {q(desc)}, {q(c['tipo'])}, {q(c['fonte_rota'])})")
            for dia, turno in rota['agenda']:
                linhas_agenda.append(f"    ({q(c['nome'])}, {q(nome)}, {q(dia)}, {q(turno)})")
        for b in r['bairros'].values():
            linhas_bairro.append(f"    ({q(c['nome'])}, {q(b['nome'])}, {q(b['rota'])})")

    sql = MODELO_SQL.format(
        cidades=',\n'.join(linhas_cidade),
        rotas=',\n'.join(linhas_rota),
        agenda=',\n'.join(linhas_agenda),
        bairros=',\n'.join(linhas_bairro),
        resumo='\n'.join(f"--   {r['cidade']}: {len(r['bairros'])} bairros, {len(r['rotas'])} rotas"
                         for r in analises),
    )
    open(SAIDA_SQL, 'w', encoding='utf-8').write(sql)
    os.makedirs(os.path.dirname(SAIDA_MD), exist_ok=True)
    open(SAIDA_MD, 'w', encoding='utf-8').write(relatorio(analises))
    for r in analises:
        print(r['cidade'], len(r['bairros']), 'bairros', len(r['rotas']), 'rotas')


def relatorio(analises):
    out = ['# Levantamento dos dados municipais de coleta', '',
           'Gerado a partir dos arquivos de `Cidade.Bairros.Horarios.zip` e importado pela migration',
           '`V5__dados_das_cidades.sql`. Nenhum horário exato foi inventado: as fontes informam',
           'só **dias e turno** (diurno ou noturno). A faixa média de cada turno, informada pelas',
           'operadoras, fica na cidade e é mostrada como horário aproximado.', '',
           '## Regras usadas na importação', '',
           '- Nomes mantidos como na fonte, com acentos, números romanos e subdivisões '
           '(ex.: "JD. Do Cerrado 1" a "11", "Imperial I" e "Imperial II" são bairros diferentes).',
           '- Aparecida de Goiânia vem em MAIÚSCULAS nas imagens: convertido para iniciais maiúsculas, '
           'mantendo acentos, romanos e abreviações.',
           '- Cada bairro fica numa rota que reúne **exatamente** os mesmos dias e turnos. '
           'Bairro listado em mais de um grupo da fonte recebe a soma dos dias (nada é descartado).',
           '- Tipo de coleta: Goiânia é **seletiva** (só as colunas "Freq. Coleta Seletiva" e '
           '"Turno Seletiva" do PDF). As outras três cidades foram cadastradas como **coleta convencional** '
           '(decisão da equipe em 26/11/2026), e a consulta avisa o morador.',
           '- Senador Canedo: a imagem oficial foi conferida com os 109 bairros da carga anterior: são os '
           'mesmos bairros e os mesmos 5 padrões de dias e turnos.',
           '- Faixa média dos turnos por cidade, a partir das informações das operadoras. É mostrada como '
           'horário aproximado ("aprox. 19:00 – 04:00") e usada como início do turno no lembrete; o horário '
           'exato de cada rota continua não informado e varia por rua.', '',
           '| Cidade | Operadora | Diurno | Noturno |', '|---|---|---|---|',
           *[f"| {c['nome']} | {c['turnos'][4]} | {c['turnos'][0]} – {c['turnos'][1]} | "
             f"{c['turnos'][2]} – {c['turnos'][3]} |" for c in CIDADES], '',
           '- Orientação mostrada ao morador: deixar o lixo na calçada até 1 hora antes do início do turno.',
           '']
    out += ['## Resumo por cidade', '', '| Cidade | Bairros | Rotas (padrões de dias e turno) | Tipo de coleta |',
            '|---|---:|---:|---|']
    for r in analises:
        tipo = 'Seletiva' if r['config']['tipo'] == 'SELETIVA' else 'Convencional'
        out.append(f"| {r['cidade']} | {len(r['bairros'])} | {len(r['rotas'])} | {tipo} |")
    out.append('')
    for r in analises:
        c = r['config']
        out += [f"## {r['cidade']}", '', f"**Fonte:** {c['fonte']}", '', '### Rotas', '',
                '| Rota | Bairros |', '|---|---:|']
        for nome, rota in sorted(r['rotas'].items(), key=lambda x: -len(x[1]['bairros'])):
            out.append(f"| {nome} | {len(rota['bairros'])} |")
        out += ['', '### Pendências e inconsistências', '']
        pend = PENDENCIAS.get(r['cidade'], [])[:]
        if r['varios_grupos']:
            pend.append(f"{len(r['varios_grupos'])} bairro(s) aparecem em mais de um grupo da fonte "
                        "(dias somados): " + '; '.join(
                            f"{n} ({', '.join(o)})" for n, o in r['varios_grupos']) + '.')
        if r['dois_turnos']:
            pend.append('Coleta nos dois turnos no mesmo dia (mantida, confirmar com a prefeitura): ' + '; '.join(
                f"{n} ({', '.join(d)})" for n, d in r['dois_turnos']) + '.')
        if r['repetidos_no_grupo']:
            pend.append('Nome repetido dentro do mesmo grupo da fonte (cadastrado uma vez): ' + '; '.join(
                sorted({n for n, _ in r['repetidos_no_grupo']})) + '.')
        parecidos = [(a, b) for a, b, _ in r['parecidos'] if not so_subdivisao(a, b)]
        if parecidos:
            pend.append('Nomes parecidos mantidos separados (podem ser grafias diferentes do mesmo bairro; '
                        'confirmar com a prefeitura): ' + '; '.join(f'"{a}" / "{b}"' for a, b in parecidos) + '.')
        out += [f'- {p}' for p in pend] or ['- Nenhuma.']
        out.append('')
    out += ['## O que o modelo ainda não representa', '',
            '- **Horário exato**: nenhuma fonte informa. O painel permite registrar o horário quando a prefeitura divulgar.',
            '- **Parte de um bairro** (ex.: "Setor Sul (parte de cima)" em Trindade): é cadastrado como um bairro '
            'com esse nome; o sistema não divide o contorno do bairro.',
            '- **Vias e trechos** (ex.: "Avenida Raimundo de Aquino", "Trecho da GO-469" em Trindade): cadastrados '
            'como áreas com o nome da fonte, porque não são bairros.',
            '- **Coleta orgânica de Goiânia**: o PDF também traz a coleta orgânica, que não foi importada '
            '(o SIMUL trata da coleta seletiva).', '',
            '- **Faixa dos turnos**: é a média informada pelas operadoras; confirmar com documentos '
            'oficiais. Pode ser corrigida no painel (Visão geral → Faixa dos turnos) sem nova migration.', '']
    return '\n'.join(out)


PENDENCIAS = {
    'Goiânia': [
        '"Chac. Mansões Rosa de Ouro" tem frequência seletiva (quarta) sem turno: cadastrado com turno não informado.',
        'Cinco bairros têm coleta seletiva "Diário": cadastrados nos 7 dias. Confirmar se inclui domingo.',
        'Alguns nomes vêm com maiúsculas irregulares na fonte (ex.: "Bairro da vitoria", '
        '"Vila São francisco"); mantidos como estão para não alterar o nome oficial.',
    ],
    'Aparecida de Goiânia': [
        'As imagens não dizem se a coleta é a seletiva: cadastrada como coleta convencional.',
        '"Jardim Riviera e Riviera Sul" (um item) e "Riviera Sul" (outro grupo) foram mantidos como estão na fonte.',
    ],
    'Trindade': [
        'O texto não diz se a coleta é a seletiva: cadastrada como coleta convencional.',
        'A fonte escreve "Sábado-feira"; interpretado como sábado.',
        '"Escala" e "Loteamento Escala" aparecem como itens diferentes; mantidos separados.',
        'Itens que juntam subdivisões ("Serra Branca I e II", "Vila Bela I e II", "Garavelo I e II") foram '
        'mantidos como um único bairro, como na fonte.',
        '"Avenida Raimundo de Aquino" e "trecho da GO-469" não são bairros; cadastrados como áreas com esse nome '
        '(inicial maiúscula em "Trecho").',
        'Dias irregulares mantidos como na fonte (ex.: Mariápolis seg e sex; São Bernardo seg e '
        'São Bernardo II qua e sex; Juarez Freire ter e sáb; Harmonia ter e qui).',
    ],
    'Senador Canedo': [
        'A imagem não diz se a coleta é a seletiva: cadastrada como coleta convencional.',
        'Grafias da imagem com erro mantidas como já estavam corretas no banco: "Bairro São Fransciso II" '
        '→ "Bairro São Francisco II", "Bairro das Industrias" → "Bairro das Indústrias", '
        '"Sitio Mansões Retiro" → "Sítio Mansões Retiro".',
        'A carga anterior usava os horários 06:00–18:00 e 18:00–23:59, que não vinham da prefeitura; '
        'agora vale a faixa média da operadora.',
        'A imagem traz 111 linhas para 109 bairros (2 nomes repetidos), os mesmos da carga anterior.',
    ],
}

MODELO_SQL = """-- ============================================================
-- SIMUL - V5
-- Dados das cidades atendidas: cidades (com a faixa média dos
-- turnos), rotas, coletas (dia + turno) e bairros.
-- Arquivo gerado por docs/importacao/gerar_dados_cidades.py a
-- partir das fontes municipais (Cidade.Bairros.Horarios.zip);
-- o levantamento está em docs/levantamento-dados-municipais.md.
--
{resumo}
--
-- Regras:
--   * As fontes informam só dias e turno: as coletas ficam sem
--     horário exato (início e fim NULL). Nada é inventado.
--   * A faixa média de cada turno fica na cidade e é mostrada
--     como horário aproximado.
--   * Cada rota reúne bairros com exatamente os mesmos dias e
--     turnos, sempre de uma única cidade.
--   * Goiânia: coleta seletiva (colunas de seletiva do PDF da
--     Comurg). Demais cidades: coleta convencional.
-- ============================================================

CREATE TEMP TABLE dados_cidade (
    nome VARCHAR(120), fonte TEXT,
    diurno_inicio TIME, diurno_fim TIME, noturno_inicio TIME, noturno_fim TIME,
    fonte_turnos VARCHAR(255)
);
CREATE TEMP TABLE dados_rota (
    cidade VARCHAR(120), nome VARCHAR(120), descricao VARCHAR(255),
    tipo_coleta VARCHAR(20), fonte VARCHAR(255)
);
CREATE TEMP TABLE dados_agenda (
    cidade VARCHAR(120), rota VARCHAR(120), dia_semana VARCHAR(10), turno VARCHAR(15)
);
CREATE TEMP TABLE dados_bairro (cidade VARCHAR(120), bairro VARCHAR(120), rota VARCHAR(120));

INSERT INTO dados_cidade (nome, fonte, diurno_inicio, diurno_fim, noturno_inicio, noturno_fim, fonte_turnos) VALUES
{cidades};

INSERT INTO dados_rota (cidade, nome, descricao, tipo_coleta, fonte) VALUES
{rotas};

INSERT INTO dados_agenda (cidade, rota, dia_semana, turno) VALUES
{agenda};

INSERT INTO dados_bairro (cidade, bairro, rota) VALUES
{bairros};

INSERT INTO cidades (
    nome, uf, fonte, diurno_inicio, diurno_fim, noturno_inicio, noturno_fim, fonte_turnos,
    data_criacao, data_atualizacao
)
SELECT nome, 'GO', fonte, diurno_inicio, diurno_fim, noturno_inicio, noturno_fim, fonte_turnos,
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM dados_cidade;

INSERT INTO rotas (cidade_id, nome, descricao, ativo, tipo_coleta, fonte, data_criacao, data_atualizacao)
SELECT c.id, v.nome, v.descricao, TRUE, v.tipo_coleta, v.fonte, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM dados_rota v
JOIN cidades c ON c.nome = v.cidade;

INSERT INTO cronogramas (rota_id, dia_semana, turno, horario_inicio, horario_fim, ativo, data_criacao, data_atualizacao)
SELECT r.id, a.dia_semana, a.turno, NULL, NULL, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM dados_agenda a
JOIN cidades c ON c.nome = a.cidade
JOIN rotas r ON r.cidade_id = c.id AND r.nome = a.rota;

INSERT INTO areas_atendidas (cidade_id, bairro, rota_id)
SELECT c.id, b.bairro, r.id
FROM dados_bairro b
JOIN cidades c ON c.nome = b.cidade
JOIN rotas r ON r.cidade_id = c.id AND r.nome = b.rota;

DROP TABLE dados_bairro, dados_agenda, dados_rota, dados_cidade;
"""

if __name__ == '__main__':
    main()
