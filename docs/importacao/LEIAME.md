# Importação dos dados municipais

Scripts que geraram a `V25__importar_coleta_por_cidade.sql` e o relatório
`docs/levantamento-dados-municipais.md`. Servem para conferência e para
refazer a importação quando a prefeitura publicar dados novos (numa **nova**
migration — nunca edite a V25 depois de aplicada).

| Arquivo | Conteúdo |
|---|---|
| `Goiania/goiania.json` | Linhas do PDF da Comurg extraídas por posição das colunas: `[bairro, freq. orgânica, turno orgânica, freq. seletiva, turno seletiva, página, y]`. Só as colunas da seletiva são usadas. |
| `Trindade/Trindade.txt` | Arquivo original de Trindade. |
| `dados_fontes.py` | Transcrição fiel das imagens de Aparecida de Goiânia e Senador Canedo. |
| `levantamento.py` | Leitura, normalização e análise (repetidos, dois turnos, nomes parecidos). |
| `gerar_v25.py` | Gera a migration e o relatório. |

```bash
cd docs/importacao
python3 gerar_v25.py . ../..
```
