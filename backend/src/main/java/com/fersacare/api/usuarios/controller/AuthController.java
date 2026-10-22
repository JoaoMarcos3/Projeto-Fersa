package com.fersacare.api.usuarios.controller;

import com.fersacare.api.common.RecursoNaoEncontradoException;
import com.fersacare.api.security.UsuarioAutenticado;
import com.fersacare.api.usuarios.model.Profile;
import com.fersacare.api.usuarios.repository.ProfileRepository;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * O login em si (e-mail/senha, recuperação de senha) é feito pelo Supabase
 * Auth direto do Web/Android — este backend não reimplementa isso. Este
 * endpoint só devolve "quem é o usuário do token que você me mandou",
 * para a interface saber o nome e o perfil sem precisar perguntar de novo.
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final ProfileRepository profileRepository;
    private final UsuarioAutenticado usuarioAutenticado;

    public AuthController(ProfileRepository profileRepository, UsuarioAutenticado usuarioAutenticado) {
        this.profileRepository = profileRepository;
        this.usuarioAutenticado = usuarioAutenticado;
    }

    @GetMapping("/me")
    public Profile eu(JwtAuthenticationToken auth) {
        return profileRepository.buscarPorId(usuarioAutenticado.id(auth))
            .orElseThrow(() -> new RecursoNaoEncontradoException(
                "Token válido, mas sem cadastro em profiles. Fale com um administrador."));
    }
}
