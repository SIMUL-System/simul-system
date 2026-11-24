package com.simulsystem.backend.business.usuario.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Corpo do cadastro. A senha vai até 72 caracteres, o limite do BCrypt. */
public record UsuarioRequestDTO(

        @NotBlank(message = "O nome é obrigatório.")
        @Size(max = 120, message = "O nome deve possuir no máximo 120 caracteres.")
        String nome,

        @NotBlank(message = "O e-mail é obrigatório.")
        @Email(message = "O e-mail informado é inválido.")
        @Size(max = 150, message = "O e-mail deve possuir no máximo 150 caracteres.")
        String email,

        @NotBlank(message = "A senha é obrigatória.")
        @Size(min = 8, max = 72, message = "A senha deve possuir entre 8 e 72 caracteres.")
        String senha
) {
}
