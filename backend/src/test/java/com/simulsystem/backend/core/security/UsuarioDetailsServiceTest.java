package com.simulsystem.backend.core.security;

import com.simulsystem.backend.business.usuario.model.PerfilUsuario;
import com.simulsystem.backend.business.usuario.model.Usuario;
import com.simulsystem.backend.business.usuario.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UsuarioDetailsServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    private UsuarioDetailsService usuarioDetailsService;

    @BeforeEach
    void setUp() {
        usuarioDetailsService =
                new UsuarioDetailsService(
                        usuarioRepository
                );
    }

    @Test
    void deveCarregarUsuarioAtivoComRoleUsuario() {
        String email =
                "usuario@simul.local";

        Usuario usuario =
                new Usuario();

        usuario.setEmail(email);
        usuario.setSenha(
                "$2a$10$senhaCriptografada"
        );
        usuario.setPerfil(
                PerfilUsuario.USUARIO
        );
        usuario.setAtivo(true);

        when(
                usuarioRepository
                        .findByEmailIgnoreCase(email)
        ).thenReturn(
                Optional.of(usuario)
        );

        UserDetails resultado =
                usuarioDetailsService
                        .loadUserByUsername(email);

        assertEquals(
                email,
                resultado.getUsername()
        );

        assertTrue(
                resultado.isEnabled()
        );

        assertTrue(
                resultado
                        .getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                authority
                                        .getAuthority()
                                        .equals(
                                                "ROLE_USUARIO"
                                        )
                        )
        );

        verify(
                usuarioRepository
        ).findByEmailIgnoreCase(email);
    }

    @Test
    void deveCarregarAdministradorComRoleAdmin() {
        String email =
                "admin@simul.local";

        Usuario usuario =
                new Usuario();

        usuario.setEmail(email);
        usuario.setSenha(
                "$2a$10$senhaCriptografada"
        );
        usuario.setPerfil(
                PerfilUsuario.ADMIN
        );
        usuario.setAtivo(true);

        when(
                usuarioRepository
                        .findByEmailIgnoreCase(email)
        ).thenReturn(
                Optional.of(usuario)
        );

        UserDetails resultado =
                usuarioDetailsService
                        .loadUserByUsername(email);

        assertTrue(
                resultado
                        .getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                authority
                                        .getAuthority()
                                        .equals(
                                                "ROLE_ADMIN"
                                        )
                        )
        );
    }

    @Test
    void deveMarcarUsuarioInativoComoDesabilitado() {
        String email =
                "inativo@simul.local";

        Usuario usuario =
                new Usuario();

        usuario.setEmail(email);
        usuario.setSenha(
                "$2a$10$senhaCriptografada"
        );
        usuario.setPerfil(
                PerfilUsuario.USUARIO
        );
        usuario.setAtivo(false);

        when(
                usuarioRepository
                        .findByEmailIgnoreCase(email)
        ).thenReturn(
                Optional.of(usuario)
        );

        UserDetails resultado =
                usuarioDetailsService
                        .loadUserByUsername(email);

        assertFalse(
                resultado.isEnabled()
        );
    }

    @Test
    void deveLancarExcecaoQuandoUsuarioNaoExistir() {
        String email =
                "inexistente@simul.local";

        when(
                usuarioRepository
                        .findByEmailIgnoreCase(email)
        ).thenReturn(
                Optional.empty()
        );

        assertThrows(
                UsernameNotFoundException.class,
                () ->
                        usuarioDetailsService
                                .loadUserByUsername(
                                        email
                                )
        );
    }
}