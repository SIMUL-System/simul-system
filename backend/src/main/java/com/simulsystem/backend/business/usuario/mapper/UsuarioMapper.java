package com.simulsystem.backend.business.usuario.mapper;

import com.simulsystem.backend.business.usuario.dto.UsuarioRequestDTO;
import com.simulsystem.backend.business.usuario.dto.UsuarioResponseDTO;
import com.simulsystem.backend.business.usuario.model.Usuario;

import org.springframework.stereotype.Component;

/** Converte entre Usuario e seus DTOs. */
@Component
public class UsuarioMapper {

    /** Cria o usuário a partir do cadastro (a senha é tratada no service). */
    public Usuario toEntity(UsuarioRequestDTO requestDTO) {
        Usuario usuario = new Usuario();

        usuario.setNome(requestDTO.nome());

        usuario.setEmail(requestDTO.email());

        return usuario;
    }

    /** Monta a resposta sem a senha. */
    public UsuarioResponseDTO toResponseDTO(Usuario usuario) {
        return new UsuarioResponseDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil(),
                usuario.getAtivo(),
                usuario.getEmailVerificado(),
                usuario.getDataCriacao(),
                usuario.getDataAtualizacao()
        );
    }
}
