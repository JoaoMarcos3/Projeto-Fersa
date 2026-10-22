package com.fersacare.api.security;

import com.fersacare.api.usuarios.model.Profile;
import com.fersacare.api.usuarios.repository.ProfileRepository;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

/**
 * O token do Supabase prova QUEM é o usuário (claim "sub" = id em auth.users),
 * mas não carrega o perfil do FERSA Care (mecânico/técnico/admin/cliente) —
 * isso mora na nossa tabela `profiles`. Por isso, a cada request autenticado,
 * buscamos o perfil e o transformamos numa authority (ex: ROLE_TECNICO), que
 * é o que @PreAuthorize usa para autorizar.
 *
 * Se o usuário tem um JWT válido mas ainda não tem linha em `profiles`
 * (cadastro incompleto), ele fica autenticado mas sem nenhuma role — toda
 * rota protegida por @PreAuthorize("hasRole(...)") vai negar o acesso (403),
 * o que é o comportamento seguro por padrão.
 */
@Component
public class SupabaseJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final ProfileRepository profileRepository;

    public SupabaseJwtAuthenticationConverter(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        UUID usuarioId = UUID.fromString(jwt.getSubject());
        List<GrantedAuthority> authorities = profileRepository.buscarPorId(usuarioId)
            .map(Profile::perfil)
            .map(perfil -> List.<GrantedAuthority>of(new SimpleGrantedAuthority("ROLE_" + perfil.name())))
            .orElseGet(List::of);

        return new JwtAuthenticationToken(jwt, authorities, jwt.getSubject());
    }
}
