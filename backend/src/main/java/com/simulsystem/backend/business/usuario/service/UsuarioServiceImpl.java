package com.simulsystem.backend.business.usuario.service;

import com.simulsystem.backend.business.usuario.dto.LoginRequestDTO;
import com.simulsystem.backend.business.usuario.dto.LoginResponseDTO;
import com.simulsystem.backend.business.usuario.dto.UsuarioRequestDTO;
import com.simulsystem.backend.business.usuario.dto.UsuarioResponseDTO;
import com.simulsystem.backend.business.usuario.mapper.UsuarioMapper;
import com.simulsystem.backend.business.usuario.model.Usuario;
import com.simulsystem.backend.business.usuario.repository.UsuarioRepository;
import com.simulsystem.backend.business.usuario.validation.UsuarioValidation;
import com.simulsystem.backend.core.exception.CredenciaisInvalidasException;
import com.simulsystem.backend.core.exception.EmailNaoVerificadoException;
import com.simulsystem.backend.core.exception.UsuarioNaoEncontradoException;
import com.simulsystem.backend.core.security.JwtService;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;
    private final UsuarioValidation usuarioValidation;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final VerificacaoEmailService verificacaoEmailService;

    public UsuarioServiceImpl(
            UsuarioRepository usuarioRepository,
            UsuarioMapper usuarioMapper,
            UsuarioValidation usuarioValidation,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            VerificacaoEmailService verificacaoEmailService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioMapper = usuarioMapper;
        this.usuarioValidation = usuarioValidation;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.verificacaoEmailService = verificacaoEmailService;
    }

    @Override
    public UsuarioResponseDTO cadastrar(UsuarioRequestDTO requestDTO) {
        String emailNormalizado = normalizarEmail(requestDTO.email());

        usuarioValidation.validarEmailNaoCadastrado(emailNormalizado);

        Usuario usuario = usuarioMapper.toEntity(requestDTO);

        usuario.setEmail(emailNormalizado);
        usuario.setSenha(passwordEncoder.encode(requestDTO.senha()));
        usuario.setEmailVerificado(false);

        Usuario usuarioSalvo = usuarioRepository.save(usuario);

        verificacaoEmailService.enviarVerificacao(usuarioSalvo);

        return usuarioMapper.toResponseDTO(usuarioSalvo);
    }

    @Override
    public LoginResponseDTO autenticar(LoginRequestDTO requestDTO) {
        String emailNormalizado = normalizarEmail(requestDTO.email());

        try {
            Authentication authentication = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(
                            emailNormalizado,
                            requestDTO.senha()
                    )
            );

            Usuario usuario = usuarioRepository
                    .findByEmailIgnoreCase(emailNormalizado)
                    .orElseThrow(() ->
                            new CredenciaisInvalidasException(
                                    "E-mail ou senha inválidos."
                            )
                    );

            if (!Boolean.TRUE.equals(usuario.getEmailVerificado())) {
                throw new EmailNaoVerificadoException(
                        "Confirme seu e-mail antes de entrar."
                );
            }

            String token = jwtService.gerarToken(authentication);

            return new LoginResponseDTO(token, "Bearer");

        } catch (AuthenticationException exception) {
            throw new CredenciaisInvalidasException(
                    "E-mail ou senha inválidos."
            );
        }
    }

    @Override
    public UsuarioResponseDTO buscarUsuarioAutenticado(String email) {
        Usuario usuario = buscarEntidadePorEmail(email);

        return usuarioMapper.toResponseDTO(usuario);
    }

    @Override
    public Usuario buscarEntidadePorEmail(String email) {
        String emailNormalizado = normalizarEmail(email);

        return usuarioRepository
                .findByEmailIgnoreCase(emailNormalizado)
                .orElseThrow(() ->
                        new UsuarioNaoEncontradoException(
                                "Usuário autenticado não foi encontrado."
                        )
                );
    }

    private String normalizarEmail(String email) {
        if (email == null) {
            return null;
        }

        return email.trim().toLowerCase(Locale.ROOT);
    }
}