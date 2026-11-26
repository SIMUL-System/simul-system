package com.simulsystem.backend.business.usuario.model;

import com.simulsystem.backend.core.security.EmailCriptografadoConverter;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Conta de morador ou administrador. O e-mail é gravado em minúsculas e
 * criptografado; a busca e a unicidade usam o índice emailHash.
 */
@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    /** E-mail cifrado no banco (AES-GCM); aqui no Java ele já aparece decifrado. */
    @Convert(converter = EmailCriptografadoConverter.class)
    @Column(nullable = false, length = 512)
    private String email;

    /** Índice HMAC do e-mail, para achar a conta e impedir cadastro repetido. */
    @Column(name = "email_hash", nullable = false, unique = true, length = 64)
    private String emailHash;

    @Column(nullable = false)
    private String senha;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PerfilUsuario perfil;

    @Column(nullable = false)
    private Boolean ativo;

    @Column(name = "email_verificado", nullable = false)
    private Boolean emailVerificado;

    /** Quando a pessoa aceitou os Termos de Uso e a Política de Privacidade. */
    @Column(name = "termos_aceitos_em")
    private LocalDateTime termosAceitosEm;

    /** Versão dos termos aceita (para pedir novo aceite quando o texto mudar). */
    @Column(name = "termos_versao", length = 20)
    private String termosVersao;

    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "data_atualizacao", nullable = false)
    private LocalDateTime dataAtualizacao;

    /** Preenche as datas (e os padrões) antes de inserir. */
    @PrePersist
    private void prePersist() {
        LocalDateTime agora = LocalDateTime.now();

        this.dataCriacao = agora;
        this.dataAtualizacao = agora;

        if (this.ativo == null) {
            this.ativo = true;
        }

        if (this.emailVerificado == null) {
            this.emailVerificado = false;
        }

        if (this.perfil == null) {
            this.perfil = PerfilUsuario.USUARIO;
        }
    }

    /** Atualiza a data de alteração. */
    @PreUpdate
    private void preUpdate() {
        this.dataAtualizacao = LocalDateTime.now();
    }
}
