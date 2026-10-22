package com.fersacare.api.security;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.UUID;

/** Pequeno utilitário para controllers/services lerem "quem está logado" sem repetir o cast ao Jwt. */
@Component
public class UsuarioAutenticado {

    public UUID id(JwtAuthenticationToken auth) {
        Jwt jwt = auth.getToken();
        return UUID.fromString(jwt.getSubject());
    }
}
