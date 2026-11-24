package com.simulsystem.backend.core.util;

import java.util.Locale;

/** Normalizações de texto usadas em mais de um domínio. */
public final class Textos {

    private Textos() {
    }

    /** E-mail sem espaços nas pontas e em minúsculas (é assim que fica gravado). */
    public static String normalizarEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }
}
