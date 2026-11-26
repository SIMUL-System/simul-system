# Levantamento dos dados municipais de coleta

Gerado a partir dos arquivos de `Cidade.Bairros.Horarios.zip` e importado pela migration
`V25__importar_coleta_por_cidade.sql`. Nenhum horário foi inventado: as fontes informam
só **dias e turno** (diurno ou noturno), e é isso que o sistema guarda e mostra.

## Regras usadas na importação

- Nomes mantidos como na fonte, com acentos, números romanos e subdivisões (ex.: "JD. Do Cerrado 1" a "11", "Imperial I" e "Imperial II" são bairros diferentes).
- Aparecida de Goiânia vem em MAIÚSCULAS nas imagens: convertido para iniciais maiúsculas, mantendo acentos, romanos e abreviações.
- Cada bairro fica numa rota que reúne **exatamente** os mesmos dias e turnos. Bairro listado em mais de um grupo da fonte recebe a soma dos dias (nada é descartado).
- Tipo de coleta: só Goiânia diz que é a **seletiva** (colunas "Freq. Coleta Seletiva" e "Turno Seletiva"). Nas demais o tipo fica **não informado**, e a consulta avisa o morador.
- Bairros que já existiam (Senador Canedo) mantêm id, contorno e preferências; só a rota muda quando a fonte manda.
- Lembretes de coleta sem horário usam o começo de referência do turno (diurno 06:00, noturno 18:00) apenas para calcular quando avisar. Esse horário não é exibido como horário da coleta.

## Resumo por cidade

| Cidade | Bairros | Rotas (padrões de dias e turno) | Tipo de coleta |
|---|---:|---:|---|
| Goiânia | 492 | 18 | Seletiva |
| Aparecida de Goiânia | 226 | 11 | Não informado pela fonte |
| Trindade | 120 | 19 | Não informado pela fonte |
| Senador Canedo | 109 | 5 | Não informado pela fonte |

## Goiânia

**Fonte:** Comurg - Frequência dos serviços de coleta (orgânica e seletiva), arquivo FREQUENCIA-COLETA-ORGANICA-E-SELETIVA-B.pdf. Importadas só as colunas da coleta seletiva.

### Rotas

| Rota | Bairros |
|---|---:|
| Goiânia - Diurna (seg) | 82 |
| Goiânia - Diurna (qui) | 63 |
| Goiânia - Diurna (ter) | 52 |
| Goiânia - Noturna (qua) | 48 |
| Goiânia - Noturna (qui) | 46 |
| Goiânia - Diurna (qua) | 46 |
| Goiânia - Noturna (sex) | 43 |
| Goiânia - Noturna (ter) | 36 |
| Goiânia - Noturna (seg) | 23 |
| Goiânia - Noturna (sáb) | 23 |
| Goiânia - Diurna (ter, qui e sáb) | 9 |
| Goiânia - Diurna (seg, qua e sex) | 6 |
| Goiânia - Noturna (todos os dias) | 5 |
| Goiânia - Diurna (sáb) | 4 |
| Goiânia - Noturna (ter, qui e sáb) | 2 |
| Goiânia - Diurna (sex) | 2 |
| Goiânia - Turno não informado (qua) | 1 |
| Goiânia - Noturna (dom) | 1 |

### Pendências e inconsistências

- "Chac. Mansões Rosa de Ouro" tem frequência seletiva (quarta) sem turno: cadastrado com turno não informado.
- Cinco bairros têm coleta seletiva "Diário": cadastrados nos 7 dias. Confirmar se inclui domingo.
- Alguns nomes vêm com maiúsculas irregulares na fonte (ex.: "Bairro da vitoria", "Vila São francisco"); mantidos como estão para não alterar o nome oficial.
- Nomes parecidos mantidos separados (podem ser grafias diferentes do mesmo bairro; confirmar com a prefeitura): "Parque Santa Maria" / "Parque Santa Rita".

## Aparecida de Goiânia

**Fonte:** Cinco imagens de cronograma de coleta (whatsapp-image-2025-06-03-*.jpeg). As imagens informam dias e turno, mas não dizem se a coleta é a seletiva.

### Rotas

| Rota | Bairros |
|---|---:|
| Aparecida de Goiânia - Diurna (seg, qua e sex) | 97 |
| Aparecida de Goiânia - Diurna (ter, qui e sáb) | 51 |
| Aparecida de Goiânia - Noturna (todos os dias) | 27 |
| Aparecida de Goiânia - Noturna (seg, qua e sex) | 25 |
| Aparecida de Goiânia - Noturna (ter, qui e sáb) | 15 |
| Aparecida de Goiânia - Diurna (seg, qua e sex) + Noturna (seg, qua e sex) | 3 |
| Aparecida de Goiânia - Noturna (seg a sáb) | 3 |
| Aparecida de Goiânia - Diurna (seg a sáb) | 2 |
| Aparecida de Goiânia - Diurna (seg, qua e sex) + Noturna (todos os dias) | 1 |
| Aparecida de Goiânia - Diurna (ter, qui e sáb) + Noturna (seg a sáb) | 1 |
| Aparecida de Goiânia - Diurna (ter, qui e sáb) + Noturna (seg, qua e sex) | 1 |

### Pendências e inconsistências

- As imagens não dizem se a coleta é a seletiva: rotas cadastradas com tipo "não informado".
- "Jardim Riviera e Riviera Sul" (um item) e "Riviera Sul" (outro grupo) foram mantidos como estão na fonte.
- 15 bairro(s) aparecem em mais de um grupo da fonte (dias somados): Jardim Belo Horizonte (diurno seg/qua/sex, diurno ter/qui/sáb); Jardim Iracema (diurno seg/qua/sex, noturno seg/qua/sex); Jardim Rosa do Sul (diurno seg/qua/sex, noturno seg/qua/sex); Jardins Florença (diurno seg/qua/sex, diurno ter/qui/sáb); Vila Brasília (diurno seg/qua/sex, noturno seg/qua/sex, noturno ter/qui/sáb, noturno seg/ter/qua/qui/sex/sáb/dom); Vila Maria (diurno seg/qua/sex, noturno seg/qua/sex); Cidade Satélite São Luiz (noturno seg/qua/sex, noturno seg/ter/qua/qui/sex/sáb/dom); Fazenda Santo Antônio (noturno seg/qua/sex, diurno ter/qui/sáb, noturno ter/qui/sáb); Jardim Imperial (noturno seg/qua/sex, noturno ter/qui/sáb); Jardim Maria Inês (noturno seg/qua/sex, noturno seg/ter/qua/qui/sex/sáb/dom); Parque Floresta (noturno seg/qua/sex, diurno ter/qui/sáb); Parque Primavera (noturno seg/qua/sex, noturno ter/qui/sáb); Vila Real (noturno seg/qua/sex, noturno ter/qui/sáb); Vila São Manoel (noturno seg/qua/sex, noturno seg/ter/qua/qui/sex/sáb/dom); Jardim Nova Era (noturno ter/qui/sáb, noturno seg/ter/qua/qui/sex/sáb/dom).
- Coleta nos dois turnos no mesmo dia (mantida, confirmar com a prefeitura): Jardim Iracema (seg, qua, sex); Jardim Rosa do Sul (seg, qua, sex); Vila Brasília (seg, qua, sex); Vila Maria (seg, qua, sex); Fazenda Santo Antônio (ter, qui, sáb).
- Nomes parecidos mantidos separados (podem ser grafias diferentes do mesmo bairro; confirmar com a prefeitura): "Fazenda Santo Antono" / "Fazenda Santo Antônio"; "Jardim Bonanza" / "Jardim Bonança"; "Jardim Cristal" / "Jardim Cristalino"; "Jardim dos Buriti" / "Jardim dos Buritis"; "Jardim dos Palmares" / "Jardim dos Pomares"; "Vila Maria" / "Vila Mariana".

## Trindade

**Fonte:** Arquivo Trindade.txt (coleta diurna e noturna por dia da semana). O texto não diz se a coleta é a seletiva.

### Rotas

| Rota | Bairros |
|---|---:|
| Trindade - Noturna (ter, qui e sáb) | 32 |
| Trindade - Diurna (seg, qua e sex) | 19 |
| Trindade - Diurna (ter, qui e sáb) | 19 |
| Trindade - Noturna (seg, qua e sex) | 18 |
| Trindade - Diurna (seg a sáb) | 12 |
| Trindade - Diurna (qua) | 5 |
| Trindade - Noturna (seg e sex) | 2 |
| Trindade - Noturna (qua) | 2 |
| Trindade - Diurna (seg e sex) | 1 |
| Trindade - Diurna (seg, qua e sex) + Noturna (seg, qua e sex) | 1 |
| Trindade - Noturna (seg) | 1 |
| Trindade - Noturna (seg, ter, qui e sex) | 1 |
| Trindade - Diurna (ter) | 1 |
| Trindade - Diurna (ter e sáb) | 1 |
| Trindade - Noturna (ter e sáb) | 1 |
| Trindade - Noturna (ter e qui) | 1 |
| Trindade - Diurna (qui e sáb) + Noturna (ter, qui e sáb) | 1 |
| Trindade - Noturna (ter e sex) | 1 |
| Trindade - Noturna (qua e sex) | 1 |

### Pendências e inconsistências

- O texto não diz se a coleta é a seletiva: rotas cadastradas com tipo "não informado".
- A fonte escreve "Sábado-feira"; interpretado como sábado.
- "Escala" e "Loteamento Escala" aparecem como itens diferentes; mantidos separados.
- Itens que juntam subdivisões ("Serra Branca I e II", "Vila Bela I e II", "Garavelo I e II") foram mantidos como um único bairro, como na fonte.
- "Avenida Raimundo de Aquino" e "trecho da GO-469" não são bairros; cadastrados como áreas com esse nome (inicial maiúscula em "Trecho").
- Dias irregulares mantidos como na fonte (ex.: Mariápolis seg e sex; São Bernardo seg e São Bernardo II qua e sex; Juarez Freire ter e sáb; Harmonia ter e qui).
- Coleta nos dois turnos no mesmo dia (mantida, confirmar com a prefeitura): Ponta Kayana (seg, qua, sex); Escala (qui, sáb).

## Senador Canedo

**Fonte:** Imagem de cronograma de coleta (3EB074F6F680C914B599-723x1024.jpeg). Informa dias e turno, mas não diz se a coleta é a seletiva.

### Rotas

| Rota | Bairros |
|---|---:|
| Senador Canedo - Diurna (seg, qua e sex) | 47 |
| Senador Canedo - Diurna (ter, qui e sáb) | 35 |
| Senador Canedo - Noturna (seg, qua e sex) | 19 |
| Senador Canedo - Noturna (ter, qui e sáb) | 6 |
| Senador Canedo - Noturna (seg a sáb) | 2 |

### Pendências e inconsistências

- A imagem não diz se a coleta é a seletiva: rotas com tipo "não informado".
- Grafias da imagem com erro mantidas como já estavam corretas no banco: "Bairro São Fransciso II" → "Bairro São Francisco II", "Bairro das Industrias" → "Bairro das Indústrias", "Sitio Mansões Retiro" → "Sítio Mansões Retiro".
- Os horários 06:00–18:00 e 18:00–23:59 da carga antiga não vinham da prefeitura: viraram turno sem horário (V24).
- Comparação com os 109 bairros já cadastrados (V15/V18): a imagem traz os mesmos 109 bairros (111 linhas, com 2 nomes repetidos) e os mesmos 5 padrões. Nenhum bairro foi criado nem mudou de rota; ids, contornos e preferências ficaram como estavam.
- Nome repetido dentro do mesmo grupo da fonte (cadastrado uma vez): Jardim Nova Goiânia; Residencial Vale Verde.

## O que o modelo ainda não representa

- **Horário exato**: nenhuma fonte informa. O painel permite registrar o horário quando a prefeitura divulgar.
- **Parte de um bairro** (ex.: "Setor Sul (parte de cima)" em Trindade): é cadastrado como um bairro com esse nome; o sistema não divide o contorno do bairro.
- **Vias e trechos** (ex.: "Avenida Raimundo de Aquino", "Trecho da GO-469" em Trindade): cadastrados como áreas com o nome da fonte, porque não são bairros.
- **Coleta orgânica de Goiânia**: o PDF também traz a coleta orgânica, que não foi importada (o SIMUL trata da coleta seletiva).

## Atualização da V26: faixa dos turnos e coleta convencional

Decisão da equipe (26/11/2026), aplicada pela `V26__faixa_dos_turnos_e_coleta_convencional.sql`:

- **Tipo de coleta**: Aparecida de Goiânia, Trindade e Senador Canedo passam a ter as rotas como **coleta convencional** (lixo comum). Goiânia continua **seletiva**.
- **Faixa média dos turnos** por cidade, a partir das informações das operadoras. É mostrada como horário aproximado ("aprox. 19:00 – 04:00") e usada como início do turno no lembrete; o horário exato de cada rota continua não informado e varia por rua.

| Cidade | Operadora | Diurno | Noturno |
|---|---|---|---|
| Goiânia | Consórcio LimpaGyn | 07:00 – 16:00 | 19:00 – 04:00 |
| Aparecida de Goiânia | Consórcio Aparecida Limpa | 06:00 – 16:00 | 18:00 – 03:00 |
| Senador Canedo | Prefeitura de Senador Canedo | 06:00 – 16:00 | 18:00 – 03:00 |
| Trindade | Quebec Ambiental | 07:00 – 16:00 | 18:00 – 03:00 |

- Orientação mostrada ao morador: deixar o lixo na calçada até 1 hora antes do início do turno.
- **Pendência**: confirmar as faixas com documentos oficiais das operadoras; elas podem ser corrigidas no painel (Visão geral → Faixa dos turnos) sem nova migration.
