package com.simulsystem.backend.core.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

/** Gera o JWT do login, com o e-mail no "sub" e o perfil em "roles". */
@Service
public class JwtService {

    private static final String PREFIXO_ROLE = "ROLE_";

    private final JwtEncoder jwtEncoder;
    private final JwtProperties jwtProperties;

    public JwtService(JwtEncoder jwtEncoder, JwtProperties jwtProperties) {
        this.jwtEncoder = jwtEncoder;
        this.jwtProperties = jwtProperties;
    }

    /** Token com e-mail, perfis e validade de jwt.expiration-seconds. */
    public String gerarToken(Authentication authentication) {
        Instant agora = Instant.now();

        Instant expiracao = agora.plusSeconds(jwtProperties.expirationSeconds());

        List<String> roles = authentication.getAuthorities()
                .stream()
                .map(authority -> authority.getAuthority())
                .filter(authority -> authority.startsWith(PREFIXO_ROLE))
                .map(authority ->
                        authority.substring(PREFIXO_ROLE.length())
                )
                .toList();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(authentication.getName())
                .issuedAt(agora)
                .expiresAt(expiracao)
                .claim("roles", roles)
                .build();

        return jwtEncoder
                .encode(JwtEncoderParameters.from(claims))
                .getTokenValue();
    }
}
