package com.fersacare.api.usuarios.repository;

import com.fersacare.api.usuarios.model.PerfilUsuario;
import com.fersacare.api.usuarios.model.Profile;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public class ProfileRepository {

    private final JdbcTemplate jdbc;

    public ProfileRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<Profile> MAPPER = (rs, rowNum) -> new Profile(
        UUID.fromString(rs.getString("id")),
        rs.getString("nome"),
        PerfilUsuario.valueOf(rs.getString("perfil")),
        rs.getString("cliente_id") != null ? UUID.fromString(rs.getString("cliente_id")) : null
    );

    /** Usado pela segurança a cada request autenticado — mantenha essa query simples e rápida. */
    public Optional<Profile> buscarPorId(UUID id) {
        try {
            Profile profile = jdbc.queryForObject(
                "select id, nome, perfil, cliente_id from profiles where id = ?",
                MAPPER, id
            );
            return Optional.ofNullable(profile);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }
}
