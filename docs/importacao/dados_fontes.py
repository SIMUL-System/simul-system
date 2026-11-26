# -*- coding: utf-8 -*-
"""
Transcrição fiel das fontes municipais (Cidade.Bairros.Horarios.zip).
Cada grupo: (dias, turno, [nomes exatamente como na fonte]).
Dias: SEGUNDA..DOMINGO. Turno: DIURNO, NOTURNO ou NAO_INFORMADO.
"""

SQS = ['SEGUNDA', 'QUARTA', 'SEXTA']
TQS = ['TERCA', 'QUINTA', 'SABADO']
SEG_SAB = ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO']
DIARIO = ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO']

# ------------------------------------------------------------------
# Senador Canedo: imagem "COLETA POR BAIRRO" (Prefeitura/SEINFRA/AMMA)
# ------------------------------------------------------------------
SENADOR_CANEDO = [
    (SQS, 'DIURNO', [
        'Bairro São Francisco', 'Bairro São Fransciso II', 'Cemitério', 'Chácaras São Geraldo',
        'Chácaras Vargem Bonita II', 'Chácaras Vargem Bonita', 'Clube Social dos Cabos e Soldados',
        'Cond. Alto da Boa Vista', 'Condomínio Alta Vista', 'Condomínio Ecológico Mansões Morumbi',
        'Dist. Ind. Brasil Central', 'Distrito Agroindustrial de Senador Canedo',
        'Frigorífico Independência', 'Hortegranjeira', 'Jardim Bougainville', 'Jardim Flamboyant',
        'Jardim Primavera', 'Jardim Sevilha', 'Novo Residencial Prado', 'Parque Industrial',
        'Parque Residencial Morumbi', 'Perfinasa', 'Petrobras', 'Residencial Parque das Flores',
        'Residencial Ravena', 'Residencial Aracy Amaral', 'Residencial Aurora das Mansões',
        'Residencial Dona Lindu', 'Residencial Laranjeiras', 'Residencial Pedro Miranda',
        'Residencial Prado', 'Residencial Villa Verde', 'Setor Goiás', 'Setor Monte Azul',
        'Setor Park Vitória', 'Setor Vargem Bonita', 'Sítio Café', "Sítio Olhos D'água",
        'Sítio Vale das Brisas', 'Sítios Para Recreio Solar das Auroras', 'Solar Park Ilhabelha',
        'Terra Bela', 'Terras Alpha I', 'Terras Alpha II', 'Vargem Bonita', 'Vila Bonsucesso',
        'Vila São Sebastião',
    ]),
    (TQS, 'DIURNO', [
        'Acambago', 'Chácaras Alvorada', 'Chácaras Pedroso', 'Cond. Toyolândia', 'Condomínio Portugal',
        'Conj. Margarida Procópio', 'Conj. Valéria Perillo II', 'Conj. Valéria Perillo',
        'Industrial Estrela Do Sul', 'Jardim das Oliveiras II', 'Jardim das Oliveiras',
        'Jardim Liberdade', 'Parque Alvorada II', 'Parque Alvorada',
        'Polo Confeccionista de Senador Canedo', 'Polo Educacional e Cultural de Senador Canedo',
        'Polo Empresarial Nova Canaã', 'Quinhão 5', 'Jardim Ingá', 'Res. Condomínio Jardim Veneza',
        'Residencial Morada do Sol', 'Residencial Flor do Ipê I', 'Residencial Flor do Ipê II',
        'Residencial Hebrom', 'Residencial Marília', 'Residencial Parque Industrial',
        'Residencial Parque dos Buritis', 'Residencial Vale Verde', 'Residencial Recanto das Oliveiras',
        'Residencial Rio Araguaia', 'Residencial Vale Verde', 'Setor Castros', 'Setor Estrela Sul',
        'Sitio Mansões Retiro', 'Vila Galvão', 'Vila São João',
    ]),
    (SQS, 'NOTURNO', [
        'Bairro Alvorada', 'Bairro das Industrias', 'Conj. Morada do Morro', 'Conjunto Sabiá',
        'Conjunto Urapuru', 'Jardim do Lago', 'Jardim Nova Goiânia', 'Res. Anuar Aliad',
        'Residencial Boa Esperança', 'Residencial Boa Vista II', 'Residencial Boa Vista',
        'Residencial Buriti', 'Residencial Ecológico', 'Residencial Paraíso II', 'Residencial Paraíso',
        'Residencial Recanto dos Sonhos', 'Setor Genoveva Rezende Machado', 'Jardim Nova Goiânia',
        'Solar Monte Cristo', 'St. Morada Nova',
    ]),
    (TQS, 'NOTURNO', [
        'Residencial Jardim Canedo III', 'Residencial Jardim Canedo', 'Residencial Santa Edwiges',
        'Residencial Morada do Bosque', 'Residencial Jardim Canedo II', 'Setor Comercial',
    ]),
    (SEG_SAB, 'NOTURNO', ['Jardim Todos os Santos', 'Vila Santa Rosa']),
]

# ------------------------------------------------------------------
# Aparecida de Goiânia: cinco imagens (Prefeitura / Consórcio Aparecida Limpa)
# ------------------------------------------------------------------
APARECIDA = [
    (SQS, 'DIURNO', [
        'AGENOR MODESTO', 'ANA ROSA', 'APARECIDA PARK', 'BELO MONTE', 'CELIA MARA',
        'CHÁCARA BELA VISTA', 'CHÁCARA COND. SONHO VERDE', 'CHÁCARA MARIVANIA', 'CHÁCARA SÃO PEDRO',
        'CONDOMÍNIO SÃO PEDRO', 'CONJUNTO MABEL', 'CONJUNTO PLANALTO', 'CONJUNTO PLANÍCIE', 'EXPANSUL',
        'FAZENDA SANTO ANTONO', 'INTERNACIONAL PARK', 'JARDIM AMETISTA', 'JARDIM BELA VISTA',
        'JARDIM BELO HORIZONTE', 'JARDIM BONANZA', 'JARDIM CASA GRANDE', 'JARDIM COPACABANA',
        'JARDIM CRISTAL', 'JARDIM CRISTALINO', 'JARDIM DAS ACÁCIAS', 'JARDIM DOS BURITI',
        'JARDIM DOS GIRASSÓIS', 'JARDIM DOS PALMARES', 'JARDIM ELDORADO', 'JARDIM ESPLANADA',
        'JARDIM IPANEMA', 'JARDIM IPIRANGA', 'JARDIM IRACEMA', 'JARDIM MIRAMAR', 'JARDIM MONTE CRISTO',
        'JARDIM MONTE LÍBANO', 'JARDIM MONTE SINAI (CHÁCARAS)', 'JARDIM OLÍMPICO I e II',
        'JARDIM PALMARES', 'JARDIM PAMPULHA I e II', 'JARDIM PARAÍSO', 'JARDIM REPOUSO',
        'JARDIM RIO GRANDE', 'JARDIM RIVIERA e RIVIERA SUL', 'JARDIM ROSA DO SUL', 'JARDIM VERDE VALE',
        'JARDINS AÚREA', 'JARDINS FLORENÇA', 'LOTEAMENTO ÁGUAS CLARAS',
        'PARQUE ATALAIA', 'PARQUE DAS PEDRAS', 'PARQUE FLAMBOYANT', 'PARQUE INDUST. DE APARECIDA',
        'PARQUE INDUST. SANTO ANTONIO', 'PARQUE ITALIA', 'PARQUE ITAMARATY', 'PARQUE ITATIAIA',
        'PARQUE KARAJÁ', 'PARQUE MONTREAL', 'PARQUE SANTA CECÍLIA I e II', 'PARQUE SÃO JORGE',
        'PARQUE TRINDADE I, II e III', 'PARQUE VEIGA JARDIM (BOMBEIROS)', 'POLO EMPRESARIAL',
        'POLO INDUSTRIAL GLOBAL', 'RES. AGENOR MODESTO', 'RES. CÂNDIDO DE QUEIROZ', 'RES. PATIO ANDALUZ',
        'RES. SOLLAR CENTRAL PARQUE', 'RES. VILLAGE GARAVELO II', 'RESIDENCIAL SANTA LUZIA',
        'RETIRO DO BOSQUE', 'SANTA LUZIA', 'SANTO ANDRÉ', 'SERRA DOURADA I, II e III',
        'SETOR ALVORADA OESTE e SUL', 'SETOR ANDRADE REIS', 'SETOR ARCO IRIS', 'SETOR COMENDADOR WALMOR',
        'SETOR CONDE DOS ARCOS', 'SETOR CONTINENTAL', 'SETOR DOS ESTADOS', 'SETOR FABRICIO',
        'SETOR FRANCO', 'SETOR MARISTA SUL', 'SETOR NOVA OLINDA', 'SETOR PLANÍCIES',
        'SETOR REAL GRANDEZA', 'SETOR RIO VERMELHO', 'SETOR ROSA DOS VENTOS', 'SETOR SANTO ANDRÉ',
        'SETOR TOCANTIS', 'SOLAR GARDEN I e II', 'TERRA PROMETIDA', 'VALE DO SOL', 'VILA ADÉLIA',
        'VILA BRASÍLIA', 'VILA MARIA', 'VILA NOSSA SENHORA DE LOURDES', 'VILA SANTA', 'VILA SÃO JORGE',
        'VILA SOUSA', 'VIRGÍNIA PARK',
    ]),
    (SQS, 'NOTURNO', [
        'AMERICAN PARK', 'CHÁCARA CÓRREGO DAS LAJES', 'CIDADE LIVRE', 'CIDADE SATÉLITE SÃO LUIZ',
        'CIDADE VERA CRUZ (PARTE INFERIOR DIREITA)', 'CONJUNTO STORIL', 'FAZENDA SANTO ANTÔNIO',
        'GRANJA REUNIDAS NOSSA SENH. DE LOURDES', 'JARDIM BELA MORADA', 'JARDIM BONANÇA',
        'JARDIM DOS BURITIS', 'JARDIM DOS POMARES', 'JARDIM IMPERIAL', 'JARDIM IRACEMA',
        'JARDIM MARIA INÊS', 'JARDIM PALÁCIOS', 'JARDIM ROSA DO SUL', 'JARDIM TRANSBRASILIANA',
        'MANSÕES PARAÍSO', 'PAPILLON PARK', 'PARQUE FLORESTA', 'PARQUE PRIMAVERA', 'PARQUE REAL',
        'PARQUE RIO DAS PEDRAS', 'PARQUE VEIGA JARDIM (TERMINAL)', 'PARQVILLE FIGUEIRA',
        'RECANTO DAS EMBOABAS', 'RESIDENCIAL ALVA LUZ', 'SETOR COLINA AZUL',
        'SETOR MARISTA SUL (LADO DO CIDADE LIVRE)', 'SETOR SANTOS DUMONT', 'VILA MARIA',
        'VILA BRASÍLIA', 'VILA REAL', 'VILA SÃO JOAQUIM', 'VILA SÃO MANOEL', 'VILLASUL V E COMPLEMENTO',
    ]),
    (TQS, 'DIURNO', [
        'BAIRRO CARDOSO (PARTE VERA CRUZ)', 'BAIRRO INDEPENDÊNCIA', 'BAIRRO INDEPENDÊNCIA MANSÕES',
        'BAIRRO ITAPUÃ', 'CENTRO OLÍMPICO', 'CIDADE VERA CRUZ', 'CLUBE CENTAURUS', 'COLONIAL SUL',
        'DAIAG', 'DIMAG', 'FAZENDA CAPÃO COMPRIDO', 'FAZENDA DOURADOS', 'FAZENDA SANTO ANTÔNIO',
        'GOIANIA PARK SUL', 'JARDIM ALTO PARAÍSO', 'JARDIM BELO HORIZONTE', 'JARDIM BOA ESPERANÇA',
        'JARDIM BURITI SERENO', 'JARDIM CANADÁ', 'JARDIM DAS CASCATAS', 'JARDIM DAS HORTÊNCIAS',
        'JARDIM DAS OLIVEIRAS', 'JARDIM DOM BOSCO', 'JARDIM HIMALAIA', 'JARDIM IPÊ', 'JARDIM MARANATA',
        'JARDIM SÃO CONRADO', 'JARDIM VENEZA',
        'JARDINS FLORENÇA', 'MADRE GERMANA', 'MORADA DOS PÁSSAROS', 'PARQUE DAS NAÇÕES',
        'PARQUE FLORESTA', 'PARQUE HAYALA', 'PARQUE IBIRAPUERA', 'PORTO DAS PEDRAS',
        'QUINTA DA BOA VISTA', 'RESIDENCIAL ANHAMBI', 'RESIDENCIAL ARAGUAIA',
        'RESIDENCIAL BOA ESPERANÇA', 'RESIDENCIAL CARAÍBAS', 'RESIDENCIAL GOIANI',
        'RESIDENCIAL NORTE SUL', 'RESIDENCIAL PÔR DO SOL', 'RESIDENCIAL SERRA DAS BRISAS',
        'RIVIERA SUL', 'SETOR AEROPORTO SUL I, II E III', 'SETOR COLINA DE HOMERO',
        'SETOR DOS BANDEIRANTES', 'SETOR NOVA CIDADE', 'SETOR PONTAL SUL', 'SETOR PONTAL SUL COMP.',
        'SETOR SERRA DAS BRISAS', 'VILA DELFIORE', 'VILA ROMANA',
    ]),
    (TQS, 'NOTURNO', [
        'BAIRRO CARDOSO (DIVISA COM VERA CRUZ)', 'BAIRRO CARDOSO CONTINUAÇÃO', 'BAIRRO CARDOSO I',
        'CIDADE VERA CRUZ - JARDINS VIENA', 'FAZENDA SANTO ANTÔNIO',
        'JARDIM BURITI SERENO (LADO DO GARAVELO)', 'JARDIM HELVÉCIA', 'JARDIM IMPERIAL',
        'JARDIM MONT SERRAT', 'JARDIM NOVA ERA', 'JARDIM NOVA ERA ACRÉSCIMO', 'JARDIM TIRADENTES',
        'PARQUE INDUST. VICE PRES. JOSÉ ALENCAR I E II', 'PARQUE PRIMAVERA',
        'RESIDENCIAL CAMPOS ELISEOS', 'RESIDENCIAL PARK', 'SETOR GARAVELO RESIDENCIAL PARK',
        'SETOR GARAVELO E', 'VILA ALZIRA', 'VILA BRASÍLIA', 'VILA REAL',
    ]),
    (DIARIO, 'NOTURNO', [
        'BAIRRO ILDA', 'BELO HORIZONTE', 'CENTRO', 'CIDADE SATÉLITE SÃO LUIZ', 'CIDADE VERA CRUZ I E II',
        'CONJUNTO CRUZEIRO DO SUL', 'CONJUNTO ESTRELA DO SUL', 'CONJUNTO LIBERDADE',
        'CONJUNTO PROGRESSO', 'CONJUNTO SANTA FÉ', 'JARDIM DAS ESMERALDAS', 'JARDIM LUZ',
        'JARDIM MARIA INÊS', 'JARDIM NOVA ERA', 'JARDIM TROPICAL', 'JARDINS VIENA',
        'RES. VILLAGE GARAVELO I', 'RESIDENCIAL BRASICON', 'SETOR ARAGUAIA', 'SETOR DOS AFONSOS',
        'SETOR GARAVELO', 'SETOR SANTO ANTÔNIO', 'VILA BRASÍLIA', 'VILA MARIANA', 'VILA ROSA',
        'VILA SÃO MANOEL', 'VILA SÃO TOMAZ', 'VILA SUL',
    ]),
]
