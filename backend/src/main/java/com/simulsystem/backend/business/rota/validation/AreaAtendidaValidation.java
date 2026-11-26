package com.simulsystem.backend.business.rota.validation;

import com.simulsystem.backend.business.rota.model.AreaAtendida;
import com.simulsystem.backend.business.rota.repository.AreaAtendidaRepository;
import com.simulsystem.backend.core.exception.AreaAtendidaJaCadastradaException;
import com.simulsystem.backend.core.exception.AreaAtendidaNaoEncontradaException;
import com.simulsystem.backend.core.exception.GeometriaGeoJsonInvalidaException;

import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/** Regras das áreas atendidas: duplicidade, existência e contorno GeoJSON. */
@Component
public class AreaAtendidaValidation {

    private final AreaAtendidaRepository areaAtendidaRepository;
    private final ObjectMapper objectMapper;

    public AreaAtendidaValidation(AreaAtendidaRepository areaAtendidaRepository, ObjectMapper objectMapper) {
        this.areaAtendidaRepository = areaAtendidaRepository;
        this.objectMapper = objectMapper;
    }

    /** Impede bairro repetido na mesma cidade. */
    public void validarAreaNaoCadastrada(Long cidadeId, String bairro) {
        boolean existe = areaAtendidaRepository.existsByCidade_IdAndBairroIgnoreCase(cidadeId, bairro);

        if (existe) {
            throw new AreaAtendidaJaCadastradaException(
                    "Já existe uma área atendida cadastrada para esta cidade e bairro."
            );
        }
    }

    /** Mesma regra na edição, ignorando o próprio registro. */
    public void validarAreaNaoCadastradaParaOutroRegistro(Long id, Long cidadeId, String bairro) {
        boolean existe = areaAtendidaRepository.existsByCidade_IdAndBairroIgnoreCaseAndIdNot(cidadeId, bairro, id);

        if (existe) {
            throw new AreaAtendidaJaCadastradaException(
                    "Já existe outra área atendida cadastrada para esta cidade e bairro."
            );
        }
    }

    /** Aceita só Polygon ou MultiPolygon com coordenadas. */
    public void validarGeometriaGeoJson(String geometriaGeoJson) {
        try {
            JsonNode geoJson = objectMapper.readTree(geometriaGeoJson);

            if (geoJson == null || !geoJson.isObject()) {
                throw new GeometriaGeoJsonInvalidaException("A geometria deve ser um objeto GeoJSON válido.");
            }

            JsonNode tipo = geoJson.get("type");

            if (tipo == null || !tipo.isString()) {
                throw new GeometriaGeoJsonInvalidaException("A geometria GeoJSON deve possuir o campo 'type'.");
            }

            String tipoGeometria = tipo.asString();

            if (!tipoGeometria.equals("Polygon") && !tipoGeometria.equals("MultiPolygon")) {
                throw new GeometriaGeoJsonInvalidaException("A geometria deve ser do tipo Polygon ou MultiPolygon.");
            }

            JsonNode coordenadas = geoJson.get("coordinates");

            if (coordenadas == null || !coordenadas.isArray() || coordenadas.isEmpty()) {
                throw new GeometriaGeoJsonInvalidaException("A geometria GeoJSON deve possuir coordenadas válidas.");
            }
        } catch (JacksonException exception) {
            throw new GeometriaGeoJsonInvalidaException("A geometria informada não contém um JSON válido.");
        }
    }

    /** Área pelo id ou 404. */
    public AreaAtendida buscarPorId(Long id) {
        return areaAtendidaRepository
                .findById(id)
                .orElseThrow(() ->
                        new AreaAtendidaNaoEncontradaException("Área atendida não encontrada.")
                );
    }

    /** Área do bairro com rota ativa ou 404. */
    public AreaAtendida buscarAreaAtendidaComRotaAtiva(String cidade, String bairro) {
        return areaAtendidaRepository
                .findByCidade_NomeIgnoreCaseAndBairroIgnoreCaseAndRota_AtivoTrue(cidade, bairro)
                .orElseThrow(() ->
                        new AreaAtendidaNaoEncontradaException(
                                "Não existe rota ativa para a cidade e bairro informados."
                        )
                );
    }
}
