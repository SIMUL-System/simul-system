package com.simulsystem.backend.business.institucional.dto;

/** Bytes e tipo de uma imagem, para o controller devolver o arquivo. */
public record ImagemArquivoDTO(String tipoConteudo, byte[] dados) {
}
