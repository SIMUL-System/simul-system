package com.simulsystem.backend.core.security;

import com.simulsystem.backend.business.usuario.model.Usuario;
import com.simulsystem.backend.business.usuario.repository.UsuarioRepository;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/** Carrega o usuário pelo e-mail para o login do Spring Security. */
@Service
public class UsuarioDetailsService
        implements UserDetailsService {
    private final UsuarioRepository usuarioRepository;
    private final CriptografiaDados criptografia;

    public UsuarioDetailsService(UsuarioRepository usuarioRepository, CriptografiaDados criptografia) {
        this.usuarioRepository = usuarioRepository;
        this.criptografia = criptografia;
    }

    /** Usuário pelo e-mail; conta inativa fica desabilitada. */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository
                        .findByEmailHash(criptografia.indiceEmail(email))
                        .orElseThrow(() ->
                                new UsernameNotFoundException("Usuário não encontrado.")
                        );

        return User
                .withUsername(usuario.getEmail())
                .password(usuario.getSenha())
                .roles(usuario.getPerfil().name())
                .disabled(!Boolean.TRUE.equals(usuario.getAtivo()))
                .build();
    }
}
