package com.simulsystem.backend.business.institucional.repository;

import com.simulsystem.backend.business.institucional.model.ConteudoInstitucional;

import org.springframework.data.jpa.repository.JpaRepository;

/** Acesso aos textos do "Quem somos". */
public interface ConteudoInstitucionalRepository extends JpaRepository<ConteudoInstitucional, Long> {
}
