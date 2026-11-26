package com.simulsystem.backend.business.rota.model;

/**
 * Tipo de coleta da rota, conforme a fonte: seletiva (recicláveis),
 * convencional (lixo comum) ou não informado. A consulta e o lembrete só
 * falam em "coleta seletiva" quando a rota é SELETIVA.
 */
public enum TipoColeta {
    SELETIVA,
    CONVENCIONAL,
    NAO_INFORMADO
}
