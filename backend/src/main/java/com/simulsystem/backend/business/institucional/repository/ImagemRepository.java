package com.simulsystem.backend.business.institucional.repository;

import com.simulsystem.backend.business.institucional.model.Imagem;

import org.springframework.data.jpa.repository.JpaRepository;

/** Acesso às imagens guardadas no banco. */
public interface ImagemRepository extends JpaRepository<Imagem, Long> {
}
