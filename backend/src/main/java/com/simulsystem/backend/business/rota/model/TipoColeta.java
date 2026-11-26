package com.simulsystem.backend.business.rota.model;

/**
 * Tipo de coleta da rota, conforme a fonte. Quando o documento da prefeitura
 * não diz se é a coleta seletiva, a rota fica NAO_INFORMADO, e a consulta
 * avisa o morador, em vez de afirmar que é seletiva.
 */
public enum TipoColeta {
    SELETIVA,
    NAO_INFORMADO
}
