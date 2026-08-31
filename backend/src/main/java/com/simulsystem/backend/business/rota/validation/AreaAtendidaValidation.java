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

@Component
public class AreaAtendidaValidation {

    private final AreaAtendidaRepository areaAtendidaRepository;
    private final ObjectMapper objectMapper;

    public AreaAtendidaValidation(
            AreaAtendidaRepository areaAtendidaRepository,
            ObjectMapper objectMapper
    ) {
        this.areaAtendidaRepository =
                areaAtendidaRepository;

        this.objectMapper =
                objectMapper;
    }

    public void validarAreaNaoCadastrada(
            String cidade,
            String bairro
    ) {
        boolean existe =
                areaAtendidaRepository
                        .existsByCidadeIgnoreCaseAndBairroIgnoreCase(
                                cidade,
                                bairro
                        );

        if (existe) {
            throw new AreaAtendidaJaCadastradaException(
                    "Já existe uma área atendida cadastrada para esta cidade e bairro."
            );
        }
    }

    public void validarAreaNaoCadastradaParaOutroRegistro(
            Long id,
            String cidade,
            String bairro
    ) {
        boolean existe =
                areaAtendidaRepository
                        .existsByCidadeIgnoreCaseAndBairroIgnoreCaseAndIdNot(
                                cidade,
                                bairro,
                                id
                        );

        if (existe) {
            throw new AreaAtendidaJaCadastradaException(
                    "Já existe outra área atendida cadastrada para esta cidade e bairro."
            );
        }
    }

    public void validarGeometriaGeoJson(
            String geometriaGeoJson
    ) {
        try {
            JsonNode geoJson =
                    objectMapper.readTree(
                            geometriaGeoJson
                    );

            if (
                    geoJson == null ||
                    !geoJson.isObject()
            ) {
                throw new GeometriaGeoJsonInvalidaException(
                        "A geometria deve ser um objeto GeoJSON válido."
                );
            }

            JsonNode tipo =
                    geoJson.get("type");

            if (
                    tipo == null ||
                    !tipo.isTextual()
            ) {
                throw new GeometriaGeoJsonInvalidaException(
                        "A geometria GeoJSON deve possuir o campo 'type'."
                );
            }

            String tipoGeometria =
                    tipo.asText();

            if (
                    !tipoGeometria.equals("Polygon") &&
                    !tipoGeometria.equals("MultiPolygon")
            ) {
                throw new GeometriaGeoJsonInvalidaException(
                        "A geometria deve ser do tipo Polygon ou MultiPolygon."
                );
            }

            JsonNode coordenadas =
                    geoJson.get("coordinates");

            if (
                    coordenadas == null ||
                    !coordenadas.isArray() ||
                    coordenadas.isEmpty()
            ) {
                throw new GeometriaGeoJsonInvalidaException(
                        "A geometria GeoJSON deve possuir coordenadas válidas."
                );
            }

        } catch (JacksonException exception) {
            throw new GeometriaGeoJsonInvalidaException(
                    "A geometria informada não contém um JSON válido."
            );
        }
    }

    public AreaAtendida buscarPorId(
            Long id
    ) {
        return areaAtendidaRepository
                .findById(id)
                .orElseThrow(() ->
                        new AreaAtendidaNaoEncontradaException(
                                "Área atendida não encontrada."
                        )
                );
    }

    public AreaAtendida buscarAreaAtendidaExistente(
            String cidade,
            String bairro
    ) {
        return areaAtendidaRepository
                .findByCidadeIgnoreCaseAndBairroIgnoreCase(
                        cidade,
                        bairro
                )
                .orElseThrow(() ->
                        new AreaAtendidaNaoEncontradaException(
                                "Não existe rota cadastrada para a cidade e bairro informados."
                        )
                );
    }

    public AreaAtendida buscarAreaAtendidaComRotaAtiva(
            String cidade,
            String bairro
    ) {
        return areaAtendidaRepository
                .findByCidadeIgnoreCaseAndBairroIgnoreCaseAndRota_AtivoTrue(
                        cidade,
                        bairro
                )
                .orElseThrow(() ->
                        new AreaAtendidaNaoEncontradaException(
                                "Não existe rota ativa para a cidade e bairro informados."
                        )
                );
    }
}