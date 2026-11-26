# -*- coding: utf-8 -*-
"""Gera a V25 (importação) e o relatório de levantamento a partir das fontes."""
import sys
from collections import defaultdict

import os
import re

# Uso: python3 gerar_v25.py <pasta com o zip extraído> <raiz do repositório>
# A pasta deve conter Goiania/goiania.json (extraído do PDF), Trindade/Trindade.txt;
# Aparecida e Senador Canedo estão transcritos em dados_fontes.py.
AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
FONTES = sys.argv[1] if len(sys.argv) > 1 else AQUI
os.chdir(FONTES)

from levantamento import (CURTO, ORDEM_DIAS, analisar, chave, ler_goiania, ler_trindade, padrao, titulo)
from dados_fontes import APARECIDA, SENADOR_CANEDO

REPO = sys.argv[2] if len(sys.argv) > 2 else os.path.join(AQUI, '..', '..')
SAIDA_SQL = REPO + '/backend/src/main/resources/db/migration/V25__importar_coleta_por_cidade.sql'
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
        'fonte': 'Comurg - Frequência dos serviços de coleta (orgânica e seletiva), arquivo '
                 'FREQUENCIA-COLETA-ORGANICA-E-SELETIVA-B.pdf. Importadas só as colunas da coleta seletiva.',
        'fonte_rota': 'Comurg - FREQUENCIA-COLETA-ORGANICA-E-SELETIVA-B.pdf (coleta seletiva)',
        'grupos': ler_goiania(), 'renomear': lambda n: n,
    },
    {
        'nome': 'Aparecida de Goiânia', 'tipo': 'NAO_INFORMADO',
        'fonte': 'Cinco imagens de cronograma de coleta (whatsapp-image-2025-06-03-*.jpeg). '
                 'As imagens informam dias e turno, mas não dizem se a coleta é a seletiva.',
        'fonte_rota': 'Imagens whatsapp-image-2025-06-03 (dias e turno; tipo não informado)',
        'grupos': APARECIDA, 'renomear': titulo,
    },
    {
        'nome': 'Trindade', 'tipo': 'NAO_INFORMADO',
        'fonte': 'Arquivo Trindade.txt (coleta diurna e noturna por dia da semana). '
                 'O texto não diz se a coleta é a seletiva.',
        'fonte_rota': 'Trindade.txt (dias e turno; tipo não informado)',
        'grupos': ler_trindade(), 'renomear': ajustar_trindade,
    },
    {
        'nome': 'Senador Canedo', 'tipo': 'NAO_INFORMADO',
        'fonte': 'Imagem de cronograma de coleta (3EB074F6F680C914B599-723x1024.jpeg). '
                 'Informa dias e turno, mas não diz se a coleta é a seletiva.',
        'fonte_rota': 'Imagem 3EB074F6F680C914B599 (dias e turno; tipo não informado)',
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
        linhas_cidade.append(f"    ({q(c['nome'])}, {q(c['fonte'])})")
        for nome, rota in sorted(r['rotas'].items()):
            n = len(rota['bairros'])
            sufixo = 'Coleta seletiva.' if c['tipo'] == 'SELETIVA' else 'A fonte não diz se é a coleta seletiva.'
            desc = f'Reúne {n} bairro(s). Dias e turno da fonte oficial; horário não informado. {sufixo}'
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
           '`V25__importar_coleta_por_cidade.sql`. Nenhum horário foi inventado: as fontes informam',
           'só **dias e turno** (diurno ou noturno), e é isso que o sistema guarda e mostra.', '',
           '## Regras usadas na importação', '',
           '- Nomes mantidos como na fonte, com acentos, números romanos e subdivisões '
           '(ex.: "JD. Do Cerrado 1" a "11", "Imperial I" e "Imperial II" são bairros diferentes).',
           '- Aparecida de Goiânia vem em MAIÚSCULAS nas imagens: convertido para iniciais maiúsculas, '
           'mantendo acentos, romanos e abreviações.',
           '- Cada bairro fica numa rota que reúne **exatamente** os mesmos dias e turnos. '
           'Bairro listado em mais de um grupo da fonte recebe a soma dos dias (nada é descartado).',
           '- Tipo de coleta: só Goiânia diz que é a **seletiva** (colunas "Freq. Coleta Seletiva" e '
           '"Turno Seletiva"). Nas demais o tipo fica **não informado**, e a consulta avisa o morador.',
           '- Bairros que já existiam (Senador Canedo) mantêm id, contorno e preferências; só a rota muda '
           'quando a fonte manda.',
           '- Lembretes de coleta sem horário usam o começo de referência do turno (diurno 06:00, '
           'noturno 18:00) apenas para calcular quando avisar. Esse horário não é exibido como horário da coleta.',
           '']
    out += ['## Resumo por cidade', '', '| Cidade | Bairros | Rotas (padrões de dias e turno) | Tipo de coleta |',
            '|---|---:|---:|---|']
    for r in analises:
        tipo = 'Seletiva' if r['config']['tipo'] == 'SELETIVA' else 'Não informado pela fonte'
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
            '(o SIMUL trata da coleta seletiva).', '']
    return '\n'.join(out)


PENDENCIAS = {
    'Goiânia': [
        '"Chac. Mansões Rosa de Ouro" tem frequência seletiva (quarta) sem turno: cadastrado com turno não informado.',
        'Cinco bairros têm coleta seletiva "Diário": cadastrados nos 7 dias. Confirmar se inclui domingo.',
        'Alguns nomes vêm com maiúsculas irregulares na fonte (ex.: "Bairro da vitoria", '
        '"Vila São francisco"); mantidos como estão para não alterar o nome oficial.',
    ],
    'Aparecida de Goiânia': [
        'As imagens não dizem se a coleta é a seletiva: rotas cadastradas com tipo "não informado".',
        '"Jardim Riviera e Riviera Sul" (um item) e "Riviera Sul" (outro grupo) foram mantidos como estão na fonte.',
    ],
    'Trindade': [
        'O texto não diz se a coleta é a seletiva: rotas cadastradas com tipo "não informado".',
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
        'A imagem não diz se a coleta é a seletiva: rotas com tipo "não informado".',
        'Grafias da imagem com erro mantidas como já estavam corretas no banco: "Bairro São Fransciso II" '
        '→ "Bairro São Francisco II", "Bairro das Industrias" → "Bairro das Indústrias", '
        '"Sitio Mansões Retiro" → "Sítio Mansões Retiro".',
        'Os horários 06:00–18:00 e 18:00–23:59 da carga antiga não vinham da prefeitura: viraram '
        'turno sem horário (V24).',
        'Comparação com os 109 bairros já cadastrados (V15/V18): a imagem traz os mesmos 109 bairros '
        '(111 linhas, com 2 nomes repetidos) e os mesmos 5 padrões. Nenhum bairro foi criado nem '
        'mudou de rota; ids, contornos e preferências ficaram como estavam.',
    ],
}

MODELO_SQL = """-- ============================================================
-- SIMUL - V25
-- Importa a coleta por cidade a partir das fontes municipais
-- (Cidade.Bairros.Horarios.zip). Arquivo gerado pelo script de
-- levantamento; o relatório está em docs/levantamento-dados-municipais.md.
--
{resumo}
--
-- Regras:
--   * As fontes informam só dias e turno: o cronograma fica sem
--     horário (início e fim NULL). Nada é inventado.
--   * Cada rota reúne bairros com exatamente os mesmos dias e turnos.
--   * Bairro que já existe (mesma cidade e nome) mantém id,
--     contorno e preferências; só a rota é atualizada.
--   * Cronogramas ativos das rotas importadas que não estão na
--     fonte são desativados (não apagados).
--   * Bairros e rotas que não estão nas fontes não são tocados.
-- ============================================================

CREATE TEMP TABLE v25_cidade (nome VARCHAR(120), fonte TEXT);
CREATE TEMP TABLE v25_rota (
    cidade VARCHAR(120), nome VARCHAR(120), descricao VARCHAR(255),
    tipo_coleta VARCHAR(20), fonte VARCHAR(255)
);
CREATE TEMP TABLE v25_agenda (
    cidade VARCHAR(120), rota VARCHAR(120), dia_semana VARCHAR(10), turno VARCHAR(15)
);
CREATE TEMP TABLE v25_bairro (cidade VARCHAR(120), bairro VARCHAR(120), rota VARCHAR(120));

INSERT INTO v25_cidade (nome, fonte) VALUES
{cidades};

INSERT INTO v25_rota (cidade, nome, descricao, tipo_coleta, fonte) VALUES
{rotas};

INSERT INTO v25_agenda (cidade, rota, dia_semana, turno) VALUES
{agenda};

INSERT INTO v25_bairro (cidade, bairro, rota) VALUES
{bairros};

-- ------------------------------------------------------------
-- 1. Cidades
-- ------------------------------------------------------------
INSERT INTO cidades (nome, uf, fonte, data_criacao, data_atualizacao)
SELECT v.nome, 'GO', v.fonte, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM v25_cidade v
WHERE NOT EXISTS (SELECT 1 FROM cidades c WHERE UPPER(c.nome) = UPPER(v.nome));

UPDATE cidades c
SET fonte = v.fonte,
    data_atualizacao = CURRENT_TIMESTAMP
FROM v25_cidade v
WHERE UPPER(c.nome) = UPPER(v.nome);

-- ------------------------------------------------------------
-- 2. Rotas (uma por padrão de dias e turno, por cidade)
-- ------------------------------------------------------------
INSERT INTO rotas (cidade_id, nome, descricao, ativo, tipo_coleta, fonte, data_criacao, data_atualizacao)
SELECT c.id, v.nome, v.descricao, TRUE, v.tipo_coleta, v.fonte, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM v25_rota v
JOIN cidades c ON UPPER(c.nome) = UPPER(v.cidade)
WHERE NOT EXISTS (
    SELECT 1 FROM rotas r WHERE r.cidade_id = c.id AND UPPER(r.nome) = UPPER(v.nome)
);

UPDATE rotas r
SET descricao = v.descricao,
    tipo_coleta = v.tipo_coleta,
    fonte = v.fonte,
    ativo = TRUE,
    data_atualizacao = CURRENT_TIMESTAMP
FROM v25_rota v
JOIN cidades c ON UPPER(c.nome) = UPPER(v.cidade)
WHERE r.cidade_id = c.id
  AND UPPER(r.nome) = UPPER(v.nome);

CREATE TEMP TABLE v25_rota_id AS
SELECT v.cidade, v.nome, MIN(r.id) AS rota_id
FROM v25_rota v
JOIN cidades c ON UPPER(c.nome) = UPPER(v.cidade)
JOIN rotas r ON r.cidade_id = c.id AND UPPER(r.nome) = UPPER(v.nome)
GROUP BY v.cidade, v.nome;

-- ------------------------------------------------------------
-- 3. Cronogramas (dia + turno, sem horário)
-- ------------------------------------------------------------
UPDATE cronogramas cr
SET ativo = FALSE,
    data_atualizacao = CURRENT_TIMESTAMP
FROM v25_rota_id ri
WHERE cr.rota_id = ri.rota_id
  AND cr.ativo
  AND NOT EXISTS (
      SELECT 1 FROM v25_agenda a
      WHERE a.cidade = ri.cidade AND a.rota = ri.nome
        AND a.dia_semana = cr.dia_semana AND a.turno = cr.turno
  );

INSERT INTO cronogramas (rota_id, dia_semana, turno, horario_inicio, horario_fim, ativo, data_criacao, data_atualizacao)
SELECT ri.rota_id, a.dia_semana, a.turno, NULL, NULL, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM v25_agenda a
JOIN v25_rota_id ri ON ri.cidade = a.cidade AND ri.nome = a.rota
WHERE NOT EXISTS (
    SELECT 1 FROM cronogramas cr
    WHERE cr.rota_id = ri.rota_id AND cr.ativo
      AND cr.dia_semana = a.dia_semana AND cr.turno = a.turno
);

-- ------------------------------------------------------------
-- 4. Bairros: os existentes mudam de rota; os novos são criados
-- ------------------------------------------------------------
UPDATE areas_atendidas ar
SET rota_id = ri.rota_id
FROM v25_bairro b
JOIN cidades c ON UPPER(c.nome) = UPPER(b.cidade)
JOIN v25_rota_id ri ON ri.cidade = b.cidade AND ri.nome = b.rota
WHERE ar.cidade_id = c.id
  AND UPPER(ar.bairro) = UPPER(b.bairro)
  AND ar.rota_id <> ri.rota_id;

INSERT INTO areas_atendidas (cidade_id, bairro, rota_id)
SELECT c.id, b.bairro, ri.rota_id
FROM v25_bairro b
JOIN cidades c ON UPPER(c.nome) = UPPER(b.cidade)
JOIN v25_rota_id ri ON ri.cidade = b.cidade AND ri.nome = b.rota
WHERE NOT EXISTS (
    SELECT 1 FROM areas_atendidas ar
    WHERE ar.cidade_id = c.id AND UPPER(ar.bairro) = UPPER(b.bairro)
);

DROP TABLE v25_rota_id, v25_bairro, v25_agenda, v25_rota, v25_cidade;
"""

if __name__ == '__main__':
    main()
