package com.simulsystem.backend.business.cronograma.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalTime;
import java.util.List;

/**
 * Pedido para alterar o horário de vários cronogramas de uma só vez.
 * A alteração é atômica: ou todos os cronogramas mudam, ou nenhum muda.
 */
public record CronogramaHorarioLoteRequestDTO(

        @NotEmpty(message = "Selecione pelo menos um cronograma.")
        @Size(max = 200, message = "É possível alterar no máximo 200 cronogramas por vez.")
        List<@NotNull(message = "O identificador do cronograma é obrigatório.") Long> ids,

        @NotNull(message = "O horário de início é obrigatório.")
        LocalTime horarioInicio,

        @NotNull(message = "O horário de fim é obrigatório.")
        LocalTime horarioFim
) {
}
