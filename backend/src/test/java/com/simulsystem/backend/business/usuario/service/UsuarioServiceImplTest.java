package com.simulsystem.backend.business.usuario.service;

import com.simulsystem.backend.business.usuario.dto.LoginRequestDTO;
import com.simulsystem.backend.business.usuario.dto.LoginResponseDTO;
import com.simulsystem.backend.business.usuario.dto.UsuarioRequestDTO;
import com.simulsystem.backend.business.usuario.dto.UsuarioResponseDTO;
import com.simulsystem.backend.business.usuario.mapper.UsuarioMapper;
import com.simulsystem.backend.business.usuario.model.PerfilUsuario;
import com.simulsystem.backend.business.usuario.model.Usuario;
import com.simulsystem.backend.business.usuario.repository.UsuarioRepository;
import com.simulsystem.backend.business.usuario.validation.UsuarioValidation;
import com.simulsystem.backend.core.exception.CredenciaisInvalidasException;
import com.simulsystem.backend.core.exception.EmailJaCadastradoException;
import com.simulsystem.backend.core.exception.UsuarioNaoEncontradoException;
import com.simulsystem.backend.core.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceImplTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private UsuarioMapper usuarioMapper;

    @Mock
    private UsuarioValidation usuarioValidation;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    private UsuarioServiceImpl usuarioService;

    @BeforeEach
    void setUp() {
        usuarioService =
                new UsuarioServiceImpl(
                        usuarioRepository,
                        usuarioMapper,
                        usuarioValidation,
                        passwordEncoder,
                        authenticationManager,
                        jwtService
                );
    }

    @Test
    void deveCadastrarUsuarioComSenhaCriptografadaEEmailNormalizado() {
        UsuarioRequestDTO requestDTO =
                new UsuarioRequestDTO(
                        "Usuário Teste",
                        "Usuario@SIMUL.Local",
                        "senha123"
                );

        Usuario usuario = new Usuario();

        Usuario usuarioSalvo = new Usuario();
        usuarioSalvo.setId(1L);
        usuarioSalvo.setNome("Usuário Teste");
        usuarioSalvo.setEmail("usuario@simul.local");

        UsuarioResponseDTO responseDTO =
                new UsuarioResponseDTO(
                        1L,
                        "Usuário Teste",
                        "usuario@simul.local",
                        PerfilUsuario.USUARIO,
                        true,
                        null,
                        null
                );

        when(
                usuarioMapper.toEntity(requestDTO)
        ).thenReturn(usuario);

        when(
                passwordEncoder.encode("senha123")
        ).thenReturn("$2a$10$senhaCriptografada");

        when(
                usuarioRepository.save(usuario)
        ).thenReturn(usuarioSalvo);

        when(
                usuarioMapper.toResponseDTO(usuarioSalvo)
        ).thenReturn(responseDTO);

        UsuarioResponseDTO resultado =
                usuarioService.cadastrar(requestDTO);

        assertSame(
                responseDTO,
                resultado
        );

        verify(
                usuarioValidation
        ).validarEmailNaoCadastrado(
                "usuario@simul.local"
        );

        verify(
                passwordEncoder
        ).encode("senha123");

        ArgumentCaptor<Usuario> captor =
                ArgumentCaptor.forClass(
                        Usuario.class
                );

        verify(
                usuarioRepository
        ).save(captor.capture());

        assertEquals(
                "usuario@simul.local",
                captor.getValue().getEmail()
        );

        assertEquals(
                "$2a$10$senhaCriptografada",
                captor.getValue().getSenha()
        );

        assertNotEquals(
                "senha123",
                captor.getValue().getSenha()
        );
    }

    @Test
    void naoDeveCadastrarQuandoEmailJaEstiverCadastrado() {
        UsuarioRequestDTO requestDTO =
                new UsuarioRequestDTO(
                        "Usuário Teste",
                        "Usuario@SIMUL.Local",
                        "senha123"
                );

        doThrow(
                new EmailJaCadastradoException(
                        "Já existe um usuário cadastrado com este e-mail."
                )
        ).when(
                usuarioValidation
        ).validarEmailNaoCadastrado(
                "usuario@simul.local"
        );

        assertThrows(
                EmailJaCadastradoException.class,
                () ->
                        usuarioService.cadastrar(
                                requestDTO
                        )
        );

        verify(
                usuarioValidation
        ).validarEmailNaoCadastrado(
                "usuario@simul.local"
        );

        verifyNoInteractions(
                usuarioMapper,
                passwordEncoder,
                usuarioRepository,
                authenticationManager,
                jwtService
        );
    }

    @Test
    void deveAutenticarUsuarioEGerarTokenJwt() {
        LoginRequestDTO requestDTO =
                new LoginRequestDTO(
                        "Usuario@SIMUL.Local",
                        "senha123"
                );

        Authentication authentication =
                mock(Authentication.class);

        when(
                authenticationManager.authenticate(
                        any(Authentication.class)
                )
        ).thenReturn(authentication);

        when(
                jwtService.gerarToken(authentication)
        ).thenReturn("token-jwt-teste");

        LoginResponseDTO resultado =
                usuarioService.autenticar(
                        requestDTO
                );

        assertEquals(
                "token-jwt-teste",
                resultado.token()
        );

        assertEquals(
                "Bearer",
                resultado.tipo()
        );

        ArgumentCaptor<Authentication> captor =
                ArgumentCaptor.forClass(
                        Authentication.class
                );

        verify(
                authenticationManager
        ).authenticate(
                captor.capture()
        );

        assertEquals(
                "usuario@simul.local",
                captor.getValue().getPrincipal()
        );

        verify(
                jwtService
        ).gerarToken(authentication);
    }

    @Test
    void deveLancarCredenciaisInvalidasQuandoAutenticacaoFalhar() {
        LoginRequestDTO requestDTO =
                new LoginRequestDTO(
                        "Usuario@SIMUL.Local",
                        "senha-incorreta"
                );

        when(
                authenticationManager.authenticate(
                        any(Authentication.class)
                )
        ).thenThrow(
                new BadCredentialsException(
                        "Bad credentials"
                )
        );

        CredenciaisInvalidasException exception =
                assertThrows(
                        CredenciaisInvalidasException.class,
                        () ->
                                usuarioService.autenticar(
                                        requestDTO
                                )
                );

        assertEquals(
                "E-mail ou senha inválidos.",
                exception.getMessage()
        );

        verifyNoInteractions(jwtService);
    }

    @Test
    void deveBuscarEntidadePorEmailQuandoUsuarioExistir() {
        String emailInformado =
                "Usuario@SIMUL.Local";

        String emailNormalizado =
                "usuario@simul.local";

        Usuario usuario =
                new Usuario();

        usuario.setId(1L);
        usuario.setEmail(emailNormalizado);

        when(
                usuarioRepository
                        .findByEmailIgnoreCase(
                                emailNormalizado
                        )
        ).thenReturn(
                Optional.of(usuario)
        );

        Usuario resultado =
                usuarioService.buscarEntidadePorEmail(
                        emailInformado
                );

        assertSame(
                usuario,
                resultado
        );

        verify(
                usuarioRepository
        ).findByEmailIgnoreCase(
                emailNormalizado
        );
    }

    @Test
    void deveLancarExcecaoQuandoUsuarioNaoForEncontradoPorEmail() {
        String emailInformado =
                "Inexistente@SIMUL.Local";

        String emailNormalizado =
                "inexistente@simul.local";

        when(
                usuarioRepository
                        .findByEmailIgnoreCase(
                                emailNormalizado
                        )
        ).thenReturn(
                Optional.empty()
        );

        UsuarioNaoEncontradoException exception =
                assertThrows(
                        UsuarioNaoEncontradoException.class,
                        () ->
                                usuarioService
                                        .buscarEntidadePorEmail(
                                                emailInformado
                                        )
                );

        assertEquals(
                "Usuário autenticado não foi encontrado.",
                exception.getMessage()
        );

        verify(
                usuarioRepository
        ).findByEmailIgnoreCase(
                emailNormalizado
        );
    }

    @Test
    void deveRetornarDtoDoUsuarioAutenticado() {
        String emailInformado =
                "Usuario@SIMUL.Local";

        String emailNormalizado =
                "usuario@simul.local";

        Usuario usuario =
                new Usuario();

        usuario.setId(1L);
        usuario.setEmail(emailNormalizado);

        UsuarioResponseDTO responseDTO =
                new UsuarioResponseDTO(
                        1L,
                        "Usuário Teste",
                        emailNormalizado,
                        PerfilUsuario.USUARIO,
                        true,
                        null,
                        null
                );

        when(
                usuarioRepository
                        .findByEmailIgnoreCase(
                                emailNormalizado
                        )
        ).thenReturn(
                Optional.of(usuario)
        );

        when(
                usuarioMapper.toResponseDTO(usuario)
        ).thenReturn(
                responseDTO
        );

        UsuarioResponseDTO resultado =
                usuarioService
                        .buscarUsuarioAutenticado(
                                emailInformado
                        );

        assertSame(
                responseDTO,
                resultado
        );

        verify(
                usuarioRepository
        ).findByEmailIgnoreCase(
                emailNormalizado
        );

        verify(
                usuarioMapper
        ).toResponseDTO(usuario);
    }
}