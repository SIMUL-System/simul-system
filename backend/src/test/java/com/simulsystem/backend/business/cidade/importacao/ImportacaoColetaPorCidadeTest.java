package com.simulsystem.backend.business.cidade.importacao;

import com.simulsystem.backend.business.cronograma.model.DiaSemana;
import com.simulsystem.backend.business.cronograma.model.Turno;
import com.simulsystem.backend.business.rota.model.TipoColeta;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Confere os dados da importação (V25) lendo a própria migration: contagem por
 * cidade, nenhum bairro repetido, cidades separadas e cada bairro numa rota
 * com exatamente os dias e turnos da fonte.
 */
class ImportacaoColetaPorCidadeTest {

    private static final String MIGRATION = "db/migration/V25__importar_coleta_por_cidade.sql";

    private static List<List<String>> cidades;
    private static List<List<String>> rotas;
    private static List<List<String>> agenda;
    private static List<List<String>> bairros;

    @BeforeAll
    static void lerMigration() throws IOException {
        String sql;

        try (InputStream entrada = ImportacaoColetaPorCidadeTest.class.getClassLoader().getResourceAsStream(MIGRATION)) {
            assertNotNull(entrada, "A migration V25 precisa estar no classpath.");
            sql = new String(entrada.readAllBytes(), StandardCharsets.UTF_8);
        }

        cidades = valores(sql, "v25_cidade");
        rotas = valores(sql, "v25_rota");
        agenda = valores(sql, "v25_agenda");
        bairros = valores(sql, "v25_bairro");
    }

    @Test
    void deveImportarAsQuatroCidadesComAQuantidadeDeBairrosDoLevantamento() {
        Map<String, Long> porCidade = bairros.stream()
                .collect(Collectors.groupingBy(linha -> linha.get(0), Collectors.counting()));

        assertEquals(4, cidades.size());
        assertEquals(492L, (long) porCidade.get("Goiânia"));
        assertEquals(226L, (long) porCidade.get("Aparecida de Goiânia"));
        assertEquals(120L, (long) porCidade.get("Trindade"));
        assertEquals(109L, (long) porCidade.get("Senador Canedo"));
    }

    @Test
    void naoDeveRepetirBairroNaMesmaCidade() {
        Set<String> vistos = new HashSet<>();

        for (List<String> linha : bairros) {
            String chave = linha.get(0) + "|" + semAcento(linha.get(1));
            assertTrue(vistos.add(chave), "Bairro repetido: " + linha);
        }
    }

    @Test
    void cadaBairroDeveFicarNumaRotaDaPropriaCidade() {
        Set<String> rotasPorCidade = rotas.stream()
                .map(linha -> linha.get(0) + "|" + linha.get(1))
                .collect(Collectors.toSet());

        for (List<String> linha : bairros) {
            assertTrue(rotasPorCidade.contains(linha.get(0) + "|" + linha.get(2)),
                    "Rota inexistente ou de outra cidade para " + linha);
            assertTrue(linha.get(2).startsWith(linha.get(0) + " - "), "Rota sem o nome da cidade: " + linha);
        }
    }

    @Test
    void cadaRotaDeveTerDiasETurnosValidosESemRepeticao() {
        Map<String, Set<String>> agendaPorRota = new HashMap<>();

        for (List<String> linha : agenda) {
            DiaSemana.valueOf(linha.get(2));
            Turno.valueOf(linha.get(3));
            String rota = linha.get(0) + "|" + linha.get(1);
            assertTrue(agendaPorRota.computeIfAbsent(rota, chave -> new HashSet<>()).add(linha.get(2) + linha.get(3)),
                    "Dia e turno repetidos na rota " + rota);
        }

        for (List<String> rota : rotas) {
            assertFalse(agendaPorRota.getOrDefault(rota.get(0) + "|" + rota.get(1), Set.of()).isEmpty(),
                    "Rota sem dias de coleta: " + rota.get(1));
            TipoColeta.valueOf(rota.get(3));
        }

        // Rotas diferentes da mesma cidade não podem ter a mesma agenda.
        Map<String, String> agendaJaUsada = new HashMap<>();
        for (List<String> rota : rotas) {
            String assinatura = rota.get(0) + "|" + new TreeSet<>(agendaPorRota.get(rota.get(0) + "|" + rota.get(1)));
            String outra = agendaJaUsada.putIfAbsent(assinatura, rota.get(1));
            assertEquals(null, outra, "Duas rotas com a mesma agenda: " + rota.get(1) + " e " + outra);
        }
    }

    @Test
    void soGoianiaDeveSerClassificadaComoSeletiva() {
        for (List<String> rota : rotas) {
            TipoColeta esperado = rota.get(0).equals("Goiânia") ? TipoColeta.SELETIVA : TipoColeta.NAO_INFORMADO;
            assertEquals(esperado.name(), rota.get(3), rota.get(1));
        }
    }

    @Test
    void deveManterAsAssociacoesDaFonte() {
        assertEquals(List.of("SEGUNDA/DIURNO", "QUARTA/DIURNO", "SEXTA/DIURNO"),
                agendaDoBairro("Senador Canedo", "Bairro São Francisco II"));
        // Coleta nos dois turnos no mesmo dia (Trindade).
        assertEquals(List.of("SEGUNDA/DIURNO", "SEGUNDA/NOTURNO", "QUARTA/DIURNO", "QUARTA/NOTURNO",
                        "SEXTA/DIURNO", "SEXTA/NOTURNO"),
                agendaDoBairro("Trindade", "Ponta Kayana"));
        // Goiânia: só as colunas da coleta seletiva.
        assertEquals(List.of("QUINTA/NOTURNO"), agendaDoBairro("Goiânia", "Abapuru"));
        // Sem turno na fonte: turno não informado, sem horário inventado.
        assertEquals(List.of("QUARTA/NAO_INFORMADO"), agendaDoBairro("Goiânia", "Chac. Mansões Rosa de Ouro"));
    }

    @Test
    void deveCorrigirAsGrafiasErradasDaImagemDeSenadorCanedo() {
        Set<String> nomes = bairros.stream()
                .filter(linha -> linha.get(0).equals("Senador Canedo"))
                .map(linha -> linha.get(1))
                .collect(Collectors.toSet());

        assertTrue(nomes.contains("Bairro São Francisco II"));
        assertTrue(nomes.contains("Bairro das Indústrias"));
        assertTrue(nomes.contains("Sítio Mansões Retiro"));
        assertFalse(nomes.contains("Bairro São Fransciso II"));
    }

    @Test
    void mesmoNomeDeBairroEmCidadesDiferentesSaoBairrosDiferentes() {
        long centros = bairros.stream().filter(linha -> linha.get(1).equals("Centro")).count();
        Set<String> cidadesComCentro = bairros.stream()
                .filter(linha -> linha.get(1).equals("Centro"))
                .map(linha -> linha.get(0))
                .collect(Collectors.toSet());

        // "Centro" existe em mais de uma cidade, uma vez em cada.
        assertTrue(centros >= 2);
        assertEquals(centros, (long) cidadesComCentro.size());
    }

    private static List<String> agendaDoBairro(String cidade, String bairro) {
        String rota = bairros.stream()
                .filter(linha -> linha.get(0).equals(cidade) && linha.get(1).equals(bairro))
                .map(linha -> linha.get(2))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Bairro não importado: " + bairro));

        List<DiaSemana> ordem = List.of(DiaSemana.values());

        return agenda.stream()
                .filter(linha -> linha.get(0).equals(cidade) && linha.get(1).equals(rota))
                .sorted((a, b) -> {
                    int dia = Integer.compare(ordem.indexOf(DiaSemana.valueOf(a.get(2))),
                            ordem.indexOf(DiaSemana.valueOf(b.get(2))));
                    return dia != 0 ? dia : Integer.compare(Turno.valueOf(a.get(3)).ordinal(),
                            Turno.valueOf(b.get(3)).ordinal());
                })
                .map(linha -> linha.get(2) + "/" + linha.get(3))
                .toList();
    }

    /** Linhas do INSERT INTO tabela (...) VALUES (...), (...); */
    private static List<List<String>> valores(String sql, String tabela) {
        int inicio = sql.indexOf("INSERT INTO " + tabela + " ");
        assertTrue(inicio >= 0, "INSERT de " + tabela + " não encontrado.");
        int values = sql.indexOf("VALUES", inicio) + "VALUES".length();

        List<List<String>> linhas = new ArrayList<>();
        List<String> atual = null;
        StringBuilder texto = null;

        for (int i = values; i < sql.length(); i++) {
            char c = sql.charAt(i);

            if (texto != null) {
                if (c == '\'' && i + 1 < sql.length() && sql.charAt(i + 1) == '\'') {
                    texto.append('\'');
                    i++;
                } else if (c == '\'') {
                    atual.add(texto.toString());
                    texto = null;
                } else {
                    texto.append(c);
                }
            } else if (c == '(') {
                atual = new ArrayList<>();
            } else if (c == '\'') {
                texto = new StringBuilder();
            } else if (c == ')') {
                linhas.add(atual);
            } else if (c == ';') {
                break;
            }
        }

        return linhas;
    }

    private static String semAcento(String texto) {
        return Normalizer.normalize(texto, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .trim();
    }
}
