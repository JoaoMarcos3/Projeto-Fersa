package com.fersacare.api.catalogo.repository;

import com.fersacare.api.catalogo.dto.LubrificacaoDTO;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Array;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class LubrificacaoRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public LubrificacaoRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<LubrificacaoDTO> buscarPorPeca(UUID pecaId) {
        String sql = """
            select tipo, intervalo, quantidade, procedimento, cuidados, erros_comuns
            from lubrificacoes where peca_id = :pecaId
            """;
        try {
            LubrificacaoDTO dto = jdbc.queryForObject(sql, new MapSqlParameterSource("pecaId", pecaId), (rs, rowNum) ->
                new LubrificacaoDTO(
                    rs.getString("tipo"),
                    rs.getString("intervalo"),
                    rs.getString("quantidade"),
                    rs.getString("procedimento"),
                    paraListaDeTexto(rs.getArray("cuidados")),
                    paraListaDeTexto(rs.getArray("erros_comuns"))
                ));
            return Optional.ofNullable(dto);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    private static List<String> paraListaDeTexto(Array coluna) {
        if (coluna == null) return List.of();
        try {
            return Arrays.asList((String[]) coluna.getArray());
        } catch (SQLException e) {
            throw new IllegalStateException("Falha ao ler coluna array do Postgres", e);
        }
    }
}
