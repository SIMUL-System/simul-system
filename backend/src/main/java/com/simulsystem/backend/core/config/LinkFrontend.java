package com.simulsystem.backend.core.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Monta links absolutos para páginas do front-end (usados nos e-mails). */
@Component
public class LinkFrontend {

    private final String urlBase;

    public LinkFrontend(@Value("${simul.frontend.url}") String urlFrontend) {
        if (urlFrontend == null || urlFrontend.isBlank()) {
            throw new IllegalStateException("SIMUL_FRONTEND_URL não foi configurada.");
        }

        this.urlBase = urlFrontend.replaceAll("/+$", "");
    }

    /** Ex.: para("/verificar-email?token=abc") → "https://site/verificar-email?token=abc". */
    public String para(String caminho) {
        return urlBase + caminho;
    }
}
