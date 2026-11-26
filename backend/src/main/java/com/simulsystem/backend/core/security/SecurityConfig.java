package com.simulsystem.backend.core.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

/** Regras de acesso: rotas públicas, JWT sem sessão e perfis pelo claim "roles". */
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    /** Rotas públicas, sem sessão, JWT nas demais e respostas 401/403 em ProblemDetail. */
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationConverter jwtAuthenticationConverter,
            JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint,
            JwtAccessDeniedHandler jwtAccessDeniedHandler
    ) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth

                        // Página de erro do Spring: sem isto, qualquer erro
                        // inesperado chegava ao navegador como 401.
                        .requestMatchers("/error").permitAll()

                        // Saúde do serviço (Render e ping externo).
                        .requestMatchers(HttpMethod.GET, "/api/status").permitAll()

                        // Cadastro público: não exige JWT prévio.
                        .requestMatchers(HttpMethod.POST, "/api/usuarios").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/usuarios/recuperar-senha").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/usuarios/verificar-email").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/usuarios/reenviar-verificacao").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/usuarios/redefinir-senha").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/rotas/consulta").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/rotas/areas").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/notificacoes/push/public-key").permitAll()

                        // Página pública "Quem somos" e as fotos dela.
                        .requestMatchers(HttpMethod.GET, "/api/institucional", "/api/institucional/imagens/*").permitAll()

                        .anyRequest().authenticated()
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                        .accessDeniedHandler(jwtAccessDeniedHandler)
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                        .accessDeniedHandler(jwtAccessDeniedHandler)
                        .jwt(jwt -> jwt
                                .jwtAuthenticationConverter(jwtAuthenticationConverter)
                        )
                );

        return http.build();
    }

    /** Login por e-mail e senha (BCrypt). */
    @Bean
    public AuthenticationManager authenticationManager(
            UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder
    ) {
        DaoAuthenticationProvider authenticationProvider = new DaoAuthenticationProvider(userDetailsService);

        authenticationProvider.setPasswordEncoder(passwordEncoder);

        return new ProviderManager(authenticationProvider);
    }

    /** Lê o claim "roles" como ROLE_USUARIO / ROLE_ADMIN. */
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();

        authoritiesConverter.setAuthoritiesClaimName("roles");
        authoritiesConverter.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter authenticationConverter = new JwtAuthenticationConverter();

        authenticationConverter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);

        return authenticationConverter;
    }
}
