package com.simulsystem.backend.business.usuario.mapper;

import com.simulsystem.backend.business.usuario.dto.UsuarioRequestDTO;
import com.simulsystem.backend.business.usuario.dto.UsuarioResponseDTO;
import com.simulsystem.backend.business.usuario.model.Usuario;
import org.springframework.stereotype.Component;

@Component
public class UsuarioMapper {

    public Usuario toEntity(
            UsuarioRequestDTO requestDTO
    ) {
        Usuario usuario = new Usuario();

        usuario.setNome(requestDTO.nome());
        usuario.setEmail(requestDTO.email());

        return usuario;
    }

    public UsuarioResponseDTO toResponseDTO(
            Usuario usuario
    ) {
        return new UsuarioResponseDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil(),
                usuario.getAtivo(),
                usuario.getDataCriacao(),
                usuario.getDataAtualizacao()
        );
    }
}