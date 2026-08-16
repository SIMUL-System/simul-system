package com.simulsystem.backend.business.usuario.service;

import com.simulsystem.backend.business.usuario.dto.LoginRequestDTO;
import com.simulsystem.backend.business.usuario.dto.LoginResponseDTO;
import com.simulsystem.backend.business.usuario.dto.UsuarioRequestDTO;
import com.simulsystem.backend.business.usuario.dto.UsuarioResponseDTO;
import com.simulsystem.backend.business.usuario.model.Usuario;

public interface UsuarioService {

    UsuarioResponseDTO cadastrar(
            UsuarioRequestDTO requestDTO
    );

    LoginResponseDTO autenticar(
            LoginRequestDTO requestDTO
    );

    UsuarioResponseDTO buscarUsuarioAutenticado(
            String email
    );

    Usuario buscarEntidadePorEmail(
            String email
    );
}