package com.simulsystem.backend.business.usuario.service;

import com.simulsystem.backend.business.usuario.dto.LoginRequestDTO;
import com.simulsystem.backend.business.usuario.dto.LoginResponseDTO;
import com.simulsystem.backend.business.usuario.dto.UsuarioRequestDTO;
import com.simulsystem.backend.business.usuario.dto.UsuarioResponseDTO;
import com.simulsystem.backend.business.usuario.model.Usuario;

/** Cadastro, login e busca do usuário. */
public interface UsuarioService {

    /** Cria a conta (perfil USUARIO, e-mail ainda não confirmado) e envia a confirmação. */
    UsuarioResponseDTO cadastrar(UsuarioRequestDTO requestDTO);

    /** Valida e-mail e senha e gera o JWT; exige e-mail confirmado. */
    LoginResponseDTO autenticar(LoginRequestDTO requestDTO);

    /** Dados do usuário logado. */
    UsuarioResponseDTO buscarUsuarioAutenticado(String email);

    /** Entidade do usuário pelo e-mail ou 404. */
    Usuario buscarEntidadePorEmail(String email);
}
